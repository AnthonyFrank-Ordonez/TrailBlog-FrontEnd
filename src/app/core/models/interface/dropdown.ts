export type DropdownType = 'menu' | 'share' | 'reaction' | 'filter' | 'create';

export interface DropdownObject {
  type: string | null;
  id: string | null;
}
