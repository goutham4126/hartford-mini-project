import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-customer-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './customer-register.html',
  styleUrl: './customer-register.css',
})
export class CustomerRegister {
  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  phone = '';

  constructor(private auth: Auth, private router: Router) { }

  register() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'customer',
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      createdAt: new Date().toISOString()
    };

    this.auth.register(userData).subscribe(() => {
      alert('Customer registered successfully');
      this.router.navigate(['/auth/customer/login']);
    });
  }
}
