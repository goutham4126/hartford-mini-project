import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-agent-register',
  imports: [FormsModule],
  templateUrl: './agent-register.html',
  styleUrl: './agent-register.css',
})
export class AgentRegister {
  username = '';
  email = '';
  password = '';
  firstName = '';
  lastName = '';
  phone = '';

  constructor(private auth: Auth, private router: Router) {}

  register() {
    const userData = {
      username: this.username,
      email: this.email,
      password: this.password,
      role: 'agent',
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      createdAt: new Date().toISOString()
    };

    this.auth.register(userData).subscribe(() => {
      alert('Agent registered successfully');
      this.router.navigate(['/auth/agent/login']);
    });
  }
}
