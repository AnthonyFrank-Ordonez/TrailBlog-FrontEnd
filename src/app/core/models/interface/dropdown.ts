export type DropdownType = 'menu' | 'share' | 'reaction' | 'filter' | 'create' | 'account';

export interface DropdownObject {
  type: string | null;
  id: string | null;
}
