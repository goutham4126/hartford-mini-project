import { Component, OnInit, signal } from '@angular/core';
import { Users } from '../../../services/users';

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  users=signal<any[]>([])
  constructor(private usersList:Users){}

  ngOnInit()
  {
      this.usersList.getUsers().subscribe(data => this.users.set(data));
  }
}
