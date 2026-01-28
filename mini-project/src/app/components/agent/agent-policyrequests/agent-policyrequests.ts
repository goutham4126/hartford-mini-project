import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../services/agents';
import { PolicyRequests } from '../../../models/model';

@Component({
  standalone: true,
  selector: 'app-agent-policyrequests',
  imports: [CommonModule],
  templateUrl: './agent-policyrequests.html'
})
export class AgentPolicyrequests {
  policyRequests = signal<PolicyRequests[]>([]);
  constructor(private agentService: AgentService) {
    this.load();
  }
  load() {
    this.agentService.getPolicyRequests(reqs => {
      this.policyRequests.set(reqs);
    });
  }
  approve(req: PolicyRequests) {
    const updated: Partial<PolicyRequests> = {
      status: 'approved',
      approvedAt: new Date().toISOString(),
      remarks: 'Approved after document verification'
    };
    this.agentService
      .updatePolicyRequest(req.id, updated)
      .subscribe(() => this.load());
  }
  reject(req: PolicyRequests) {
    const updated: Partial<PolicyRequests> = {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      remarks: 'Documents incomplete'
    };
    this.agentService
      .updatePolicyRequest(req.id, updated)
      .subscribe(() => this.load());
  }
}
