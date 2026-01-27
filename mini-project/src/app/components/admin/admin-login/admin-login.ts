import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {

  private auth = inject(Auth);
  private router = inject(Router);

  email = signal('');
  password = signal('');

  login() {
    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        if (this.auth.user()?.role !== 'admin') {
          alert('Not an Admin account');
          this.auth.logout();
          return;
        }
        this.router.navigate(['/admin/dashboard']).then(() => {
          window.location.reload();
        });
      },
      error: () => {
        alert('Invalid credentials');
      }
    });
  }
}
