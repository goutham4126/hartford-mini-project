import { Component, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { inject } from '@angular/core';
import { Auth } from '../../../services/auth';
import { Customers } from '../../../services/customers';
import { Policy } from '../../../models/model';
import { ChangeDetectorRef } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Claim } from '../../../models/model';
import { ClaimType } from '../../../models/model';

import { Payment } from '../../../models/model';
import { Payments } from '../../../services/payments';

@Component({
  selector: 'app-customer-policies',
  imports: [DecimalPipe, FormsModule, CommonModule, DatePipe],
  templateUrl: './customer-policies.html',
  styleUrl: './customer-policies.css',
})
export class CustomerPolicies {
  customerService = inject(Customers);
  auth = inject(Auth);
  paymentService = inject(Payments);
  cdr = inject(ChangeDetectorRef)
  policies?: Policy[];

  // Claims
  currentClaim: Claim = { id: '', policyId: '', customerId: '', agentId: '', type: 'health', amountRequested: 0, amountApproved: 0, settlementStatus: 'processing', submittedAt: '', status: 'pending', description: '', documents: [] };
  showClaimForm = false;

  // Payments
  showPaymentModal = false;
  selectedPolicyForPayment?: Policy;
  paymentHistory: Payment[] = [];
  pendingAmount = 0;


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
          id: `CLM-${Math.floor(Math.random() * 1000)}`,
          policyId: policy.id,
          customerId: customer.id, // Using customer.id as currentUser is not defined in the original context
          agentId: policy.agentIds?.[0] || 'Unassigned',
          type: policy.type,
          amountRequested: policy.sumInsured,
          amountApproved: 0,
          settlementStatus: 'processing',
          status: 'pending',
          submittedAt: new Date().toISOString(),
          description: 'New Claim Request',
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

  showSuccess = false;

  submitClaim() {
    this.customerService.postClaim(this.currentClaim).subscribe({
      next: res => {
        this.showSuccess = true;
        setTimeout(() => {
          this.showSuccess = false;
          this.showClaimForm = false;
          this.cdr.detectChanges();
        }, 2000);
      },
      error: err => console.error('Claim failed', err)
    });
  }

  closeClaimForm() {
    this.showClaimForm = false;
    this.showSuccess = false;
  }

  // --- PAYMENTS ---
  openPaymentModal(policy: Policy) {
    this.selectedPolicyForPayment = policy;
    this.showPaymentModal = true;
    this.fetchPaymentHistory(policy.id);
  }

  fetchPaymentHistory(policyId: string) {
    this.paymentService.getPayments().subscribe(payments => {
      this.paymentHistory = payments.filter(p => p.policyId === policyId).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    });
  }

  processPayment() {
    if (!this.selectedPolicyForPayment) return;

    const newPayment: Payment = {
      id: `PAY-${Math.floor(Math.random() * 10000)}`,
      requestId: `REQ-${Math.floor(Math.random() * 10000)}`,
      policyId: this.selectedPolicyForPayment.id,
      customerId: this.auth.user()?.id!,
      amountPaid: this.selectedPolicyForPayment.premium,
      totalPremium: this.selectedPolicyForPayment.premium,
      pendingBalance: 0,
      paymentDate: new Date().toISOString(),
      method: 'Credit Card',
      status: 'completed',
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    this.paymentService.processPayment(newPayment).subscribe(() => {
      alert('Payment Successful!');
      this.fetchPaymentHistory(this.selectedPolicyForPayment!.id);
    });
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedPolicyForPayment = undefined;
  }

}
