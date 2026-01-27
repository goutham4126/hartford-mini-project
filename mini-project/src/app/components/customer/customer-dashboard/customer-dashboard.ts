import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import data from '../../admin/db.json';
import { Policy, PolicyType } from '../../../models/model';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
})
export class CustomerDashboard {
  policies: Policy[] = data.policies as unknown as Policy[];

  // Categorized policies for easy display
  categories: PolicyType[] = ['health', 'vehicle', 'life', 'travel', 'home'];

  selectedCategory: PolicyType = 'health';
  selectedPolicy: Policy | null = null;

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
