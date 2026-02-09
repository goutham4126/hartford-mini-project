import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AgentService } from '../../../services/agents';
import { Policies } from '../../../services/policies';
import { Claims } from '../../../services/claims';
import { Customers } from '../../../services/customers';
import { Payments } from '../../../services/payments';
import { Users } from '../../../services/users';
import { Specializations } from '../../../services/specializations';
import { Auth } from '../../../services/auth';
import { Agent,Policy,Payment,User } from '../../../models/model';
import { ChartConfiguration, ChartData } from 'chart.js';
@Component({
  standalone: true,
  selector: 'app-agent-dashboard',
  imports: [CommonModule],
  templateUrl: './agent-dashboard.html'
})
export class AgentDashboard implements OnInit {
  customerList = signal<any[]>([]);
  customersCount = 0;
  policiesSoldCount = 0;
  activePoliciesCount = 0;
  totalPremium = 0;
  pendingPremium = 0;
  commissionEarned = 0;
  claimsCount = 0;
  approvalRate = 0;
  salesChartData: ChartData<'line'> = { labels: [], datasets: [] };
  salesChartOptions: ChartConfiguration['options'] = { responsive: true };
  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  statusChartOptions: ChartConfiguration['options'] = { responsive: true };
  currentUser: User | null = null;
  agentProfile: Agent | null = null;
  specializationName = 'General';
  constructor(
    private agentService: AgentService,
    private policyService: Policies,
    private claimService: Claims,
    private custService: Customers,
    private payService: Payments,
    private userService: Users,
    private specService: Specializations,
    private authService: Auth,
    private http: HttpClient
  ) {}
  ngOnInit() {
    this.currentUser = this.authService.user();
    if (this.currentUser) {
      this.loadDashboardData(this.currentUser.id);
    }
  }
  loadDashboardData(userId: string) {
    this.agentService.getAgent((agent) => {
      this.agentProfile = agent;
      if (!this.agentProfile) {
        console.warn('Agent profile not found');
        return;
      }
      const agentId = this.agentProfile.id;
      forkJoin({
        policies: this.policyService.getPolicies(),
        claims: this.claimService.getClaims(),
        customers: this.custService.getCustomers(),
        payments: this.payService.getPayments(),
        users: this.userService.getUsers(),
        specs: this.specService.getSpecializations(),
        requests: this.http.get<any[]>('http://localhost:3000/policyRequests')
      }).subscribe(({ policies, claims, customers, payments, users, specs, requests }) => {
        const spec = specs.find(s => s.id === this.agentProfile!.specializationId);
        this.specializationName = spec?.name || this.agentProfile!.specialization || 'General';
        const myPolicies = policies.filter(p =>
          p.agentIds?.includes(agentId)
        );
        const myRequests = requests.filter(r =>
          r.assignedAgentId === agentId
        );
        const explicitUserIds = this.agentProfile!.assignedCustomers || [];
        const requestUserIds = myRequests.map(r => r.userId);
        const allUserIds = [...new Set([...explicitUserIds, ...requestUserIds])];
        const myCustomers = customers
          .filter(c => allUserIds.includes(c.userId))
          .map(c => {
            const u = users.find(u => u.id === c.userId);
            return {
              ...c,
              displayName: u ? `${u.firstName} ${u.lastName}` : 'Unknown',
              displayEmail: u?.email || 'N/A',
              policiesCount: c.policyIds?.length || 0
            };
          });
        const myClaims = claims.filter(c => c.agentId === agentId);
        const myPayments = payments.filter(p =>
          myPolicies.some(pol => pol.id === p.policyId)
        );
        this.customersCount = myCustomers.length;
        this.policiesSoldCount = myRequests.filter(r => r.status === 'approved').length;
        this.activePoliciesCount = myPolicies.filter(p => p.status === 'active').length;
        this.totalPremium = myPayments.reduce((s, p) => s + (p.amountPaid || 0), 0);
        this.pendingPremium = myPayments.reduce((s, p) => s + (p.pendingBalance || 0), 0);
        this.commissionEarned =this.totalPremium * ((this.agentProfile!.commissionRate || 0) / 100);
        this.claimsCount = myClaims.length;
        this.approvalRate = myRequests.length
          ? (myRequests.filter(r => r.status === 'approved').length / myRequests.length) * 100
          : 0;
        this.customerList.set(myCustomers);
        this.updateCharts(myPolicies, myPayments);
      });
    });
  }
  updateCharts(policies: Policy[], payments: Payment[]) {
    const revenueMap: Record<string, number> = {};
    payments.forEach(p => {
      const key = new Date(p.paymentDate).toLocaleString('default', {
        month: 'short',
        year: 'numeric'
      });
      revenueMap[key] = (revenueMap[key] || 0) + (p.amountPaid || 0);
    });
    this.salesChartData = {
      labels: Object.keys(revenueMap),
      datasets: [
        {
          data: Object.values(revenueMap),
          label: 'Total Premium (₹)',
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.2)',
          fill: true
        }
      ]
    };
    const active = policies.filter(p => p.status === 'active').length;
    const inactive = policies.length - active;
    this.statusChartData = {
      labels: ['Active', 'Inactive'],
      datasets: [
        { data: [active, inactive], backgroundColor: ['#10b981', '#94a3b8'] }
      ]
    };
  }
}
