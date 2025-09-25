import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { timeout } from 'rxjs/operators';
import { ImageService } from '../../services/image.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'article-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush // Add this
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  loading = false;
  error: string | null = null; 

  constructor(
    private svc: ArticleService, 
    private router: Router,
    private cdRef: ChangeDetectorRef,
     private imageSvc: ImageService,
     private toastr: ToastrService
    ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.cdRef.detectChanges(); // Force change detection
    
    this.svc
      .list()
      .pipe(timeout(8000))
      .subscribe({
        next: (res) => {
          this.articles = res || [];
          this.loading = false;
          this.cdRef.detectChanges(); // Force change detection
          console.log("Next - articles assigned:", this.articles);
          console.log("Next - loading:", this.loading);
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load articles';
          this.loading = false;
          this.articles = [];
          // show toast notification for the error
          try {
            this.toastr.error(this.error || '', 'Error loading articles');
          } catch (e) {
            // ignore toastr failures to avoid breaking the component
            console.error('Toastr error:', e);
          }
          this.cdRef.detectChanges(); // Force change detection
          console.error("Error loading articles:", err);
        },
      });
  }

  view(a: Article) {
    this.router.navigate(['/articles/', a._id]);
  }

  create() {
    this.router.navigate(['/articles', 'new']);
  }

    getImageUrl(imagePath: string | null | undefined): string {
    console.log(this.imageSvc.getImageUrl(imagePath))
    return this.imageSvc.getImageUrl(imagePath);
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/fallback.jpg';
  }
}