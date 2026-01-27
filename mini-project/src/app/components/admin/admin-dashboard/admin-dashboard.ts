import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, Agent, Customer, Policy, Claim } from '../../../models/model';
import { Users } from '../../../services/users';
import { Policies } from '../../../services/policies';
import { Customers } from '../../../services/customers';
import { AgentService } from '../../../services/agents';
import { Claims } from '../../../services/claims';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  // Raw Data typed with interfaces
  users: User[] = [];
  policies: Policy[] = [];
  customers: Customer[] = [];
  agents: Agent[] = [];
  claims: Claim[] = [];

  // Processed Data
  agentDetails: any[] = [];
  customerDetails: any[] = [];

  constructor(
    private usersService: Users,
    private policiesService: Policies,
    private customersService: Customers,
    private agentsService: AgentService,
    private claimsService: Claims
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
    }).subscribe({
      next: (data: any) => {
        this.users = data.users.map((u: any) => ({ ...u, id: String(u.id) }));
        this.policies = data.policies;
        this.customers = data.customers.map((c: any) => ({ ...c, userId: String(c.userId) }));
        this.agents = data.agents;
        this.claims = data.claims;

        this.processData();
      },
      error: (err) => {
        console.error('Error fetching dashboard data', err);
      },
    });
  }

  processData() {
    // 1. Enrich Agents with User info and Customer/Policy counts
    this.agentDetails = this.agents.map((agent: Agent) => {
      const user = this.users.find((u) => u.id === String(agent.userId));
      const assignedCusts = this.customers.filter((c) =>
        agent.assignedCustomers.includes(c.id)
      );

      // Calculate total policies managed by this agent (via customers)
      let totalPolicies = 0;
      assignedCusts.forEach((c) => {
        totalPolicies += c.policyIds.length;
      });

      return {
        ...agent,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user ? user.email : 'Unknown',
        assignedCustomersList: assignedCusts,
        totalPoliciesManaged: totalPolicies,
      };
    });

    // 2. Enrich Customers with User info and Policy details
    this.customerDetails = this.customers.map((cust: Customer) => {
      const user = this.users.find((u) => u.id === String(cust.userId));
      const custPolicies = this.policies.filter((p) =>
        cust.policyIds.includes(p.id)
      );

      // Find which agent handles this customer
      const agent = this.agents.find((a) =>
        a.assignedCustomers.includes(cust.id)
      );
      const agentUser = agent
        ? this.users.find((u) => u.id === String(agent.userId))
        : null;

      return {
        ...cust,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user ? user.email : 'Unknown',
        policiesList: custPolicies,
        agentName: agentUser
          ? `${agentUser.firstName} ${agentUser.lastName}`
          : 'Unassigned',
      };
    });
  }
}
