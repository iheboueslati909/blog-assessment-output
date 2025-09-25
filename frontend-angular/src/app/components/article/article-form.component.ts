import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../models/article.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'article-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './article-form.component.html',
})
export class ArticleFormComponent implements OnInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  editingId: string | null = null;

  private selectedFile: File | null = null; // store file reference

  constructor(
    private fb: FormBuilder,
    private svc: ArticleService,
    private route: ActivatedRoute,
    private router: Router
    , private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      tags: [''],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.editingId = id;
      this.load(id);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  load(id: string) {
    this.loading = true;
    this.svc.get(id).subscribe({
      next: (a) => {
        this.form.patchValue({
          title: a.title,
          content: a.content,
          tags: (a.tags || []).join(', '),
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load article';
        this.loading = false;
      },
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const raw = this.form.value;

    // build FormData for file + fields
    const formData = new FormData();
    formData.append('title', raw.title);
    formData.append('content', raw.content);

    if (raw.tags) {
      raw.tags
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
        .forEach((tag: string) => formData.append('tags', tag));
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // Debug: log the FormData entries
for (const [key, value] of formData.entries()) {
  console.log(key, value);
}
console.log('Submitting form data:', formData);
    const obs = this.editingId
      ? this.svc.update(this.editingId, formData)
      : this.svc.create(formData);

    obs.subscribe({
      next: (res: Article) => {
        this.loading = false;
        this.toastr.success('Article saved', 'Success');
        this.router.navigate(['/articles', res._id]);
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(err?.error?.message || err?.message || 'Save failed', 'Error');
        this.error = err?.error?.message || err?.message || 'Save failed';
      },
    });
  }
}
