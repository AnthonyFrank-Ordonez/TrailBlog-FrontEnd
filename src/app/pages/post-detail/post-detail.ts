import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  runInInjectionContext,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { UserService } from '@core/services/user.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError } from '@shared/utils/utils';
import { debounceTime, Subject, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-post-detail',
  imports: [
    NgClass,
    InitialsPipe,
    TimeagoPipe,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownDirective,
    ZardDividerComponent,
  ],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  @ViewChild('reactionContainer') reactionContainer!: ElementRef;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private reaction$ = new Subject<ReactionRequest>();

  post = this.postService.postDetail;
  isPostLoading = this.postService.isPostLoading;
  isAuthenticated = this.authService.isAuthenticated;
  showReactionModal = signal<boolean>(false);

  reactionList: ReactionList[] = [
    { id: 1, type: '😂', value: 'laughReact' },
    { id: 2, type: '🥲', value: 'sadReact' },
    { id: 3, type: '😡', value: 'angryReact' },
    { id: 4, type: '😍', value: 'loveReact' },
    { id: 5, type: '🚀', value: 'rocketReact' },
  ];

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');

      if (slug) {
        this.fetchPost(slug);
      }
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

  toggleBack(): void {
    this.router.navigate(['/']);
    this.userService.setActiveUserTab('home');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.showReactionModal()) return;

    const clickedInside = this.reactionContainer.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.closeReactModal();
    }
  }

  hasReaction(reactionId: number): boolean {
    return this.post().userReactionsIds.includes(reactionId);
  }

  getReactionById(id: number): ReactionList | undefined {
    return this.reactionList.find((r) => r.id === id);
  }
}
