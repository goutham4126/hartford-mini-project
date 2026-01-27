import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AgentService } from '../../../services/agents';
import { Auth } from '../../../services/auth';

@Component({
  standalone: true,
  selector: 'app-agent-profile',
  imports: [CommonModule],
  templateUrl: './agent-profile.html'
})
export class AgentProfile {

  user= signal<any>([]);
  agent=signal<any>([]);

  constructor(
    private auth: Auth,
    private agentService: AgentService,
    private http: HttpClient
  ) {
    this.loadUser();
    this.loadAgent();
  }

  loadUser() {
    const userId = String(this.auth.user()?.id);

    this.http.get<any[]>('http://localhost:3000/users')
      .subscribe(users => {
        this.user.set(users.find(u => String(u.id) === userId));
      });
  }

  loadAgent() {
    this.agentService.getAgent((agent: any) => {
      this.agent.set(agent);
    });
  }
}
