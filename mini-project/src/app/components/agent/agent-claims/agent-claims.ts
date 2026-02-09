import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../services/agents';
@Component({
  standalone: true,
  selector: 'app-agent-claims',
  imports: [CommonModule],
  templateUrl: './agent-claims.html'
})
export class AgentClaims {
  claims = signal<any[]>([]);
  constructor(private agentService: AgentService) {
    this.loadClaims();
  }
  loadClaims() {
    this.agentService.getClaims(data => {
      this.claims.set(data);
      // console.log('AGENT CLAIMS:', data);
    });
  }
  approve(c: any) {
    this.agentService.updateClaim(c.id, {
      status: 'approved'
    }).subscribe(() => {
      this.loadClaims();
    });
  }
  reject(c: any) {
    this.agentService.updateClaim(c.id, {
      status: 'rejected'
    }).subscribe(() => {
      this.loadClaims();
    });
  }
}
