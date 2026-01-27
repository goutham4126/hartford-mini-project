import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor, etc.
import data from '../db.json';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  // Raw Data
  users = data.users;
  policies = data.policies;
  customers = data.customers;
  agents = data.agents;
  claims = data.claims;

  // Processed Data
  agentDetails: any[] = [];
  customerDetails: any[] = [];

  constructor() {
    this.processData();
  }

  processData() {
    // 1. Enrich Agents with User info and Customer/Policy counts
    this.agentDetails = this.agents.map(agent => {
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
    this.customerDetails = this.customers.map(cust => {
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
