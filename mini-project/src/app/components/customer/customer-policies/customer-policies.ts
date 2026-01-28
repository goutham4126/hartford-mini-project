import { Component, effect } from '@angular/core';
import { inject } from '@angular/core';
import { Auth } from '../../../services/auth';
import { Customers } from '../../../services/customers';
import { Policy } from '../../../models/model';
import { ChangeDetectorRef } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Claim } from '../../../models/model';
import { ClaimType } from '../../../models/model';


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
  currentClaim:Claim={id:'',policyId:'',customerId:'',type:'health',amount:0,date:'',status:'pending',description:'',documents:[]};
  showClaimForm = false;


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

claimPolicy(policy: Policy) {
  this.showClaimForm = true;
  const user = this.auth.user();
  if (!user) return;

  this.customerService.getCustomerDetails(user.id).subscribe(customers => {
    const customer = customers[0];

    this.customerService.getAllClaims().subscribe(claims => {

      const nextNumber = claims.length + 1;
      const claimId = `CLAIM-${String(nextNumber).padStart(3, '0')}`;

      this.currentClaim = {
        id: claimId,
        policyId: policy.id,
        customerId: customer.id,
        type: policy.type,
        amount: policy.sumInsured,
        date: new Date().toISOString(),
        status: 'pending',
        description: '',
        documents: []
      };
    });
  });
}

onDescriptionChange(value: string) {
  this.currentClaim.description = value;
}

onFilesSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files) return;

  const newFiles = Array.from(input.files).map(file => file.name);

  this.currentClaim.documents = [
    ...this.currentClaim.documents,
    ...newFiles
  ];
}

submitClaim() {
  console.log("claim called")
  console.log('CLAIM WITH USER INPUT 👉', this.currentClaim);
  this.customerService.postClaim(this.currentClaim).subscribe({
  next: res => console.log('Claim submitted', res),
  error: err => console.error('Claim failed', err)
});
  this.showClaimForm = false;
}


closeClaimForm() {
  this.showClaimForm = false;
}

}
