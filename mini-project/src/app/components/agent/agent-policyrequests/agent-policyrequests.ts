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
    this.agentService.getAgent(agent => {
      if (!agent) {
        this.policyRequests.set([]);
        return;
      }
      const agentId = agent.id;
      this.agentService.getPolicyRequests(reqs => {
        const myRequests = reqs.filter(
          r => r.assignedAgentId === agentId
        );
        this.policyRequests.set(myRequests);
      });
    });
  }
  get pendingCount(): number {
    return this.policyRequests().filter(r => r.status === 'pending').length;
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
