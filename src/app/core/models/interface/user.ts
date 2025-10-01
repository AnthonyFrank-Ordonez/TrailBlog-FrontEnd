import { Roles } from '../../enums/roles';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: Roles[];
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
  revokedAt: Date | null;
}

export interface UserSettings {
  communityExpanded: boolean;
  resourcesExpanded: boolean;
  customFeedExpanded: boolean;
}
