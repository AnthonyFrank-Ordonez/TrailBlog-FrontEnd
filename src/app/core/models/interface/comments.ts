export interface Comment {
  Id: string;
  UserId: string | null;
  PostId: string | null;
  Content: string;
  Username: string;
  LastUpdateAt: Date;
  CommentedAt: Date;
  IsDeleted: boolean;
}
