import { Component, OnInit, signal } from '@angular/core';
import { Claims } from '../../../services/claims';

@Component({
  selector: 'app-admin-claims',
  imports: [],
  templateUrl: './admin-claims.html',
  styleUrl: './admin-claims.css',
})
export class AdminClaims implements OnInit {
  claims=signal<any[]>([])
  constructor(private AllClaims:Claims){}

  ngOnInit(){
    this.AllClaims.getClaims().subscribe(data=>this.claims.set(data))
  }
}
