import { Component, DestroyRef, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommunityService } from '@core/services/community.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { handleHttpError } from '@shared/utils/utils';
import { MessageService } from '@core/services/message.service';
import { forkJoin } from 'rxjs';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { Button } from '@shared/components/button/button';
import { PostList } from '@shared/components/post-list/post-list';
import { Tooltip } from '@shared/components/tooltip/tooltip';
import { DropdownService } from '@core/services/dropdown.service';

@Component({
  selector: 'app-community-detail',
  imports: [InitialsPipe, Button, PostList, Tooltip],
  templateUrl: './community-detail.html',
  styleUrl: './community-detail.css',
})
export class CommunityDetail implements OnInit {
  private authService = inject(AuthService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private dropdownService = inject(DropdownService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  token = this.authService.token;
  communityPosts = this.communityService.communityPosts;
  community = this.communityService.communityDetails;

  activePostFilter = signal<string>('Best');
  postFilterType = signal<string[]>(['Best', 'New', 'Top']);
  private slug = signal<string | null>(null);

  constructor() {
    effect(() => {
      const token = this.token();
      const communitySlug = this.slug();

      if (communitySlug) {
        untracked(() => {
          this.loadCommunityDetail(communitySlug);
        });
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      this.slug.set(slug);
    });
  }

  togglePostMenuFilter() {
    this.dropdownService.toggleDropdown('filter', 'filter');
  }

  togglePostFilter(filter: string) {
    // TODO: implement togglePostFilter
    this.dropdownService.closeDropdown();
    console.log('🚀 ~ Home ~ togglePostFilter ~ filter:', filter);
  }

  isPostMenuFilterOpen(): boolean {
    return this.dropdownService.isDropDownOpen('filter', 'filter');
  }

  loadCommunityDetail(slug: string) {
    // Fetch both community details and posts in parallel
    forkJoin({
      posts: this.communityService.loadInitialCommunityPosts(slug),
      details: this.communityService.getCommunityDetails(slug),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
