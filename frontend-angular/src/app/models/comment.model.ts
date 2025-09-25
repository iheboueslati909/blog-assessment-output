export interface ArticleComment {
  _id: string;
  articleId: string;
  authorId: string;
  content: string;
  parentCommentId?: string | null;
  createdAt?: string | Date;
  __v?: number;
  replies?: ArticleComment[];
}

export interface PaginatedComments {
  page: number;
  limit: number;
  totalTopLevel: number;
  comments: ArticleComment[];
}