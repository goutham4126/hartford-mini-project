import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Agent, Customer, Policy, Claim, Payment } from '../../../models/model';
import { Users } from '../../../services/users';
import { Policies } from '../../../services/policies';
import { Customers } from '../../../services/customers';
import { AgentService } from '../../../services/agents';
import { Claims } from '../../../services/claims';
import { Payments } from '../../../services/payments';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  // Raw Data
  users: User[] = [];
  policies: Policy[] = [];
  customers: Customer[] = [];
  agents: Agent[] = [];
  claims: Claim[] = [];
  payments: Payment[] = [];

  // Metrics
  totalAgents = 0;
  totalCustomers = 0;
  activePoliciesCount = 0;
  totalPoliciesCount = 0;

  // Financial Metrics
  totalRevenue = 0;
  pendingRevenue = 0;

  // Claim Metrics
  totalClaimsCount = 0;
  pendingClaimsCount = 0;
  approvedClaimsCount = 0;
  rejectedClaimsCount = 0;

  // Processed Data
  agentDetails: any[] = [];
  customerDetails: any[] = [];

  // --- CHARTS CONFIGURATION ---

  // 1. Agent Performance (Bar)
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Policies Managed', backgroundColor: '#3b82f6' }]
  };

  // 2. Revenue Trend (Line)
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true } }
  };
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{ data: [], label: 'Revenue (₹)', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true }]
  };

  // 3. Policy Distribution (Scatter -> Doughnut for distribution)
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { position: 'right' } }
  };
  public pieChartType: ChartType = 'doughnut';
  public pieChartData: ChartData<'doughnut'> = {
    labels: ['Health', 'Vehicle', 'Life'],
    datasets: [{ data: [], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'] }]
  };

  // 4. Claim Status (Pie)
  public claimPieChartType: ChartType = 'pie';
  public claimPieChartData: ChartData<'pie'> = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{ data: [], backgroundColor: ['#fbbf24', '#34d399', '#f87171'] }]
  };


  constructor(
    private usersService: Users,
    private policiesService: Policies,
    private customersService: Customers,
    private agentsService: AgentService,
    private claimsService: Claims,
    private paymentsService: Payments
  ) { }

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    forkJoin({
      users: this.usersService.getUsers(),
      policies: this.policiesService.getPolicies(),
      customers: this.customersService.getCustomers(),
      agents: this.agentsService.getAgents(),
      claims: this.claimsService.getClaims(),
      payments: this.paymentsService.getPayments()
    }).subscribe({
      next: (data: any) => {
        this.users = data.users.map((u: any) => ({ ...u, id: String(u.id) }));
        this.policies = data.policies;
        this.customers = data.customers.map((c: any) => ({ ...c, userId: String(c.userId) }));
        this.agents = data.agents;
        this.claims = data.claims;
        this.payments = data.payments;

        this.processMetrics();
        this.processData();
        this.updateCharts();
      },
      error: (err) => console.error('Error fetching dashboard data', err),
    });
  }

  processMetrics() {
    this.totalAgents = this.agents.length;
    this.totalCustomers = this.customers.length;
    this.totalPoliciesCount = this.policies.length;
    this.activePoliciesCount = this.policies.filter(p => p.status === 'active').length;

    this.totalClaimsCount = this.claims.length;
    this.pendingClaimsCount = this.claims.filter(c => c.status === 'pending').length;
    this.approvedClaimsCount = this.claims.filter(c => c.status === 'approved').length;
    this.rejectedClaimsCount = this.claims.filter(c => c.status === 'rejected').length;

    // Financials
    this.totalRevenue = this.payments.filter(p => p.status === 'completed' || p.status === 'partial').reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    this.pendingRevenue = this.payments.reduce((sum, p) => sum + (p.pendingBalance || 0), 0);
  }

  processData() {
    // 1. Enrich Agents
    this.agentDetails = this.agents.map((agent: Agent) => {
      const user = this.users.find((u) => u.id === String(agent.userId));
      const assignedCusts = this.customers.filter((c) => agent.assignedCustomers.includes(c.id));
      const totalPolicies = assignedCusts.reduce((sum, c) => sum + c.policyIds.length, 0);

      return {
        ...agent,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user ? user.email : 'Unknown',
        assignedCustomersList: assignedCusts,
        totalPoliciesManaged: totalPolicies,
      };
    });

    // 2. Enrich Customers
    this.customerDetails = this.customers.map((cust: Customer) => {
      const user = this.users.find((u) => u.id === String(cust.userId));
      const custPolicies = this.policies.filter((p) => cust.policyIds.includes(p.id));
      const agent = this.agents.find((a) => a.assignedCustomers.includes(cust.id));
      const agentUser = agent ? this.users.find((u) => u.id === String(agent.userId)) : null;

      return {
        ...cust,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user ? user.email : 'Unknown',
        policiesList: custPolicies,
        agentName: agentUser ? `${agentUser.firstName} ${agentUser.lastName}` : 'Unassigned',
      };
    });
  }

  updateCharts() {
    // 1. Bar Chart: Top 5 Agents by Policies Managed
    const sortedAgents = [...this.agentDetails].sort((a, b) => b.totalPoliciesManaged - a.totalPoliciesManaged).slice(0, 5);
    this.barChartData = {
      labels: sortedAgents.map(a => a.name),
      datasets: [{ data: sortedAgents.map(a => a.totalPoliciesManaged), label: 'Policies Sold', backgroundColor: '#4f46e5' }]
    };

    // 2. Line Chart: Revenue over time (Mocked by payment dates if available, else sequential)
    // Group payments by month
    const revenueByMonth: Record<string, number> = {};
    const months: string[] = [];

    this.payments.forEach(p => {
      const date = new Date(p.paymentDate);
      const key = `${date.toLocaleString('default', { month: 'short' })}`; // e.g., 'Feb'
      if (!revenueByMonth[key]) {
        revenueByMonth[key] = 0;
        if (!months.includes(key)) months.push(key); // Maintain order roughly
      }
      revenueByMonth[key] += p.amountPaid;
    });

    this.lineChartData = {
      labels: Object.keys(revenueByMonth).length ? Object.keys(revenueByMonth) : ['Jan', 'Feb', 'Mar'],
      datasets: [{
        data: Object.values(revenueByMonth).length ? Object.values(revenueByMonth) : [],
        label: 'Revenue Collection (₹)',
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };

    // 3. Doughnut: Policy Distribution by Type
    const healthCount = this.policies.filter(p => p.type === 'health').length;
    const vehicleCount = this.policies.filter(p => p.type === 'vehicle').length;
    const lifeCount = this.policies.filter(p => p.type === 'life').length;

    this.pieChartData = {
      labels: ['Health', 'Vehicle', 'Life'],
      datasets: [{
        data: [healthCount, vehicleCount, lifeCount],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        hoverOffset: 4
      }]
    };

    // 4. Pie: Claim Status
    this.claimPieChartData = {
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [{
        data: [this.pendingClaimsCount, this.approvedClaimsCount, this.rejectedClaimsCount],
        backgroundColor: ['#fbbf24', '#34d399', '#f87171'],
        hoverOffset: 4
      }]
    };
  }
}
