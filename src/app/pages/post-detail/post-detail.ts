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
import { MenuClickEvent, MenuItems, PostMenuItems } from '@core/models/interface/menus';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { UserService } from '@core/services/user.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { DropdownMenu } from '@shared/components/dropdown-menu/dropdown-menu';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError, setupReactionSubject, SUCCESS_MESSAGES } from '@shared/utils/utils';
import { Button } from '@shared/components/button/button';
import { DropdownService } from '@core/services/dropdown.service';
import { CommentService } from '@core/services/comment.service';
import { CommentList } from '@shared/components/comment-list/comment-list';

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
    Button,
    CommentList,
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
  private dropdownService = inject(DropdownService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  post = this.postService.postDetail;
  activeDropdown = this.dropdownService.activeDropdown;
  isPostLoading = this.postService.isPostLoading;
  isAuthenticated = this.authService.isAuthenticated;
  errorMessage = this.postService.errorMessage;
  token = this.authService.token;
  isCommentSelected = signal<boolean>(false);
  isAdmin = this.userService.isAdmin;
  private slug = signal<string | null>(null);

  commentForm: FormGroup = this.createForm();

  reactionList = this.postService.getReactionList();

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

    this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragment) => {
      if (fragment) {
        this.scrollToComment(fragment);
      }
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

  openPostMenu(): void {
    this.dropdownService.toggleDropdown('menu', this.post().id);
  }

  openReactModal(): void {
    this.dropdownService.toggleDropdown('reaction', this.post().id);
  }

  openShareModal(): void {
    this.dropdownService.toggleDropdown('share', this.post().id);
  }

  isPostMenuOpen(): boolean {
    return this.dropdownService.isDropDownOpen('menu', this.post().id);
  }

  isPostReactModalOpen(): boolean {
    return this.dropdownService.isDropDownOpen('reaction', this.post().id);
  }

  isPostShareModalOpen(): boolean {
    return this.dropdownService.isDropDownOpen('share', this.post().id);
  }

  toggleBack(): void {
    this.dropdownService.closeDropdown();
    this.router.navigate(['/']);
  }

  toggleCommentMenu(event: MouseEvent, id: string) {
    event.stopPropagation();

    if (this.getActiveCommentMenuId() === id) {
      this.dropdownService.closeDropdown();
      return;
    }

    this.dropdownService.updateActiveDropdown('menu', id);
  }

  showCommentSection(): void {
    this.isCommentSelected.set(true);
    this.dropdownService.closeDropdown();

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

  handleGetPostMenuItems(): MenuItems[] {
    return this.postService.getMenuItems(this.post());
  }

  handleGetShareMenuItems(): MenuItems[] {
    return this.postService.getShareMenuItems();
  }

  handlePostMenuActions(data: MenuClickEvent) {
    if (data.type !== 'post') return;

    const handler = this.postService.postMenuActionHandlers.get(data.action);

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

  async handleShareActions(data: MenuClickEvent) {
    if (data.type !== 'post') return;

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
      this.dropdownService.closeDropdown();
    }

    if (this.getActiveCommentMenuId()) {
      if (!clickedAnyCommentContainer) {
        this.dropdownService.closeDropdown();
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

  private scrollToComment(commentId: string) {
    setTimeout(() => {
      const element = document.getElementById(commentId);

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight the comment
        element.classList.add('highlight');

        setTimeout(() => {
          element.classList.remove('highlight');
        }, 2000);
      }
    }, 500);
  }
}
