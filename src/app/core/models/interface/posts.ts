export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  slug: string;
  createdAt: Date;
  username: string;
  communityName: string;
  communityId: string;
  comments: Array<string> | null;
  totalLike: number;
  totalComment: number;
}
