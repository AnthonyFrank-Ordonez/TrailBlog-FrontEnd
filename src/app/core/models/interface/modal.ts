import { Post, PostDeleteType } from './posts';
import { CommentAction, PostAction } from './menus';
import { Communities } from './community';

export type MenuModalStrategy = 'delete' | 'archive';

interface BaseModalConfig {
  title: string;
  description: string;
  content?: string;
  subcontent?: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
}

export interface CommunityModalConfig extends BaseModalConfig {
  type: 'community';
  data: { community: Communities };
  onConfirm?: (community: Communities) => void;
}

export interface PostMenuModalConfig extends BaseModalConfig {
  type: 'menu';
  data: { post: Post; action: PostAction | CommentAction; activeTab?: PostDeleteType };
  onConfirm?: (post: Post, activeTab?: PostDeleteType) => void;
}

export interface CommunityFormModalConfig extends BaseModalConfig {
  type: 'form';
  content: 'community-form';
  data?: { community?: Communities };
  onConfirm?: () => void;
}

export interface InfoModalConfig extends BaseModalConfig {
  type: 'info';
  data?: never;
  onConfirm?: never;
}

export interface GenericModalConfig extends BaseModalConfig {
  type?: 'generic';
  data?: unknown;
  onConfirm?: () => void;
}

export interface ErrorModalConfig extends BaseModalConfig {
  type: 'error';
  icon?: string;
  data?: unknown;
  onConfirm?: () => void;
}

export type ModalConfig =
  | CommunityModalConfig
  | CommunityFormModalConfig
  | PostMenuModalConfig
  | InfoModalConfig
  | GenericModalConfig
  | ErrorModalConfig;

export interface ModalData {
  communityId?: string;
}

export interface MenuModalConfig {
  title: string;
  description: string;
  content?: string;
  subcontent?: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
}
