import { Component, inject } from '@angular/core';
import { Customers } from '../../../services/customers';
import { Auth } from '../../../services/auth';
import { Customer,User } from '../../../models/model';
import { effect } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-customer-profile',
  imports: [],
  templateUrl: './customer-profile.html',
  styleUrl: './customer-profile.css',
})
export class CustomerProfile {
customerService = inject(Customers);
  auth = inject(Auth);
  cdr=inject(ChangeDetectorRef);
currentCustomer?: Customer;
  currentUser?: User;
  constructor() {
    effect(() => {
      const user = this.auth.user();  
      if (!user) return;              
      
      this.customerService.getUserName(user.id).subscribe(res => {
        this.currentUser = res[0];
        this.cdr.detectChanges();
      });

      this.customerService
        .getCustomerDetails(user.id)
        .subscribe(res => {
          this.currentCustomer = res[0];
          this.cdr.detectChanges();
        });
    });
  
  }
}
