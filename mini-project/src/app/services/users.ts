import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/model';
import { Auth } from './auth';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Users {

  private http = inject(HttpClient);
  private auth = inject(Auth);

  currentUser = signal<User | null>(null);

  getUsers() {
    return this.http.get<User[]>('http://localhost:3000/users');
  }

  getAllAgents() {
    return this.http.get<User[]>('http://localhost:3000/agents')
  }

  loadCurrentUser() {
    const userId = this.auth.user()?.id;

    if (!userId) {
      this.currentUser.set(null);
      return of(null);
    }

    return this.http
      .get<User>(`http://localhost:3000/users/${userId}`)
      .subscribe(user => {
        this.currentUser.set(user);
      });
  }

  updateUser(user: User) {
    return this.http.put<User>(`http://localhost:3000/users/${user.id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete(`http://localhost:3000/users/${id}`);
  }
}
