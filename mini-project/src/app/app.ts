import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Users } from './services/users';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { Sidebar } from './components/sidebar/sidebar';
import { Auth } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  private users = inject(Users);
  private auth= inject(Auth)
  private router= inject(Router)

  currentUser = this.users.currentUser;

  ngOnInit() {
    this.users.loadCurrentUser();
  //   if (this.auth.isLoggedIn()) {
  //   const role = this.auth.user()?.role;

  //   if (role === 'admin') this.router.navigate(['/admin/dashboard']);
  //   if (role === 'agent') this.router.navigate(['/agent/dashboard']);
  //   if (role === 'customer') this.router.navigate(['/customer/dashboard']);
  // }
  }
}
