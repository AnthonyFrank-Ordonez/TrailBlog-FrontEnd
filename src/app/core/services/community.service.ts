import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { UserService } from './user.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserCommunities } from '../models/interface/community';
import { catchError, finalize, Observable, of, tap, throwError } from 'rxjs';
import { MessageService } from './message.service';
import { ApiError } from '../models/interface/api-error';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

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
        if (error.error instanceof ErrorEvent) {
          this.messageService.showMessage('error', error.error.message);
          console.error(error.error.message);
        } else if (error.error && typeof error.error === 'object') {
          const apiError = error.error as ApiError;
          const errorMessage = apiError.detail ?? error.message;

          this.messageService.showMessage('error', errorMessage);
          console.error('An error occured: ', apiError);
        } else {
          console.error('Http error occured: ', error);
        }

        return throwError(() => error);
      }),
      finalize(() => this.#userCommunitiesLoading.set(false))
    );
  }
}
