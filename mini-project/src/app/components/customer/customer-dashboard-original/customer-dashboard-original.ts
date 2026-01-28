import { Component, effect, inject, signal } from '@angular/core';
import { Customers } from '../../../services/customers';
import { Auth } from '../../../services/auth';
import { Payments } from '../../../services/payments';
import { Claim, Customer, Policy, User, Payment } from '../../../models/model';
import { ChangeDetectorRef } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-dashboard-original',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './customer-dashboard-original.html',
  styleUrl: './customer-dashboard-original.css',
})
export class CustomerDashboardOriginal {
  customersService = inject(Customers);
  auth = inject(Auth);
  paymentService = inject(Payments);
  cdr = inject(ChangeDetectorRef);

  user?: User;
  customer?: Customer;
  policies?: Policy[];
  claims?: Claim[];
  payments?: Payment[];
  policyNameMap: Record<string, string> = {};

  // Metrics
  activePoliciesCount = 0;
  totalPremiumPaid = 0;
  totalPendingDue = 0;

  // Charts
  public expenseChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public expenseChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  public claimChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public claimChartOptions: ChartConfiguration['options'] = { responsive: true, maintainAspectRatio: false };

  constructor() {
    effect(() => {
      const authUser = this.auth.user();
      if (!authUser) return;

      // 1. User Name
      this.customersService.getUserName(authUser.id).subscribe(res => {
        this.user = res[0];
        this.cdr.detectChanges();
      });

      // 2. Customer Details
      this.customersService.getCustomerDetails(authUser.id).subscribe(res => {
        this.customer = res[0];
        this.cdr.detectChanges();
      });

      // 3. Policies & Financials
      this.customersService.getCustomerPolicies(authUser.id).subscribe(policies => {
        this.policies = policies;
        this.activePoliciesCount = policies.filter(p => p.status === 'active').length;

        // Fetch Payments for these policies
        this.paymentService.getPayments().subscribe(allPayments => {
          const myPolicyIds = policies.map(p => p.id);
          this.payments = allPayments.filter(pay => myPolicyIds.includes(pay.policyId));

          // Calculate Financials
          this.totalPremiumPaid = this.payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
          this.totalPendingDue = this.payments.reduce((sum, p) => sum + (p.pendingBalance || 0), 0);

          this.updateExpenseChart(this.payments);
        });

        this.cdr.detectChanges();
      });

      // 4. Claims
      this.customersService.getCustomerClaims(authUser.id).subscribe(res => {
        this.claims = res;
        this.updateClaimChart(res);
        this.cdr.detectChanges();
      });

      this.customersService.getPolicyName().subscribe(map => {
        this.policyNameMap = map;
      });
    });
  }

  updateExpenseChart(payments: Payment[]) {
    const monthlyData: any = {};
    payments.forEach(p => {
      const date = new Date(p.paymentDate); // Assuming paymentDate exists
      const key = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[key] = (monthlyData[key] || 0) + p.amountPaid;
    });

    this.expenseChartData = {
      labels: Object.keys(monthlyData),
      datasets: [{
        data: Object.values(monthlyData),
        label: 'Monthly Expense (₹)',
        backgroundColor: '#6366f1',
        borderRadius: 5
      }]
    };
  }

  updateClaimChart(claims: Claim[]) {
    const pending = claims.filter(c => c.status === 'pending').length;
    const approved = claims.filter(c => c.status === 'approved').length;
    const rejected = claims.filter(c => c.status === 'rejected').length;

    this.claimChartData = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{
        data: [approved, pending, rejected],
        backgroundColor: ['#10b981', '#fbbf24', '#ef4444']
      }]
    };
  }
}
