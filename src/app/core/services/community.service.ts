import { DestroyRef, inject, Injectable, linkedSignal, signal } from '@angular/core';
import { UserService } from './user.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import {
  CreateCommunityRequest,
  Communities,
  CommunityFilterType,
} from '@core/models/interface/community';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { OperationResult } from '@core/models/interface/operations';
import { PostService } from './post.service';
import { ModalService } from './modal.service';
import { MessageService } from './message.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { handleHttpError } from '@shared/utils/utils';
import { DropdownService } from './dropdown.service';

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
  #userCommunitiesLoading = signal<boolean>(false);
  #isSubmitting = signal<boolean>(false);
  #isLeavingSignal = signal<boolean>(false);
  #communityFilter = signal<CommunityFilterType>('All');
  #activeCommunityFilterBtn = signal<CommunityFilterType>('All');

  user = this.userService.user;
  userCommunities = this.#userCommunities.asReadonly();
  userCommunitiesLoading = this.#userCommunitiesLoading.asReadonly();
  communityFilter = this.#communityFilter.asReadonly();
  activeCommunityFilterBtn = this.#activeCommunityFilterBtn.asReadonly();
  isSubmitting = this.#isSubmitting.asReadonly();

  userCommunitiesIds = linkedSignal(
    () => new Set<string>(this.#userCommunities().map((uc) => uc.id)),
  );

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
}
