import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Agent, PolicyType } from '../../../models/model';
import { AgentService } from '../../../services/agents';
import { Policies } from '../../../services/policies';

@Component({
  selector: 'app-admin-create-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-create-policy.html',
  styleUrls: ['./admin-create-policy.css'],
})
export class AdminCreatePolicy implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private agentService = inject(AgentService);
  private policiesService = inject(Policies);

  agents: Agent[] = [];
  policyTypes: PolicyType[] = ['health', 'vehicle', 'life', 'travel', 'home'];

  policyForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['health', [Validators.required]],
    premium: [null, [Validators.required, Validators.min(0)]],
    sumInsured: [null, [Validators.required, Validators.min(0)]],
    duration: [365, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required]],
    minEntryAge: [18, [Validators.required, Validators.min(0)]],
    maxEntryAge: [70, [Validators.required, Validators.min(0)]],
    agentIds: [[] as string[], [Validators.required, Validators.minLength(1)]],
  });

  ngOnInit() {
    this.fetchAgents();
  }

  fetchAgents() {
    this.agentService.getAgents().subscribe({
      next: (data) => {
        this.agents = data;
      },
      error: (err) => console.error('Failed to fetch agents', err),
    });
  }

  // Handle checkbox change for agent selection
  onAgentCheckboxChange(agentId: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const currentIds = this.policyForm.get('agentIds')?.value || [];
    
    let updatedIds: string[];
    
    if (checkbox.checked) {
      // Add agent if not already in the array
      updatedIds = currentIds.includes(agentId) 
        ? currentIds 
        : [...currentIds, agentId];
    } else {
      // Remove agent from array
      updatedIds = currentIds.filter(id => id !== agentId);
    }
    
    this.policyForm.patchValue({ agentIds: updatedIds });
    this.policyForm.get('agentIds')?.markAsTouched();
  }

  // Check if an agent is selected
  isAgentSelected(agentId: string): boolean {
    const currentIds = this.policyForm.get('agentIds')?.value || [];
    return currentIds.includes(agentId);
  }

  // Remove an agent from selection
  removeAgent(agentId: string) {
    const currentIds = this.policyForm.get('agentIds')?.value || [];
    const updatedIds = currentIds.filter(id => id !== agentId);
    this.policyForm.patchValue({ agentIds: updatedIds });
    this.policyForm.get('agentIds')?.markAsTouched();
  }

  onSubmit() {
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      return;
    }

    const formValue = this.policyForm.value;

    const typeInitial = (formValue.type as string).charAt(0).toUpperCase();
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newId = `POL-${typeInitial}-${randomId}`;

    const newPolicy = {
      id: newId,
      name: formValue.name,
      type: formValue.type,
      premium: formValue.premium,
      sumInsured: formValue.sumInsured,
      duration: formValue.duration,
      description: formValue.description,
      minEntryAge: formValue.minEntryAge,
      maxEntryAge: formValue.maxEntryAge,
      agentIds: formValue.agentIds || [],
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      features: ['Standard Coverage'],
      exclusions: [],
      networkHospitals: [],
      keyBenefits: [],
    };

    this.policiesService.createPolicy(newPolicy).subscribe({
      next: () => {
        alert('Policy Created Successfully!');
        this.router.navigate(['/admin/policies']);
      },
      error: (err) => {
        console.error('Error creating policy', err);
        alert('Failed to create policy.');
      },
    });
  }
}