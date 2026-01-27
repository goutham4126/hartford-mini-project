import { Component, effect } from '@angular/core';
import { inject } from '@angular/core';
import { Auth } from '../../../services/auth';
import { Customers } from '../../../services/customers';
import { Policy } from '../../../models/model';
import { ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';


@Component({
  selector: 'app-customer-policies',
  imports: [DecimalPipe],
  templateUrl: './customer-policies.html',
  styleUrl: './customer-policies.css',
})
export class CustomerPolicies {
  customerService=inject(Customers);
  auth=inject(Auth);
  cdr=inject(ChangeDetectorRef)
   policies?: Policy[];

  constructor() {
    effect(() => {
      const user = this.auth.user();
      if (!user) return;

      this.customerService
        .getCustomerPolicies(user.id)
        .subscribe(res => {
          this.policies = res;
          this.cdr.detectChanges();
        });
    });
  }
   getYears(days: number): string {
    return (days / 365).toFixed(1);
  }
}
