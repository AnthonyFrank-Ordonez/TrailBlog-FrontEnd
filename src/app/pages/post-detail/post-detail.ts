import { NgClass, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddCommentRequest } from '@core/models/interface/comments';
import { PostDropdownItems } from '@core/models/interface/posts';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { UserService } from '@core/services/user.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { DropdownMenu } from '@shared/components/dropdown-menu/dropdown-menu';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError } from '@shared/utils/utils';
import { debounceTime, retry, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-post-detail',
  imports: [
    NgClass,
    NgOptimizedImage,
    InitialsPipe,
    TimeagoPipe,
    DropdownMenu,
    ReactiveFormsModule,
    ZardDividerComponent,
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  @ViewChild('reactionContainer') reactionContainer!: ElementRef;
  @ViewChild('commentFormContainer') commentFormContainer!: ElementRef;
  @ViewChild('toggleCommentBtn') toggleCommentBtn!: ElementRef;
  @ViewChild('commentArea') commentArea!: ElementRef;
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('shareContainer') shareContainer!: ElementRef;
  @ViewChildren('commentMenuContainers') commentMenuContainers!: QueryList<ElementRef>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private reaction$ = new Subject<ReactionRequest>();

  readonly menuItems: PostDropdownItems[] = [
    {
      label: 'Save',
      iconClass: 'icon-tabler-bookmark',
      svgPath: ['M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z'],
      ownerOnly: false,
      forAuthenticated: true,
      hideForOwner: false,
      action: 'save',
    },
    {
      label: 'Hide',
      iconClass: 'icon-tabler-eye-off',
      svgPath: [
        'M10.585 10.587a2 2 0 0 0 2.829 2.828',
        'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87',
        'M3 3l18 18',
      ],
      ownerOnly: false,
      forAuthenticated: true,
      hideForOwner: false,
      action: 'hide',
    },
    {
      label: 'Report',
      iconClass: 'icon-tabler-message-report',
      svgPath: [
        'M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z',
        'M12 8v3',
        'M12 14v.01',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      hideForOwner: true,
      action: 'report',
    },
    {
      label: 'Delete',
      iconClass: 'icon-tabler-trash',
      svgPath: [
        'M4 7l16 0',
        'M10 11l0 6',
        'M14 11l0 6',
        'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
        'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
      ],
      ownerOnly: true,
      forAuthenticated: true,
      hideForOwner: false,
      action: 'delete',
    },
  ];

  readonly shareItems: PostDropdownItems[] = [
    {
      label: 'Copy',
      iconClass: 'icon-tabler-clipboard',
      svgPath: [
        'M17.997 4.17a3 3 0 0 1 2.003 2.83v12a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 2.003 -2.83a4 4 0 0 0 3.997 3.83h4a4 4 0 0 0 3.98 -3.597zm-3.997 -2.17a2 2 0 1 1 0 4h-4a2 2 0 1 1 0 -4z',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      action: 'copy',
    },
    {
      label: 'Embed',
      iconClass: 'icon-tabler-file-code-2',
      svgPath: [
        'M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2 9h-1a1 1 0 0 0 -1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007v-3a1 1 0 0 0 0 -2m5 0h-1a1 1 0 0 0 0 2v3a1 1 0 0 0 0 2h1a1 1 0 0 0 1 -1v-5a1 1 0 0 0 -1 -1m-.001 -8.001l4.001 4.001h-4z',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      action: 'embed',
    },
  ];

  readonly commentMenuItems: PostDropdownItems[] = [
    {
      label: 'Report',
      iconClass: 'icon-tabler-message-report',
      svgPath: [
        'M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z',
        'M12 8v3',
        'M12 14v.01',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      hideForOwner: true,
      action: 'report',
    },
    {
      label: 'Delete',
      iconClass: 'icon-tabler-trash',
      svgPath: [
        'M4 7l16 0',
        'M10 11l0 6',
        'M14 11l0 6',
        'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
        'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
      ],
      ownerOnly: true,
      forAuthenticated: true,
      hideForOwner: false,
      action: 'delete',
    },
  ];

  post = this.postService.postDetail;
  activeDropdown = this.postService.activeDropdown;
  isPostLoading = this.postService.isPostLoading;
  isAuthenticated = this.authService.isAuthenticated;
  token = this.authService.token;
  isCommentSelected = signal<boolean>(false);
  showReactionModal = signal<boolean>(false);
  private slug = signal<string | null>(null);

  commentForm: FormGroup = this.createForm();

  reactionList: ReactionList[] = [
    { id: 1, type: '😂', value: 'laughReact' },
    { id: 2, type: '🥲', value: 'sadReact' },
    { id: 3, type: '😡', value: 'angryReact' },
    { id: 4, type: '😍', value: 'loveReact' },
    { id: 5, type: '🚀', value: 'rocketReact' },
  ];

  constructor() {
    effect(() => {
      const token = this.token();
      const currentSlug = this.slug();

      if (currentSlug) {
        this.fetchPost(currentSlug);
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.slug.set(slug);
    });

    this.reaction$
      .pipe(
        debounceTime(600),
        takeUntilDestroyed(this.destroyRef),
        switchMap((reactionData: ReactionRequest) =>
          this.postService.toggleReactions(this.post().id, reactionData),
        ),
      )
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  fetchPost(slug: string) {
    this.postService
      .loadPostDetail(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  toggleReactionModal(): void {
    if (this.showReactionModal()) {
      this.closeReactModal();
    }

    this.showReactionModal.set(true);
  }

  toggleMenuItems(): void {
    if (this.isPostMenuOpen) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('menu', this.post().id);
  }

  toggleShareItems(): void {
    if (this.isShareModalOpen) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('share', this.post().id);
  }

  toggleBack(): void {
    this.postService.closeDropdown();
    this.router.navigate(['/']);
  }

  toggleCommentMenu(event: MouseEvent, id: string) {
    event.stopPropagation();

    if (this.activeCommentMenuId === id) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('menu', id);
  }

  selectReaction(reactionId: number): void {
    const reactionData = {
      reactionId: reactionId,
    };

    this.reaction$.next(reactionData);

    this.closeReactModal();
  }

  closeReactModal(): void {
    setTimeout(() => {
      this.showReactionModal.set(false);
    }, 200);
  }

  showCommentSection(): void {
    this.isCommentSelected.set(true);

    setTimeout(() => {
      if (this.commentArea) {
        this.commentArea.nativeElement.focus();
      }
    }, 0);
  }

  cancelCommentSection() {
    this.isCommentSelected.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      !this.reactionContainer ||
      !this.commentFormContainer ||
      !this.toggleCommentBtn ||
      !this.menuContainer ||
      !this.shareContainer ||
      !this.commentMenuContainers
    ) {
      return;
    }

    const clickedInside = this.reactionContainer.nativeElement.contains(event.target);
    const insideCommentForm = this.commentFormContainer.nativeElement.contains(event.target);
    const clickToggleBtn = this.toggleCommentBtn.nativeElement.contains(event.target);
    const insideMenuModal = this.menuContainer.nativeElement.contains(event.target);
    const insideShareModal = this.shareContainer.nativeElement.contains(event.target);

    if (this.showReactionModal() && !clickedInside) {
      this.closeReactModal();
    }

    if (this.isCommentSelected() && !insideCommentForm && !clickToggleBtn) {
      this.isCommentSelected.set(false);
    }

    if (this.isPostMenuOpen && !insideMenuModal) {
      this.postService.closeDropdown();
    }

    if (this.isShareModalOpen && !insideShareModal) {
      this.postService.closeDropdown();
    }

    if (this.activeCommentMenuId) {
      const clickAnyCommentContainer = this.commentMenuContainers.some((container) =>
        container.nativeElement.contains(event.target),
      );

      if (!clickAnyCommentContainer) {
        this.postService.closeDropdown();
      }
    }
  }

  hasReaction(reactionId: number): boolean {
    return this.post().userReactionsIds.includes(reactionId);
  }

  getReactionById(id: number): ReactionList | undefined {
    return this.reactionList.find((r) => r.id === id);
  }

  async handleCopy(event?: MouseEvent) {
    event?.stopPropagation();

    const endodedSlug = encodeURIComponent(this.post().slug);
    const url = `${window.location.origin}/post/${endodedSlug}`;

    await this.postService.copyPostLink(url);
    this.postService.closeDropdown();
  }

  onCommentSubmit() {
    if (this.commentForm.invalid) {
      return;
    }

    const commentData: AddCommentRequest = {
      postId: this.post().id,
      content: this.commentForm.value.content?.trim(),
    };

    this.postService
      .addPostComment(commentData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resetCommentForm();
        },
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  private createForm() {
    return this.fb.group({
      content: ['', Validators.required],
    });
  }

  private resetCommentForm() {
    this.commentForm.reset();

    this.isCommentSelected.set(false);
  }

  get isPostMenuOpen() {
    const active = this.activeDropdown();
    return active.type === 'menu' && active.id === this.post().id;
  }

  get isPostReactModalOpen() {
    const active = this.activeDropdown();
    return active.type === 'reaction' && active.id === this.post().id;
  }

  get isShareModalOpen() {
    const active = this.activeDropdown();
    return active.type === 'share' && active.id === this.post().id;
  }

  get activeCommentMenuId() {
    const active = this.activeDropdown();
    if (
      active.type === 'menu' &&
      this.post().comments?.some((comment) => comment.id === active.id)
    ) {
      return active.id;
    }
    return null;
  }
}
