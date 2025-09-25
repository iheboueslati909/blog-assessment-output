import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { ArticleComment, PaginatedComments } from '../../models/comment.model';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ImageService } from '../../services/image.service';

@Component({
  standalone: true,
  selector: 'article-detail',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './article-detail.component.html',
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  comments: ArticleComment[] = [];
  commentsPage = 1;
  commentsLimit = 20;
  commentsTotalTopLevel = 0;
  newCommentContent = '';
  loading = false;
  error: string | null = null;
  replyOpenFor: Record<string, boolean> = {};
  replyContent: Record<string, string> = {};

  private apiBaseUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private svc: ArticleService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private auth: AuthService
    , private imageSvc: ImageService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.router.navigate(['/articles', 'new']);
      return;
    }

    this.load(id);
    this.loadComments(id);
  }

  getImageUrl(imagePath: string | null | undefined): string {
    console.log(this.imageSvc.getImageUrl(imagePath))
    return this.imageSvc.getImageUrl(imagePath);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/fallback.jpg';
  }

  load(id: string) {
    this.loading = true;
    this.error = null;
    this.cdRef.detectChanges();

    this.svc.get(id).subscribe({
      next: res => {
        this.article = res;
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: err => {
        this.error = err?.error?.message || err?.message || 'Failed to load article';
        this.loading = false;
        this.cdRef.detectChanges();
      },
    });
  }

  toggleReplyBox(commentId: string) {
    this.replyOpenFor[commentId] = !this.replyOpenFor[commentId];
    if (this.replyOpenFor[commentId] && !this.replyContent[commentId]) {
      this.replyContent[commentId] = '';
    }
  }

  loadComments(articleId: string) {
    this.svc.getComments(articleId, this.commentsPage, this.commentsLimit).subscribe({
      next: (res: PaginatedComments) => {
        this.comments = res.comments || [];
        this.commentsPage = res.page || this.commentsPage;
        this.commentsLimit = res.limit || this.commentsLimit;
        this.commentsTotalTopLevel = res.totalTopLevel || 0;
        this.cdRef.detectChanges();
      },
      error: err => console.error('Failed to load comments', err)
    });
  }

  addComment(parentCommentId?: string) {
    if (!this.article) return;

    const content = parentCommentId
      ? this.replyContent[parentCommentId]?.trim()
      : this.newCommentContent.trim();

    if (!content) return;

    const comment: Partial<ArticleComment> = {
      articleId: this.article._id!,
      authorId: this.auth.getCurrentUserId(),
      content,
      parentCommentId
    };

    this.svc.createComment(comment).subscribe({
      next: res => {
        if (parentCommentId) {
          const parent = this.findCommentById(parentCommentId, this.comments);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.unshift(res);
          } else {
            this.loadComments(this.article!._id!);
          }
          this.replyContent[parentCommentId] = '';
          this.replyOpenFor[parentCommentId] = false;
        } else {
          this.comments.unshift(res);
          this.newCommentContent = '';
        }

        if (parentCommentId) {
          this.replyContent[parentCommentId] = '';
          this.replyOpenFor[parentCommentId] = false;
        } else {
          this.newCommentContent = '';
        }

        this.cdRef.detectChanges();
      },
      error: err => alert(err?.error?.message || 'Failed to post comment')
    });
  }

  private findCommentById(id: string, list: ArticleComment[]): ArticleComment | undefined {
    for (const c of list) {
      if (c._id === id) return c;
      if (c.replies && c.replies.length) {
        const found = this.findCommentById(id, c.replies);
        if (found) return found;
      }
    }
    return undefined;
  }

  canEdit(): boolean {
    return this.auth.hasAnyRole(['Editor', 'Admin']);
  }

  canDelete(): boolean {
    return this.auth.hasRole('Admin');
  }

  edit() {
    if (!this.article?._id || !this.canEdit()) return;
    this.router.navigate(['/articles', this.article._id, 'edit']);
  }

  remove() {
    if (!this.article?._id || !this.canDelete()) return;
    if (!confirm('Delete this article?')) return;
    this.svc.delete(this.article._id).subscribe({
      next: () => this.router.navigate(['/articles']),
      error: (err) => alert(err?.error?.message || err?.message || 'Delete failed'),
    });
  }

  getReplies(parentId: string) {
    const parent = this.comments.find(c => c._id === parentId);
    return parent?.replies || [];
  }
}