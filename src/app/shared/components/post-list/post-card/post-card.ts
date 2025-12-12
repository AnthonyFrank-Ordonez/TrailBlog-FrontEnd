import { NgClass } from '@angular/common';
import { Component, ElementRef, inject, input, output, ViewChild } from '@angular/core';
import { MenuClickEvent, MenuItems } from '@core/models/interface/menus';
import { Post, PostActionPayload } from '@core/models/interface/posts';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AuthService } from '@core/services/auth.service';
import { PostService } from '@core/services/post.service';
import { DropdownMenu } from '@shared/components/dropdown-menu/dropdown-menu';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';

@Component({
  selector: 'app-post-card',
  imports: [TimeagoPipe, InitialsPipe, NgClass, DropdownMenu],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  @ViewChild('reactionContainer') reactionContainer!: ElementRef;
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('shareContainer') shareContainer!: ElementRef;

  private postService = inject(PostService);
  private authService = inject(AuthService);

  post = input.required<Post>();
  currentPath = input<string>();
  reactionList = input<ReactionList[]>([]);
  menuItems = input<MenuItems[]>([]);
  shareItems = input<MenuItems[]>([]);
  isUserJoined = input<boolean>(false);
  isPostMenuOpen = input<boolean>(false);
  isPostReactModalOpen = input<boolean>(false);
  isPostShareModalOpen = input<boolean>(false);
  postMenu = output<string>();
  reactModal = output<string>();
  shareModal = output<string>();
  copyAction = output<string>();
  shareAction = output<PostActionPayload>();
  menuAction = output<PostActionPayload>();
  postDetailAction = output<string>();
  toggleJoinAction = output<string>();

  isAuthenticated = this.authService.isAuthenticated;
  activeDropdown = this.postService.activeDropdown;

  handleMenuItems(event: MouseEvent) {
    event?.stopPropagation();

    this.postMenu.emit(this.post().id);
  }

  handleReactModal(event: MouseEvent) {
    event.stopPropagation();

    this.reactModal.emit(this.post().id);
  }

  handleShareModal(event: MouseEvent) {
    event.stopPropagation();

    this.shareModal.emit(this.post().id);
  }

  handleShareItemClick(data: MenuClickEvent) {
    data.event.stopPropagation();

    if (data.type === 'post') {
      this.shareAction.emit({
        action: data.action,
        post: this.post(),
      });
    }
  }

  handleMenuItemClick(data: MenuClickEvent) {
    data.event.stopPropagation();

    if (data.type === 'post') {
      this.menuAction.emit({
        action: data.action,
        post: this.post(),
      });
    }
  }

  handlePostDetailNavigate(event: MouseEvent) {
    event.stopPropagation();

    this.postDetailAction.emit(this.post().slug);
  }

  handleSelectReactionAction(reactionId: number, event: MouseEvent) {
    event.stopPropagation();

    const reactionRequest: ReactionRequest = {
      post: this.post(),
      data: { reactionId },
    };

    this.postService.selectReaction(reactionRequest);
  }

  toggleJoin(event?: MouseEvent): void {
    event?.stopPropagation();
    this.toggleJoinAction.emit(this.post().communityId);
  }

  hasReaction(reactionId: number): boolean {
    return this.postService.hasReaction(this.post().userReactionsIds, reactionId);
  }

  getReactionById(id: number): ReactionList | undefined {
    return this.postService.getReactionById(id);
  }
}
