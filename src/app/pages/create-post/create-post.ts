import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
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
  ɵInternalFormsSharedModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Communities } from '@core/models/interface/community';
import { CreatePostRequest } from '@core/models/interface/posts';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { handleHttpError } from '@shared/utils/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-create-post',
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule, InitialsPipe],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('formContainer') formContainer!: ElementRef;
  @ViewChild('toggleButton') toggleButton!: ElementRef;
  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;

  private router = inject(Router);
  private communityService = inject(CommunityService);
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  userCommunities = this.communityService.userCommunities;
  isSubmitting = this.postService.isSubmitting;

  filteredUserCommunities = signal<Communities[]>([]);
  isCommunitySelectionSelected = signal<boolean>(false);
  selectedCommunity = signal<Communities | null>(null);

  searchControl = new FormControl('');
  postForm: FormGroup = this.createForm();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredUserCommunities.set([...this.userCommunities()]);
    console.log(this.filteredUserCommunities());

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchTerm) => {
        this.filterUserCommunities(searchTerm || '');
      });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      communityId: ['', Validators.required],
    });
  }

  private filterUserCommunities(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredUserCommunities.set([...this.userCommunities()]);
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredUserCommunities.set(
      this.userCommunities().filter(
        (community) =>
          community.communityName.toLowerCase().includes(term) ||
          community.description?.toLowerCase().includes(term),
      ),
    );
  }

  showCommunitySelection(): void {
    this.isCommunitySelectionSelected.set(true);
    this.searchControl.setValue('');
    this.filteredUserCommunities.set([...this.userCommunities()]);

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
    if (!this.isCommunitySelectionSelected()) return;

    const clickedInsideForm = this.formContainer?.nativeElement.contains(event.target);
    const clickedButton = this.toggleButton?.nativeElement.contains(event.target);
    const clickedDropdown = this.dropdownContainer?.nativeElement.contains(event.target);

    if (clickedInsideForm && !clickedButton && !clickedDropdown) {
      this.isCommunitySelectionSelected.set(false);
      this.searchControl.setValue('');
    }
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
}
