import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { PaginatedUsers } from '../../models/user.model';
import { timeout } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'manage-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageUsersComponent implements OnInit {
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;
  users: any[] = [];
  loading = false;
  error: string | null = null;
  rolesOptions = ['Admin', 'Editor', 'Author'];

  constructor(
    private svc: UserService,
    private auth: AuthService,
    private cdRef: ChangeDetectorRef
    , private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading = true;
    this.error = null;
    this.cdRef.detectChanges();

    this.svc
      .getUsers(page, this.limit)
      .pipe(timeout(8000))
      .subscribe({
        next: (res: PaginatedUsers) => {
          this.page = res.page;
          this.limit = res.limit;
          this.total = res.total;
          this.totalPages = res.totalPages;
          this.users = res.users.map(u => ({
            ...u,
            pendingRole: u.roles?.[0] || null // take the first role
          }));
          this.loading = false;
          this.cdRef.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.message || 'Failed to load users';
          this.users = [];
          this.loading = false;
          this.cdRef.detectChanges();
        }
      });
  }

  setPendingRole(user: any, role: string) {
    user.pendingRole = role;
  }

  commitRole(user: any) {
    const newRole = user.pendingRole;

    this.svc.updateUserRoles(user._id, [newRole]).subscribe({
      next: () => {
        user.roles = [newRole]; // replace array with single role
        this.toastr.success('User role updated', 'Success');
        this.cdRef.detectChanges();
      },
      error: () => {
        user.pendingRole = user.roles?.[0] || null; // revert
        this.toastr.error('Failed to update user role', 'Error');
        this.cdRef.detectChanges();
      }
    });
  }

  prev() {
    if (this.page > 1) this.load(this.page - 1);
  }
  next() {
    if (this.page < this.totalPages) this.load(this.page + 1);
  }

  isSelf(user: any) {
    return this.auth.getCurrentUserId() === user._id;
  }
}
