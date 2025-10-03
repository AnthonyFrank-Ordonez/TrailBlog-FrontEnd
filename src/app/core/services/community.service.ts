import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { UserService } from './user.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserCommunities } from '../models/interface/community';
import { catchError, finalize, Observable, of, tap, throwError } from 'rxjs';
import { MessageService } from './message.service';
import { ApiError } from '../models/interface/api-error';
import { handleHttpError } from '@shared/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  #userCommunities = signal<UserCommunities[]>([]);
  #userCommunitiesLoading = signal<boolean>(false);

  user = this.userService.user;
  env = environment;
  userCommunities = this.#userCommunities.asReadonly();
  userCommunitiesLoading = this.#userCommunitiesLoading.asReadonly();

  loadUserCommunities(): Observable<UserCommunities[]> {
    this.#userCommunitiesLoading.set(true);

    return this.http.get<UserCommunities[]>(`${this.env.apiRoot}/community/user`).pipe(
      tap((response) => {
        console.log('fetching user communities...');
        this.#userCommunities.set(response);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      }),
      finalize(() => this.#userCommunitiesLoading.set(false))
    );
  }
}
