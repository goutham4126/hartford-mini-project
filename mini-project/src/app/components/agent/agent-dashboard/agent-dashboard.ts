import { Component,signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../services/agents';

@Component({
  standalone: true,
  selector: 'app-agent-dashboard',
  imports: [CommonModule],
  templateUrl: './agent-dashboard.html'
})
export class AgentDashboard {

  customersCount = signal(0);
  policiesCount = signal(0);
  claimsCount = signal(0);

  customers= signal<any[]>([]);


  constructor(private agentService: AgentService) {
    this.loadDashboard();
  }

  loadDashboard() {
    this.agentService.getDashboardData(data => {
      this.customersCount.set(data.customersCount);
      this.policiesCount.set(data.totalPolicies);
      this.claimsCount.set(data.totalClaims);
      this.customers.set(data.customers);
    });
  }
}
