export interface Article {
  _id: string;
  title: string;
  content: string;
  image: string | null;
  tags: string[];
  authorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  __v?: number;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  image?: string;
  tags?: string[];
}

export interface ArticleUpdateRequest {
  title?: string;
  content?: string;
  image?: string | null;
  tags?: string[];
}
