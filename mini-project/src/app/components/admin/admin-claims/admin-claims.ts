import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Claims } from '../../../services/claims';

@Component({
  selector: 'app-admin-claims',
  imports: [CommonModule],
  templateUrl: './admin-claims.html',
  styleUrl: './admin-claims.css',
})
export class AdminClaims implements OnInit {
  claims = signal<any[]>([])
  constructor(private AllClaims: Claims) { }

  ngOnInit() {
    this.AllClaims.getClaims().subscribe(data => this.claims.set(data))
  }
}
