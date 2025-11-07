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

export interface ErrorModalConfig extends BaseModalConfig {
  type: 'error';
  icon?: string;
  data?: unknown;
  onConfirm?: () => void;
}

export type ModalConfig =
  | CommunityModalConfig
  | CommunityFormModalConfig
  | InfoModalConfig
  | GenericModalConfig
  | ErrorModalConfig;

export interface ModalData {
  communityId?: string;
}
