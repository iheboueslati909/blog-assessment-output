import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationPayload {
  type: string;
  articleId?: string;
  commentId?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket!: Socket;

  // Emit array of notifications instead of single payload
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  
  constructor(private zone: NgZone) {}

  connect(token: string) {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io('http://localhost:3003', {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Notification service');
    });

    this.socket.on('notification', (payload: NotificationPayload) => {
      this.zone.run(() => {
        console.log('📩 Notification:', payload);

        const newNotif: Notification = {
          id: payload.commentId || payload.articleId || Math.random().toString(36).slice(2),
          message: payload.message,
          createdAt: new Date(),
          read: false
        };

        this.notifications$.next([newNotif, ...this.notifications$.value]);
      });
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Notification service');
    });
  }

  get notifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  markRead(id: string) {
    const updated = this.notifications$.value.map(n => n.id === id ? { ...n, read: true } : n);
    this.notifications$.next(updated);
  }

  markAll() {
    const updated = this.notifications$.value.map(n => ({ ...n, read: true }));
    this.notifications$.next(updated);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
