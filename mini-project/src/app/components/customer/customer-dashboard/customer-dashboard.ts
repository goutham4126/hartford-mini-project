import { Component, effect } from '@angular/core';
import { Customers } from '../../../services/customers';
import { Auth } from '../../../services/auth';
import { inject } from '@angular/core';
import { Claim, Customer, Policy, User } from '../../../models/model';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-customer-dashboard',
  imports: [],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.css',
})
export class CustomerDashboard {
  customersService=inject(Customers);
  cdr=inject(ChangeDetectorRef);
  auth=inject(Auth);
  customer?: Customer;
  user?: User;
  policies?: Policy[];
    activePoliciesCount = 0;
  claims?: Claim[];
  policyNameMap: Record<string, string> = {};

  constructor() {
    effect(() => {
      const authUser = this.auth.user();
      if (!authUser) return;

      // USER
      this.customersService.getUserName(authUser.id).subscribe(res => {
        this.user = res[0];
        this.cdr.detectChanges();
      });

      // CUSTOMER
      this.customersService.getCustomerDetails(authUser.id).subscribe(res => {
        this.customer = res[0];
        this.cdr.detectChanges();
      });

      // POLICIES
      this.customersService.getCustomerPolicies(authUser.id).subscribe(res => {
        this.policies = res;
        this.activePoliciesCount = res.filter(
          p => p.status === 'active'
        ).length;
        this.cdr.detectChanges();
      });

      // CLAIMS
      this.customersService.getCustomerClaims(authUser.id).subscribe(res => {
        this.claims = res;
        this.cdr.detectChanges();
      });

      // POLICY NAME MAP (for claims)
      this.customersService.getPolicyName().subscribe(map => {
        this.policyNameMap = map;
        this.cdr.detectChanges();
      });
    });
  }
}
