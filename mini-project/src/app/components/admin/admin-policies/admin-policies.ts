import { Component, OnInit, signal } from '@angular/core';
import { Policies } from '../../../services/policies';

@Component({
  selector: 'app-admin-policies',
  imports: [],
  templateUrl: './admin-policies.html',
  styleUrl: './admin-policies.css',
})
export class AdminPolicies implements OnInit {
  policies=signal<any[]>([])
  constructor(private AllPolicies:Policies){}

  ngOnInit(): void {
    this.AllPolicies.getPolicies().subscribe(data=>this.policies.set(data))
  }
}
