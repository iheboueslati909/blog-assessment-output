import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
}

interface RegisterResponse {
  user: {
    name: string;
    email: string;
    roles: string[];
    _id: string;
    createdAt: string;
    updatedAt: string;
    id: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private accessToken: string | null = null;

  private readonly API_URL = 'http://localhost:3000/api/auth';

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials, { withCredentials: true }).pipe(
      tap(res => {
        this.accessToken = res.accessToken;

        // Decode JWT and set current user
        const payload = jwtDecode<JwtPayload>(res.accessToken);
        const user: User = {
          id: payload.sub,
          roles: payload.roles,
          name: '',
          email: ''
        };

        this.currentUserSubject.next(user);
      }),
      map(() => this.currentUserSubject.value!)
    );
  }

  register(data: RegisterRequest): Observable<User> {
    return this.http
      .post<RegisterResponse>(`${this.API_URL}/register`, data, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.currentUserSubject.next(res.user);
        }),
        map((res) => res.user)
      );
  }

  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}, { withCredentials: true }).subscribe();
    this.accessToken = null;
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<string | null> {
    return this.http.post<{ accessToken: string }>(`${this.API_URL}/refresh`, {}, { withCredentials: true }).pipe(
      tap((res) => {
        this.accessToken = res.accessToken;
        
        // Decode JWT and set current user
        const payload = jwtDecode<JwtPayload>(res.accessToken);
        const user: User = {
          id: payload.sub,
          roles: payload.roles,
          name: '',
          email: ''
        };

        this.currentUserSubject.next(user);

      }),
      map((res) => res.accessToken),
    );
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return !!user && roles.some(r => user.roles.includes(r));
  }

  getCurrentUserId(): string {
    return this.currentUserSubject.value?.id || "";
  }
}
