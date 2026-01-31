import { Component, DestroyRef, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CurrentRouteService } from '@core/services/current-route.service';
import { CommunityService } from '@core/services/community.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { handleHttpError } from '@shared/utils/utils';
import { MessageService } from '@core/services/message.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-community-detail',
  imports: [],
  templateUrl: './community-detail.html',
  styleUrl: './community-detail.css',
})
export class CommunityDetail implements OnInit {
  private authService = inject(AuthService);
  private communityService = inject(CommunityService);
  private currentRouteService = inject(CurrentRouteService);
  private messageService = inject(MessageService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  token = this.authService.token;
  communityPosts = this.communityService.communityPosts;
  communityDetails = this.communityService.communityDetails;
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
