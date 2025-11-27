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
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddCommentRequest } from '@core/models/interface/comments';
import {
  ActionClickEvent,
  PostActionPayload,
  PostDropdownItems,
} from '@core/models/interface/posts';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { DropdownMenu } from '@shared/components/dropdown-menu/dropdown-menu';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError, setupReactionSubject, SUCCESS_MESSAGES } from '@shared/utils/utils';
import { catchError } from 'rxjs';

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
  @ViewChild('commentArea') commentArea!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

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
      fill: false,
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
      fill: false,
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
      fill: false,
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
      fill: false,
    },
  ];

  post = this.postService.postDetail;
  activeDropdown = this.postService.activeDropdown;
  isPostLoading = this.postService.isPostLoading;
  isAuthenticated = this.authService.isAuthenticated;
  token = this.authService.token;
  isCommentSelected = signal<boolean>(false);
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

    setupReactionSubject(this.postService, this.messageService, this.destroyRef);
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

  openPostMenu(): void {
    this.postService.toggleDropdown('menu', this.post().id);
  }

  openReactModal(): void {
    this.postService.toggleDropdown('reaction', this.post().id);
  }

  openShareModal(): void {
    this.postService.toggleDropdown('share', this.post().id);
  }

  isPostMenuOpen(): boolean {
    return this.postService.isDropDownOpen('menu', this.post().id);
  }

  isPostReactModalOpen(): boolean {
    return this.postService.isDropDownOpen('reaction', this.post().id);
  }

  isPostShareModalOpen(): boolean {
    return this.postService.isDropDownOpen('share', this.post().id);
  }

  toggleBack(): void {
    this.postService.closeDropdown();
    this.router.navigate(['/']);
  }

  toggleCommentMenu(event: MouseEvent, id: string) {
    event.stopPropagation();

    if (this.getActiveCommentMenuId() === id) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('menu', id);
  }
  showCommentSection(): void {
    this.isCommentSelected.set(true);
    this.postService.closeDropdown();

    setTimeout(() => {
      this.commentArea.nativeElement.focus();
    }, 0);
  }

  selectReaction(reactionId: number): void {
    const reactionRequest: ReactionRequest = {
      post: this.post(),
      data: {
        reactionId: reactionId,
      },
    };

    this.postService.selectReaction(reactionRequest);
  }

  cancelCommentSection() {
    this.isCommentSelected.set(false);
  }

  handleGetPostMenuItems(): PostDropdownItems[] {
    return this.postService.getMenuItems(this.post());
  }

  handlePostMenuActions(data: ActionClickEvent) {
    const handler = this.postService.menuActionHandlers.get(data.action);

    if (handler) {
      handler(this.post(), 'detail')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            const message = SUCCESS_MESSAGES.get(data.action);
            this.messageService.showMessage('success', message);
          },
          error: (error: HttpErrorResponse) => {
            handleHttpError(error, this.messageService);
          },
        });
    }
  }

  async handleShareActions(data: ActionClickEvent) {
    await this.postService.handlePostShareAction(data.action, this.post());
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const insideModal = target.closest('[data-modal-type]');
    const isButton = target.closest('.action-btn, button');
    const insideCommentForm = target.closest('.comment-form');
    const clickToggleBtn = target.closest('.comment-action-btn');
    const clickedAnyCommentContainer = target.closest('comment-menu-container');

    if (this.isCommentSelected() && !insideCommentForm && !clickToggleBtn) {
      this.isCommentSelected.set(false);
    }

    if (!insideModal && !isButton) {
      this.postService.closeDropdown();
    }

    if (this.getActiveCommentMenuId()) {
      if (!clickedAnyCommentContainer) {
        this.postService.closeDropdown();
      }
    }
  }

  hasReaction(reactionId: number): boolean {
    return this.postService.hasReaction(this.post().userReactionsIds, reactionId);
  }

  getReactionById(id: number): ReactionList | undefined {
    return this.postService.getReactionById(id);
  }

  getActiveCommentMenuId(): string | null {
    const active = this.activeDropdown();
    if (
      active.type === 'menu' &&
      this.post().comments?.some((comment) => comment.id === active.id)
    ) {
      return active.id;
    }
    return null;
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
}
