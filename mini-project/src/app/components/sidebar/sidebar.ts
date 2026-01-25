import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Users } from '../../services/users';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private users = inject(Users);

  currentUser = this.users.currentUser;

  ngOnInit(): void {
    this.users.loadCurrentUser();
  }
}
