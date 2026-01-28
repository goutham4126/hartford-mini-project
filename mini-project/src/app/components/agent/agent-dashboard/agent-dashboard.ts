import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AgentService } from '../../../services/agents';
import { Policies } from '../../../services/policies';
import { Claims } from '../../../services/claims';
import { Customers } from '../../../services/customers';
import { Payments } from '../../../services/payments';
import { Users } from '../../../services/users';
import { Specializations } from '../../../services/specializations'; // Added Import
import { Auth } from '../../../services/auth'; // Added Import
// Added Import
import { Agent, Customer, Policy, Claim, Payment, User, Specialization } from '../../../models/model';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  standalone: true,
  selector: 'app-agent-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './agent-dashboard.html'
})
export class AgentDashboard implements OnInit {
  // Data Signals
  customerList = signal<any[]>([]);

  // 8 Key Metrics
  customersCount = 0;
  policiesSoldCount = 0;
  activePoliciesCount = 0;
  totalPremium = 0;
  commissionEarned = 0;
  pendingPremium = 0;
  claimsCount = 0;
  approvalRate = 0;

  // Charts
  public salesChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public salesChartOptions: ChartConfiguration['options'] = { responsive: true };

  public statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  public statusChartOptions: ChartConfiguration['options'] = { responsive: true };

  currentUser: User | null = null;
  agentProfile: Agent | null = null;
  specializationName = ''; // Added field

  constructor(
    private agentService: AgentService,
    private policyService: Policies,
    private claimService: Claims,
    private custService: Customers,
    private payService: Payments,
    private userService: Users,
    private specService: Specializations,
    private authService: Auth, // Injected Auth
    private http: HttpClient // Injected
  ) { }

  ngOnInit() {
    // improved: use Auth service to get current user to ensure consistency
    this.currentUser = this.authService.user();
    if (this.currentUser) {
      this.loadDashboardData();
    }
  }

  loadDashboardData() {
    // 1. Get Agent Profile reliably via Service
    this.agentService.getAgent((agent) => {
      this.agentProfile = agent;

      if (this.agentProfile) {
        const profile = this.agentProfile; // Local const for TS narrowing
        console.log('Agent loaded via Service:', profile);

        // 2. ForkJoin for related data
        forkJoin({
          policies: this.policyService.getPolicies(),
          claims: this.claimService.getClaims(),
          customers: this.custService.getCustomers(),
          payments: this.payService.getPayments(),
          specs: this.specService.getSpecializations(),
          users: this.userService.getUsers(), // Fetch Users for Name Mapping
          requests: this.http.get<any[]>('http://localhost:3000/policyRequests')
        }).subscribe({
          next: (data) => {
            // Map Specialization Name
            const spec = data.specs.find(s => s.id === profile.specializationId);
            this.specializationName = spec ? spec.name : (profile.specialization || 'General');
            const specId = profile.specializationId;

            // 1. My Policies (Matched by Specialization ID)
            // Use implicit linking: Policy.SpecId === Agent.SpecId
            const myPolicies = data.policies.filter(p => p.specializationId === specId);
            const myPolicyIds = myPolicies.map(p => p.id);

            // 2. My Requests (Requests for my policies)
            // Filter requests where policyId is in myPolicies
            const myRequests = data.requests.filter(r => myPolicyIds.includes(r.policyId));

            // 3. My Customers (Merged Explicit + Implicit)
            // Explicit: From Agent Profile
            const explicitCustIds = profile.assignedCustomers || [];
            // Implicit: From Requests
            const implicitCustIds = myRequests.map(r => r.customerId);

            // Unique Union
            const allMyCustIds = [...new Set([...explicitCustIds, ...implicitCustIds])];

            const myCustomers = data.customers
              .filter(c => allMyCustIds.includes(c.id))
              .map(c => {
                // Map to User for Display Info
                const u = data.users.find(u => u.id === c.userId);
                return {
                  ...c,
                  displayId: c.id,
                  displayName: u ? `${u.firstName} ${u.lastName}` : c.id,
                  displayEmail: u ? u.email : 'N/A',
                  policiesCount: c.policyIds?.length || 0
                };
              });

            // 4. My Claims & Payments
            const myClaims = data.claims.filter(c => myPolicyIds.includes(c.policyId));
            const myPayments = data.payments.filter(p => myPolicyIds.includes(p.policyId));

            // Metrics
            this.customersCount = myCustomers.length;
            this.policiesSoldCount = myRequests.filter(r => r.status === 'approved').length;
            this.activePoliciesCount = myPolicies.filter(p => p.status === 'active').length;

            this.totalPremium = myPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
            this.pendingPremium = myPayments.reduce((sum, p) => sum + (p.pendingBalance || 0), 0);

            // Commission
            const rate = profile.commissionRate || 0;
            this.commissionEarned = this.totalPremium * (rate / 100);

            this.claimsCount = myClaims.length;
            const approvedClaims = myClaims.filter(c => c.status === 'approved').length;
            this.approvalRate = this.claimsCount > 0 ? (approvedClaims / this.claimsCount) * 100 : 0;

            // Process Customer View
            this.customerList.set(myCustomers);

            // Update Charts
            this.updateCharts(myPolicies, myPayments);
          },
          error: (err) => console.error('Failed to load dashboard data:', err)
        });
      } else {
        console.warn('Agent Profile could not be loaded via service.');
      }
    });
  }

  updateCharts(policies: Policy[], payments: Payment[]) {
    // 1. Sales Chart (Monthly Premium)
    const revenueMap: { [key: string]: number } = {};
    payments.forEach(p => {
      const month = new Date(p.paymentDate).toLocaleString('default', { month: 'short', year: 'numeric' });
      revenueMap[month] = (revenueMap[month] || 0) + (p.amountPaid || 0);
    });

    this.salesChartData = {
      labels: Object.keys(revenueMap),
      datasets: [
        { data: Object.values(revenueMap), label: 'Total Premium (₹)', borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.2)', fill: true }
      ]
    };

    // 2. Policy Status
    const active = policies.filter(p => p.status === 'active').length;
    const inactive = policies.filter(p => p.status !== 'active').length;

    this.statusChartData = {
      labels: ['Active', 'Inactive/Expired'],
      datasets: [{ data: [active, inactive], backgroundColor: ['#10b981', '#94a3b8'] }]
    };
  }
}
