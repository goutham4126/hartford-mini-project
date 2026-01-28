import { Component, effect, inject } from '@angular/core';
import { Customers } from '../../../services/customers';
import { Auth } from '../../../services/auth';
import { Claim, Customer, Policy, User } from '../../../models/model';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-customer-dashboard-original',
  imports: [],
  templateUrl: './customer-dashboard-original.html',
  styleUrl: './customer-dashboard-original.css',
})
export class CustomerDashboardOriginal {
  customersService = inject(Customers);
  auth = inject(Auth);
  cdr=inject(ChangeDetectorRef);

  user?: User;
  customer?: Customer;
  policies?: Policy[];
  claims?: Claim[];
   policyNameMap: Record<string, string> = {};

  activePoliciesCount = 0;

  constructor() {
    effect(() => {
      const authUser = this.auth.user();
      if (!authUser) return;

     
      this.customersService
        .getUserName(authUser.id)
        .subscribe(res => {
          this.user = res[0];
          this.cdr.detectChanges();
        });

     
      this.customersService
        .getCustomerDetails(authUser.id)
        .subscribe(res => {
          this.customer = res[0];
          this.cdr.detectChanges();
        });

    
      this.customersService
        .getCustomerPolicies(authUser.id)
        .subscribe(res => {
          this.policies = res;
          this.activePoliciesCount = res.filter(
            p => p.status === 'active'
          ).length;
          this.cdr.detectChanges();
        });

      this.customersService
        .getCustomerClaims(authUser.id)
        .subscribe(res => {
          this.claims = res;
          this.cdr.detectChanges();
        });
        this.customersService.getPolicyName().subscribe(map => {
        this.policyNameMap = map;
      });
    });
  }
}
