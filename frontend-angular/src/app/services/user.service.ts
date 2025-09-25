import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import { PaginatedUsers } from '../models/user.model';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly API = 'http://localhost:3000/api/users';

  listUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API}/`);
  }

  /**
   * Get paginated users (admin)
   */
  getUsers(page = 1, limit = 20) {
    const params: any = { page, limit };
    return this.http.get<PaginatedUsers>(this.API, { params });
  }

  /**
   * Update roles for a user (admin)
   */
  updateUserRoles(id: string, roles: string[]) {
    const token = this.auth.getAccessToken();
    const headers: any = token ? { Authorization: `Bearer ${token}` } : {};
    return this.http.put(`${this.API}/${id}/roles`, { roles }, { headers });
  }


  getCurrentUser(): User | null {
    return this.auth.getCurrentUser();
  }
}

export default UserService;
