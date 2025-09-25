import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';
import { ArticleComment, PaginatedComments } from '../models/comment.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly API_URL = 'http://localhost:3001/api/articles';

  private authHeaders(json: boolean = true): { headers: HttpHeaders } {
    const token = this.auth.getAccessToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    // only set JSON header if we’re not sending FormData
    if (json) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return { headers };
  }

  list(query?: { tag?: string; authorId?: string }): Observable<Article[]> {
    const params: Record<string, string> = {};
    if (query?.tag) params['tag'] = query.tag;
    if (query?.authorId) params['authorId'] = query.authorId;
    return this.http.get<Article[]>(this.API_URL, { params });
  }

  get(id: string): Observable<Article> {
    return this.http.get<Article>(`${this.API_URL}/${id}`);
  }

  create(payload: FormData | any): Observable<Article> {
    const isFormData = payload instanceof FormData;

    return this.http.post<Article>(
      this.API_URL,
      payload,
      this.authHeaders(!isFormData)
    );
  }

  update(id: string, payload: FormData | any): Observable<Article> {
    const isFormData = payload instanceof FormData;
    return this.http.put<Article>(
      `${this.API_URL}/${id}`,
      payload,
      this.authHeaders(!isFormData)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, this.authHeaders());
  }

  getComments(articleId: string, page = 1, limit = 20): Observable<PaginatedComments> {
    const params: any = { page, limit };
    return this.http.get<PaginatedComments>(
      `${this.API_URL}/${articleId}/comments`,
      { params }
    );
  }

  createComment(comment: Partial<ArticleComment>): Observable<ArticleComment> {
    return this.http.post<ArticleComment>(
      `${this.API_URL}/${comment.articleId}/comments`,
      comment
    );
  }
}
