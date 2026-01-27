import { Component, effect } from '@angular/core';
import { inject } from '@angular/core';
import { Auth } from '../../../services/auth';
import { Customers } from '../../../services/customers';
import { Claim } from '../../../models/model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-customer-claims',
  imports: [],
  templateUrl: './customer-claims.html',
  styleUrl: './customer-claims.css',
})
export class CustomerClaims {
  customerService=inject(Customers);
  auth=inject(Auth);
  cdr=inject(ChangeDetectorRef);
  claims?: Claim[];
  policyNameMap: Record<string, string> = {};

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user) return;

      this.customerService
        .getCustomerClaims(user.id)
        .subscribe(res => {
          this.claims = res;
          this.cdr.detectChanges();
        });
        this.customerService
        .getPolicyName()
        .subscribe(map => {
          this.policyNameMap = map;
        });
    });
  }
}
