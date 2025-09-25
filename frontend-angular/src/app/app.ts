import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-900 text-white">
      <div class="flex">
        <app-sidebar *ngIf="isAuthenticated()" class="hidden md:block"></app-sidebar>
        <div class="flex-1 p-4">
          <main class="max-w-5xl mx-auto">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // this.authService.refreshToken().subscribe({
    //   next: () => {
    //   },
    //   error: () => {
    //   }
    // });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
  }
}
