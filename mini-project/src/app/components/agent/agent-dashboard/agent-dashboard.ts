import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../services/agents';
@Component({
  standalone: true,
  selector: 'app-agent-dashboard',
  imports: [CommonModule],
  templateUrl: './agent-dashboard.html'
})
export class AgentDashboard {
  customers = signal<any[]>([]);
  customersCount = signal(0);
  policiesCount = signal(0);
  claimsCount = signal(0);

  constructor(private agentService: AgentService) {
    this.loadDashboard();
  }

  loadDashboard() {
    this.agentService.getDashboardData(data => {
      this.customers.set(data.customers);
      this.customersCount.set(data.customersCount);
      this.policiesCount.set(data.totalPolicies);
      this.claimsCount.set(data.totalClaims);

      // console.log('dashboard_data', data);
    });
  }
}
