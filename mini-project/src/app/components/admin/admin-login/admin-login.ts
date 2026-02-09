import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  email = signal('');
  password = signal('');
  selectedRole = signal<'admin'|'agent'>('admin');
  ngOnInit() {
  if (this.route.snapshot.queryParamMap.get('role') === 'agent') {
    this.selectedRole.set('agent');
  }
}
  login() {
    this.auth.login(this.email(), this.password()).subscribe({
      next: () => {
        const user = this.auth.user();
        const role = this.selectedRole();
        if (role === 'admin') {
          if (user?.role !== 'admin') {
            alert('Not an Admin account');
            this.auth.logout();
            return;
          }
          this.router.navigate(['/admin/dashboard']).then(() => {
            window.location.reload();
          });
        } else if (role === 'agent') {
          if (user?.role !== 'agent') {
            alert('Not an Agent account');
            this.auth.logout();
            return;
          }
          this.router.navigate(['/agent/dashboard']).then(() => {
            window.location.reload();
          });
        }
      },
      error: () => {
        alert('Invalid credentials');
      }
    });
  }
}
