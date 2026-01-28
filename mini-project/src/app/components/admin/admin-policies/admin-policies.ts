import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Policies } from '../../../services/policies';
import { AgentService } from '../../../services/agents';
import { Agent } from '../../../models/model';

@Component({
  selector: 'app-admin-policies',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-policies.html',
  styleUrl: './admin-policies.css',
})
export class AdminPolicies implements OnInit {
  policies = signal<any[]>([])
  agents = signal<Agent[]>([]);

  // Modal State
  selectedPolicy: any = null;
  isModalOpen = false;

  constructor(
    private AllPolicies: Policies,
    private agentService: AgentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchPolicies();
    this.fetchAgents();
  }

  fetchPolicies() {
    this.AllPolicies.getPolicies().subscribe(data => this.policies.set(data));
  }

  fetchAgents() {
    this.agentService.getAgents().subscribe(data => this.agents.set(data));
  }

  getPolicyAgents(policy: any): string {
    if (!policy.specializationId) return 'N/A';

    // Find agents matching the policy's specialization
    const matches = this.agents().filter(a => a.specializationId === policy.specializationId);

    if (matches.length === 0) return 'None';

    // Return comma separated User IDs (names)
    return matches.map(a => a.userId).join(', ');
  }

  // Actions
  viewPolicy(policy: any) {
    this.selectedPolicy = policy;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedPolicy = null;
  }

  editPolicy(id: string) {
    this.router.navigate(['/admin/create-policy'], { queryParams: { id } });
  }

  deletePolicy(id: string) {
    if (confirm('Are you sure you want to delete this policy?')) {
      this.AllPolicies.deletePolicy(id).subscribe({
        next: () => {
          this.policies.update(current => current.filter(p => p.id !== id));
        },
        error: (err) => alert('Failed to delete policy')
      });
    }
  }
}
