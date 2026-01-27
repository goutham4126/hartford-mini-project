import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Policy, PolicyType } from '../../../models/model';
import { Policies } from '../../../services/policies';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
})
export class CustomerDashboard implements OnInit {
  private policiesService = inject(Policies);

  policies: Policy[] = [];

  // Categorized policies for easy display
  categories: PolicyType[] = ['health', 'vehicle', 'life', 'travel', 'home'];

  selectedCategory: PolicyType = 'health';
  selectedPolicy: Policy | null = null;

  ngOnInit() {
    this.policiesService.getPolicies().subscribe({
      next: (data) => this.policies = data,
      error: (err) => console.error('Failed to load policies', err)
    });
  }

  get filteredPolicies(): Policy[] {
    return this.policies.filter(p => p.type === this.selectedCategory);
  }

  selectCategory(category: PolicyType) {
    this.selectedCategory = category;
    this.selectedPolicy = null; // Clear detail view when switching category
  }

  viewPolicyDetails(policy: Policy) {
    this.selectedPolicy = policy;
  }

  closeDetails() {
    this.selectedPolicy = null;
  }
}
