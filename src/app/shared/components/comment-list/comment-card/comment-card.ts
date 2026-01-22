import { Component, HostListener, inject, input, output } from '@angular/core';
import { Comment } from '@core/models/interface/comments';
import { CommentMenuItems } from '@core/models/interface/menus';
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
  commentDetailAction = output<Comment>();

  activeDropdown = this.dropdownService.activeDropdown;

  readonly commentMenuItems: CommentMenuItems[] = [
    {
      type: 'comment',
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
      type: 'comment',

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

  handleCommentNavigate(event: MouseEvent) {
    event.stopPropagation();
    this.commentDetailAction.emit(this.comment());
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
