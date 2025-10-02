import { computed, inject, Injectable } from '@angular/core';
import { UserService } from './user.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserCommunities } from '../models/interface/community';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private userService = inject(UserService);

  user = this.userService.user;
  env = environment;

  #userCommunitiesResources = httpResource<UserCommunities[]>(() =>
    this.user() ? `${this.env.apiRoot}/community/user` : undefined
  );

  userCommunities = computed(
    () => this.#userCommunitiesResources.value() ?? ([] as UserCommunities[])
  );
}
