import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-customer-login',
  imports: [FormsModule],
  templateUrl: './customer-login.html',
  styleUrl: './customer-login.css',
})
export class CustomerLogin {
  email = '';
  password = '';

  constructor(private auth: Auth, private router: Router) {}

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        if (this.auth.user()?.role !== 'customer') {
          alert('Not a Customer account');
          this.auth.logout();
          return;
        }
        this.router.navigate(['/customer/dashboard']).then(() => {
          window.location.reload();
        });
      },
      error: () => alert('Invalid credentials')
    });
  }
}
