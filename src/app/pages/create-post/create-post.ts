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
import { UserCommunities } from '@core/models/interface/community';
import { CommunityService } from '@core/services/community.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
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

  private communityService = inject(CommunityService);
  private fb = inject(FormBuilder);
  private destoryRef = inject(DestroyRef);

  userCommunities = this.communityService.userCommunities;
  filteredUserCommunities = signal<UserCommunities[]>([]);
  isCommunitySelectionSelected = signal<boolean>(false);
  selectedCommunity = signal<UserCommunities | null>(null);

  searchControl = new FormControl('');
  postForm: FormGroup = this.createForm();

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredUserCommunities.set([...this.userCommunities()]);
    console.log(this.filteredUserCommunities());

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destoryRef))
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

  selectCommunity(community: UserCommunities) {
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isCommunitySelectionSelected()) return;

    const clickedInsideForm = this.formContainer?.nativeElement.contains(event.target);
    const clickedButton = this.toggleButton?.nativeElement.contains(event.target);
    const clickedDropdown = this.dropdownContainer?.nativeElement.contains(event.target);

    if (!clickedInsideForm && !clickedButton && !clickedDropdown) {
      this.isCommunitySelectionSelected.set(false);
      this.searchControl.setValue('');
    }
  }
}
