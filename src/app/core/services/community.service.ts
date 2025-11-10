import { inject, Injectable, signal } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  env = environment;
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private readonly apiUrl = `${this.env.apiRoot}/community`;

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

  favoriteCommunity(communityId: string): Observable<Communities> {
    return this.http.post<Communities>(`${this.apiUrl}/${communityId}/favorite`, null).pipe(
      tap((updatedCommunity) => {
        console.log('Favorite Community');

        this.#userCommunities.update((communities) =>
          communities.map((community) =>
            community.id === updatedCommunity.id ? { ...updatedCommunity } : community,
          ),
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  unfavoriteCommunity(communityId: string): Observable<Communities> {
    return this.http.post<Communities>(`${this.apiUrl}/${communityId}/unfavorite`, null).pipe(
      tap((updatedCommunity) => {
        console.log('Unfavorite Community');

        this.#userCommunities.update((communities) =>
          communities.map((community) =>
            community.id === updatedCommunity.id ? { ...updatedCommunity } : community,
          ),
        );
      }),
      catchError((error) => {
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

  resetCommunityServiceData(): void {
    this.#userCommunities.set([]);
    this.#communityFilter.set('All');
    this.#activeCommunityFilterBtn.set('All');
  }
}
