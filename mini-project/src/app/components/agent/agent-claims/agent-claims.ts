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
    this.agentService.getClaims((claims: any[]) => {
      this.claims.set(claims); 
    });
  }

  approve(id: string) {
    console.log('Approved claim:', id);
  }

  reject(id: string) {
    console.log('Rejected claim:', id);
  }
}
