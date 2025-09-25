import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 min-h-screen bg-gray-900 p-4 border-r border-gray-800">
      <div class="text-white font-bold text-lg mb-6">Blogger</div>

      <nav class="space-y-2">
        <a routerLink="/articles" class="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800">Articles</a>
        <a routerLink="/articles/new" class="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800">New Article</a>
        <a *ngIf="auth.hasRole('Admin')" routerLink="/admin/users" class="block px-3 py-2 rounded text-gray-300 hover:bg-gray-800">Manage Users</a>
      </nav>

      <section class="mt-6">
        <div class="flex items-center justify-between text-sm text-gray-300">
          <h4 class="font-semibold">Notifications</h4>
          <button (click)="markAll()" class="text-blue-400 hover:text-blue-300 text-xs">Mark all</button>
        </div>
        <ul class="mt-3 space-y-2">
          <li *ngFor="let n of notifications$ | async" class="p-2 rounded bg-gray-800">
            <div class="text-sm" [class.font-semibold]="!n.read">{{ n.message }}</div>
            <div class="text-xs text-gray-400 mt-1 flex items-center justify-between">
              <small>{{ n.createdAt | date:'short' }}</small>
              <button (click)="markRead(n.id)" *ngIf="!n.read" class="text-xs text-blue-400">Mark</button>
            </div>
          </li>
        </ul>
      </section>

      <div class="mt-6 text-sm text-gray-400">
        <button (click)="logout()" class="w-full text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700">Logout</button>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  notifications$!: Observable<Notification[]>;

  constructor(private notif: NotificationService, public auth: AuthService) {}

  ngOnInit(): void {
    const token = this.auth.getAccessToken();
    if (token) {
      this.notif.connect(token);
    }

    this.notifications$ = this.notif.notifications;
  }

  markRead(id: string) {
    this.notif.markRead(id);
  }

  markAll() {
    this.notif.markAll();
  }

  logout() {
    this.notif.disconnect();
    this.auth.logout();
  }
}
