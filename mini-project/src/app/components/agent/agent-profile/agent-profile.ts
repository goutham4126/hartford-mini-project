import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../services/agents';
import { Agent, User } from '../../../models/model';
@Component({
  standalone: true,
  selector: 'app-agent-profile',
  imports: [CommonModule],
  templateUrl: './agent-profile.html'
})
export class AgentProfile {
  agent = signal<(Agent & { user: User }) | null>(null);

  constructor(private agentService: AgentService) {
    this.agentService.getAgent(data => {
      this.agent.set(data);
    });
  }
}
