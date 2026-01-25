import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Users } from '../../services/users';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  private users = inject(Users);
  private auth = inject(Auth);
  private router = inject(Router);

  currentUser = this.users.currentUser;

  logOut() {
    this.auth.logout();
    this.router.navigate(['/']).then(() => {
      window.location.reload();
    });;
  }

  ngOnInit(): void {
    this.users.loadCurrentUser();
  }

}
