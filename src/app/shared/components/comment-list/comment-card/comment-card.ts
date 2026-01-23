import { Component, HostListener, inject, input, output } from '@angular/core';
import { Comment, CommentActionPayload } from '@core/models/interface/comments';
import { CommentMenuItems, MenuClickEvent } from '@core/models/interface/menus';
import { DropdownService } from '@core/services/dropdown.service';
import { DropdownMenu } from '@shared/components/dropdown-menu/dropdown-menu';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';

@Component({
  selector: 'app-comment-card',
  imports: [TimeagoPipe, InitialsPipe, DropdownMenu],
  templateUrl: './comment-card.html',
  styleUrl: './comment-card.css',
})
export class CommentCard {
  private dropdownService = inject(DropdownService);

  comment = input.required<Comment>();
  menuItems = input<CommentMenuItems[]>([]);
  commentDetailAction = output<Comment>();
  commentMenuAction = output<CommentActionPayload>();

  activeDropdown = this.dropdownService.activeDropdown;

  handleCommentNavigate(event: MouseEvent) {
    event.stopPropagation();
    this.commentDetailAction.emit(this.comment());
  }

  handleCommentAction(data: MenuClickEvent) {
    this.commentMenuAction.emit({
      clickEvent: data,
      comment: this.comment(),
    });
  }

  toggleCommentMenu(event: MouseEvent, id: string) {
    event.stopPropagation();

    if (this.getActiveCommentMenuId() === id) {
      this.dropdownService.closeDropdown();
      return;
    }

    this.dropdownService.updateActiveDropdown('menu', id);
  }

  getActiveCommentMenuId(): string | null {
    const active = this.activeDropdown();

    if (active.type === 'menu' && this.comment().id === active.id) {
      return active.id;
    }

    return null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    const insideModal = target.closest('[data-modal-type]');
    const isButton = target.closest('.action-btn, button');
    const clickedAnyCommentContainer = target.closest('comment-menu-container');

    if (!insideModal && !isButton) {
      this.dropdownService.closeDropdown();
    }

    if (this.getActiveCommentMenuId()) {
      if (!clickedAnyCommentContainer) {
        this.dropdownService.closeDropdown();
      }
    }
  }
}
