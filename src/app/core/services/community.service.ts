import { inject, Injectable, signal } from '@angular/core';
import { UserService } from './user.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';
import { UserCommunities } from '@core/models/interface/community';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';

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
      finalize(() => this.#userCommunitiesLoading.set(false)),
    );
  }
}
