import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor, etc.
import data from '../db.json';
import { User, Agent, Customer, Policy, Claim } from '../../../models/model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  // Raw Data typed with interfaces
  // Casting to any first because JSON import might be inferred loosely or strictly depending on config
  users: User[] = (data.users as any[]).map(u => ({ ...u, id: String(u.id) }));
  policies: Policy[] = data.policies as unknown as Policy[];
  customers: Customer[] = (data.customers as any[]).map(c => ({ ...c, userId: String(c.userId) })) as unknown as Customer[];
  agents: Agent[] = data.agents as unknown as Agent[];
  claims: Claim[] = data.claims as unknown as Claim[];

  // Processed Data
  agentDetails: any[] = [];
  customerDetails: any[] = [];

  constructor() {
    this.processData();
  }

  processData() {
    // 1. Enrich Agents with User info and Customer/Policy counts
    this.agentDetails = this.agents.map((agent: Agent) => {
      const user = this.users.find(u => u.id === String(agent.userId));
      const assignedCusts = this.customers.filter(c => agent.assignedCustomers.includes(c.id));

      // Calculate total policies managed by this agent (via customers)
      let totalPolicies = 0;
      assignedCusts.forEach(c => {
        totalPolicies += c.policyIds.length;
      });

      return {
        ...agent,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user ? user.email : 'Unknown',
        assignedCustomersList: assignedCusts,
        totalPoliciesManaged: totalPolicies
      };
    });

    // 2. Enrich Customers with User info and Policy details
    this.customerDetails = this.customers.map((cust: Customer) => {
      const user = this.users.find(u => u.id === String(cust.userId));
      const custPolicies = this.policies.filter(p => cust.policyIds.includes(p.id));

      // Find which agent handles this customer
      const agent = this.agents.find(a => a.assignedCustomers.includes(cust.id));
      const agentUser = agent ? this.users.find(u => u.id === String(agent.userId)) : null;

      return {
        ...cust,
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        email: user ? user.email : 'Unknown',
        policiesList: custPolicies,
        agentName: agentUser ? `${agentUser.firstName} ${agentUser.lastName}` : 'Unassigned'
      };
    });
  }
}
