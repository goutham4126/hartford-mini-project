import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Users } from '../../../services/users';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  users = signal<any[]>([]);
  roles = ['admin', 'agent', 'customer'];

  constructor(private usersList: Users) { }

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.usersList.getUsers().subscribe(data => this.users.set(data));
  }

  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.usersList.deleteUser(id).subscribe({
        next: () => {
          this.users.update(current => current.filter(u => u.id !== id));
        },
        error: (err) => alert('Failed to delete user')
      });
    }
  }

  toggleBlock(user: any) {
    const updatedUser = { ...user, isActive: !user.isActive };
    this.usersList.updateUser(updatedUser).subscribe({
      next: () => {
        this.users.update(current =>
          current.map(u => u.id === user.id ? updatedUser : u)
        );
      },
      error: (err) => alert('Failed to update status')
    });
  }

  updateRole(user: any, event: Event) {
    const newRole = (event.target as HTMLSelectElement).value;
    if (newRole === user.role) return;

    if (confirm(`Are you sure you want to change role from ${user.role} to ${newRole}? This will affect their login access.`)) {
      const updatedUser = { ...user, role: newRole };
      this.usersList.updateUser(updatedUser).subscribe({
        next: () => {
          this.users.update(current =>
            current.map(u => u.id === user.id ? updatedUser : u)
          );
        },
        error: (err) => {
          alert('Failed to update role');
          // Revert selection in UI might be needed, but simple alert for now
          this.fetchUsers(); // Refresh to revert
        }
      });
    } else {
      this.fetchUsers(); // Reset dropdown
    }
  }
}
