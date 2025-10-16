interface BaseModalConfig {
  title: string;
  description: string;
  content?: string;
}

export interface CommunityModalConfig extends BaseModalConfig {
  type: 'community';
  data: { communityId: string };
  onConfirm?: (communityId: string) => void;
}

export interface CommunityFormModalConfig extends BaseModalConfig {
  type: 'form';
  content: 'community-form';
  data?: { communityId?: string };
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

export type ModalConfig =
  | CommunityModalConfig
  | CommunityFormModalConfig
  | InfoModalConfig
  | GenericModalConfig;

export interface ModalData {
  communityId?: string;
}
