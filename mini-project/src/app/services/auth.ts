import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class Auth {

  private api = 'http://localhost:3000/users';

  token = signal<string | null>(localStorage.getItem('token'));
  user = signal<any | null>(
    this.token() ? JSON.parse(atob(this.token()!.split('.')[1])) : null
  );

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http
      .get<any[]>(`${this.api}?email=${email}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length === 0) {
            throw new Error('Invalid credentials');
          }

          const user = users[0];
          const token = this.createFakeJwt(user);

          return { token, user };
        }),
        tap(res => {
          localStorage.setItem('token', res.token);
          this.token.set(res.token);
          this.user.set(res.user);
        })
      );
  }

  register(userData: any) {
    return this.http.post<any>(this.api, userData);
  }

  logout() {
    localStorage.clear();
    this.token.set(null);
    this.user.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }

  private createFakeJwt(user: any): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 60 * 60 * 1000
    };

    return (
      btoa(JSON.stringify(header)) +
      '.' +
      btoa(JSON.stringify(payload)) +
      '.signature'
    );
  }
}
