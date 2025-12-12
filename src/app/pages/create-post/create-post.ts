import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Communities } from '@core/models/interface/community';
import { CreatePostRequest } from '@core/models/interface/posts';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { debounce, handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-create-post',
  imports: [ReactiveFormsModule, InitialsPipe],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('formContainer') formContainer!: ElementRef;
  @ViewChild('toggleButton') toggleButton!: ElementRef;
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  @ViewChild('dropdownToggle') dropdownToggle!: ElementRef;
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;

  private router = inject(Router);
  private communityService = inject(CommunityService);
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  userCommunities = this.communityService.userCommunities;
  isSubmitting = this.postService.isSubmitting;

  isCommunitySelectionSelected = signal<boolean>(false);
  selectedCommunity = signal<Communities | null>(null);
  isDropdownOpen = signal<boolean>(false);
  searchControl = new FormControl('');
  searchTerm = signal<string>('');
  postForm: FormGroup = this.createForm();

  filteredUserCommunities = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const communities = this.userCommunities();

    if (!term) return communities;

    return communities.filter(
      (community) =>
        community.communityName.toLowerCase().includes(term) ||
        community.description?.toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(debounce(this.destroyRef, 400)).subscribe((searchTerm) => {
      this.searchTerm.set(searchTerm || '');
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      communityId: ['', Validators.required],
    });
  }

  showCommunitySelection(): void {
    this.isCommunitySelectionSelected.set(true);
    this.searchControl.setValue('');

    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }

  selectCommunity(community: Communities) {
    this.selectedCommunity.set(community);

    this.postForm.patchValue({
      communityId: community.id,
    });

    this.isCommunitySelectionSelected.set(false);
    this.searchControl.setValue('');
  }

  removeCommunity(): void {
    this.selectedCommunity.set(null);
    this.postForm.patchValue({
      communityId: '',
    });
  }

  get titleErrors() {
    const control = this.postForm.get('title');
    return control?.errors && control.touched;
  }

  get contentErrors() {
    const control = this.postForm.get('content');
    return control?.errors && control.touched;
  }

  get communityErrors() {
    const control = this.postForm.get('communityId');
    return control?.errors && control.touched;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Handle community dropdown
    if (this.isCommunitySelectionSelected()) {
      const clickedInsideForm = this.formContainer?.nativeElement.contains(event.target);
      const clickedButton = this.toggleButton?.nativeElement.contains(event.target);
      const clickedDropdown = this.dropdownContainer?.nativeElement.contains(event.target);

      if (clickedInsideForm && !clickedButton && !clickedDropdown) {
        this.isCommunitySelectionSelected.set(false);
        this.searchControl.setValue('');
      }
    }

    // Handle post action dropdown
    if (this.isDropdownOpen()) {
      const clickedToggle = this.dropdownToggle?.nativeElement.contains(event.target);
      const clickedMenu = this.dropdownMenu?.nativeElement.contains(event.target);

      if (!clickedToggle && !clickedMenu) {
        this.isDropdownOpen.set(false);
      }
    }
  }

  toggleDropdown() {
    this.isDropdownOpen.update((value) => !value);
  }

  onPostSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    const postData: CreatePostRequest = {
      title: this.postForm.value.title.trim(),
      content: this.postForm.value.content.trim(),
      communityId: this.postForm.value.communityId,
    };

    this.postService
      .createPost(postData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  onDraftSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    // TODO: Implement draft creation logic
    // This is a placeholder for draft functionality
    console.log('Draft creation - to be implemented');
    this.isDropdownOpen.set(false);
    this.messageService.showMessage('information', 'Draft feature coming soon!');
  }
}
