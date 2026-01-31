import { computed, DestroyRef, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { UserService } from './user.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '@env/environment';
import {
  CreateCommunityRequest,
  Communities,
  CommunityFilterType,
} from '@core/models/interface/community';
import { catchError, EMPTY, finalize, Observable, tap, throwError } from 'rxjs';
import { OperationResult } from '@core/models/interface/operations';
import { PostService } from './post.service';
import { ModalService } from './modal.service';
import { MessageService } from './message.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { handleHttpError } from '@shared/utils/utils';
import { DropdownService } from './dropdown.service';
import { MetaData, PageResult } from '@core/models/interface/page-result';
import { Post } from '@core/models/interface/posts';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  env = environment;
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private modalService = inject(ModalService);
  private messageService = inject(MessageService);
  private dropdownService = inject(DropdownService);
  private destroyRef = inject(DestroyRef);
  private readonly apiUrl = `${this.env.apiRoot}/communitys`;

  #userCommunities = signal<Communities[]>([]);
  #communityPostsSignal = signal<Post[]>([]);
  #communityDetailsSignal = signal<Communities | null>(null);
  #currentPageSignal = signal<number>(0);
  #pageSizeSignal = signal<number>(10);
  #totalPagesSignal = signal<number>(0);
  #totalCountSignal = signal<number>(0);
  #userCommunitiesLoading = signal<boolean>(false);
  #isSubmitting = signal<boolean>(false);
  #isLeavingSignal = signal<boolean>(false);
  #communityFilter = signal<CommunityFilterType>('All');
  #activeCommunityFilterBtn = signal<CommunityFilterType>('All');
  #isLoadingSignal = signal<boolean>(false);

  user = this.userService.user;
  userCommunities = this.#userCommunities.asReadonly();
  userCommunitiesLoading = this.#userCommunitiesLoading.asReadonly();
  communityPosts = this.#communityPostsSignal.asReadonly();
  communityDetails = this.#communityDetailsSignal.asReadonly();
  currentPage = this.#currentPageSignal.asReadonly();
  pageSize = this.#pageSizeSignal.asReadonly();
  totalPages = this.#totalPagesSignal.asReadonly();
  totalCount = this.#totalCountSignal.asReadonly();
  communityFilter = this.#communityFilter.asReadonly();
  activeCommunityFilterBtn = this.#activeCommunityFilterBtn.asReadonly();
  isSubmitting = this.#isSubmitting.asReadonly();
  isLoading = this.#isLoadingSignal.asReadonly();

  userCommunitiesIds = linkedSignal(
    () => new Set<string>(this.#userCommunities().map((uc) => uc.id)),
  );

  readonly hasMore = computed(() => this.#currentPageSignal() < this.#totalPagesSignal());

  loadUserCommunities(): Observable<Communities[]> {
    this.#userCommunitiesLoading.set(true);

    return this.http.get<Communities[]>(`${this.apiUrl}/user`).pipe(
      tap((response) => {
        console.log('fetching user communities...');

        this.#userCommunities.set(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      }),
      finalize(() => this.#userCommunitiesLoading.set(false)),
    );
  }

  loadInitialCommunityPosts(slug: string): Observable<PageResult<Post, MetaData>> {
    this.#communityPostsSignal.set([]);
    this.#currentPageSignal.set(0);
    return this.loadMoreCommunityPosts(slug);
  }

  loadMoreCommunityPosts(communitySlug: string): Observable<PageResult<Post, MetaData>> {
    if (this.#isLoadingSignal()) {
      console.info('Already loading, skipping...');
      return EMPTY;
    }

    // Check if we have more pages
    if (this.#currentPageSignal() > 0 && !this.hasMore()) {
      console.info('No more posts to load');
      return EMPTY;
    }

    this.#isLoadingSignal.set(true);

    const nextPage = this.#currentPageSignal() + 1;
    const pageSize = this.#pageSizeSignal();

    let params = new HttpParams().set('page', nextPage).set('pageSize', pageSize);

    return this.http
      .get<PageResult<Post, MetaData>>(`${this.apiUrl}/${communitySlug}/posts`, { params })
      .pipe(
        tap((response) => {
          console.log('fetching community posts...');
          const data = response;

          this.#communityPostsSignal.update((value) => [...value, ...data.data]);

          this.#totalCountSignal.set(data.totalCount);
          this.#totalPagesSignal.set(data.totalPages);
          this.#currentPageSignal.set(nextPage);
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        }),
        finalize(() => this.#isLoadingSignal.set(false)),
      );
  }

  getCommunityDetails(slug: string): Observable<Communities> {
    this.#isLoadingSignal.set(true);

    return this.http.get<Communities>(`${this.apiUrl}/${slug}/details`).pipe(
      tap((response) => {
        console.log('fetching community details...');

        this.#communityDetailsSignal.set(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      }),
      finalize(() => this.#isLoadingSignal.set(false)),
    );
  }

  createCommunity(communityFormData: CreateCommunityRequest): Observable<Communities> {
    this.#isSubmitting.set(true);

    return this.http.post<Communities>(this.apiUrl, communityFormData).pipe(
      tap((data) => {
        console.log('Creating community. Please wait...');

        this.#userCommunities.update((value) => [...value, data]);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isSubmitting.set(false);
      }),
    );
  }

  leaveCommunity(communityId: string | undefined): Observable<OperationResult> {
    this.#isLeavingSignal.set(true);

    return this.http.post<OperationResult>(`${this.apiUrl}/${communityId}/leave`, null).pipe(
      tap(() => {
        console.log('Leaving community...');

        this.#userCommunities.update((communities) => {
          return communities.filter((community) => community.id !== communityId);
        });
      }),
      catchError((error) => {
        return throwError(() => error);
      }),

      finalize(() => {
        this.#isLeavingSignal.set(false);
      }),
    );
  }

  joinCommunity(communityId: string): Observable<Communities> {
    return this.http.post<Communities>(`${this.apiUrl}/${communityId}/join`, null).pipe(
      tap((community) => {
        console.log('Joining community...');
        this.#userCommunities.update((communities) => [...communities, community]);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  favoriteCommunity(community: Communities): Observable<Communities> {
    const previousState = community.isFavorite;
    const optimisticCommunity = { ...community, isFavorite: true };

    this.updateUserCommunitiesWithOptimisticData(community.id, optimisticCommunity);

    return this.http.post<Communities>(`${this.apiUrl}/${community.id}/favorite`, null).pipe(
      tap((updatedCommunity) => {
        console.log('Favorite Community');

        this.updateUserCommunitiesWithOptimisticData(community.id, updatedCommunity);
      }),
      catchError((error) => {
        const rollbackCommunity = { ...community, isFavorite: previousState };
        this.updateUserCommunitiesWithOptimisticData(community.id, rollbackCommunity);
        return throwError(() => error);
      }),
    );
  }

  unfavoriteCommunity(community: Communities): Observable<Communities> {
    const previousState = community.isFavorite;
    const optimisticCommunity = { ...community, isFavorite: false };

    this.updateUserCommunitiesWithOptimisticData(community.id, optimisticCommunity);

    return this.http.post<Communities>(`${this.apiUrl}/${community.id}/unfavorite`, null).pipe(
      tap((updatedCommunity) => {
        console.log('Unfavorite Community');

        this.updateUserCommunitiesWithOptimisticData(community.id, updatedCommunity);
      }),
      catchError((error) => {
        const rollbackCommunity = { ...community, isFavorite: previousState };
        this.updateUserCommunitiesWithOptimisticData(community.id, rollbackCommunity);
        return throwError(() => error);
      }),
    );
  }

  setCommunityFilter(filter: CommunityFilterType) {
    this.#communityFilter.set(filter);
  }

  setActiveCommunityFilter(filter: CommunityFilterType) {
    this.#activeCommunityFilterBtn.set(filter);
  }

  isUserInCommunity(communityId: string) {
    return this.userCommunitiesIds().has(communityId);
  }

  toggleCommunityMembership(communityId: string, isAuthenticated: boolean): void {
    this.dropdownService.closeDropdown();

    if (this.isUserInCommunity(communityId)) {
      this.modalService.openModal({
        type: 'community',
        title: 'Leave Community',
        description: 'Are you sure you want to leave this community?',
        content: 'confirmation-modal',
        subcontent:
          " Once you leave, you'll no longer be a member or receive updates from this community. You can rejoin anytime.",
        confirmBtnText: 'Leave Community',
        cancelBtnText: 'Cancel',
        data: { communityId },
        onConfirm: (id) => this.handleLeaveCommunity(id),
      });
    } else {
      if (!isAuthenticated) {
        this.modalService.showAuthRequiredModal();
      } else {
        this.handleJoinCommunity(communityId);
      }
    }
  }

  private handleJoinCommunity(communityId: string): void {
    this.joinCommunity(communityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  private handleLeaveCommunity(communityId: string): void {
    this.leaveCommunity(communityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  private updateUserCommunitiesWithOptimisticData(
    communityId: string,
    updatedCommunity: Communities,
  ): void {
    this.#userCommunities.update((communities) =>
      communities.map((c) => (c.id === communityId ? updatedCommunity : c)),
    );
  }

  resetCommunityServiceData(): void {
    this.#userCommunities.set([]);
    this.#communityFilter.set('All');
    this.#activeCommunityFilterBtn.set('All');
  }

  resetCommunityDetails(): void {
    this.#communityPostsSignal.set([]);
    this.#communityDetailsSignal.set(null);
    this.#currentPageSignal.set(0);
    this.#totalPagesSignal.set(0);
    this.#totalCountSignal.set(0);
  }
}
