import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-agent-login',
  imports: [FormsModule],
  templateUrl: './agent-login.html',
  styleUrl: './agent-login.css',
})
export class AgentLogin {
  email = '';
  password = '';

  constructor(private auth: Auth, private router: Router) {}

  login() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        if (this.auth.user()?.role !== 'agent') {
          alert('Not an Agent account');
          this.auth.logout();
          return;
        }
        this.router.navigate(['/agent/dashboard']).then(() => {
          window.location.reload();
        });
      },
      error: () => alert('Invalid credentials')
    });
  }
}
