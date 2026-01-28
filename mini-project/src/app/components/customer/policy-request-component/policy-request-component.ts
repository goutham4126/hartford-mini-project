import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Users } from '../../../services/users';
import { Policies } from '../../../services/policies';
import { PolicyRequestService } from '../../../services/policy-request';
import { Policy } from '../../../models/model';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../services/agents';
import { Customers } from '../../../services/customers';

@Component({
  selector: 'app-policy-request-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './policy-request-component.html',
  styleUrl: './policy-request-component.css',
})
export class PolicyRequestComponent implements OnInit {

  private fb = inject(FormBuilder);
  private users = inject(Users);
  private agents= inject(AgentService)
  private policies = inject(Policies);
  private customersService = inject(Customers);
  private policyRequestService = inject(PolicyRequestService);

  agentsList=signal<any[]>([])
  policiesList = signal<Policy[]>([]);

  requestForm = this.fb.group({
    policyId: ['', Validators.required],
    nomineeName: ['', Validators.required],
    nomineeRelation: ['', Validators.required],
    nomineeAge: ['']
  });

  ngOnInit(): void {
    this.users.loadCurrentUser();

    this.agents.getAgents().subscribe((data:any[])=>{
      this.agentsList.set(data);
    })

    this.policies.getPolicies().subscribe((data: Policy[]) => {
      console.log(data)
      this.policiesList.set(data);
    });
  }

  submitRequest(): void {
  if (this.requestForm.invalid || !this.users.currentUser()) {
    return;
  }

  const selectedPolicyId = this.requestForm.value.policyId!;
  // const userId = Number(this.users.currentUser()!.id);
  const userId = this.users.currentUser()!.id;
  const selectedPolicy = this.policiesList()
    .find(policy => policy.id === selectedPolicyId);

  if (!selectedPolicy) {
    alert('Selected policy not found');
    return;
  }

  // Filter eligible agents for this policy
  const eligibleAgents = this.agentsList().filter(agent =>
    selectedPolicy.agentId.includes(agent.id)
  );

  if (!eligibleAgents.length) {
    alert('No agents available');
    return;
  }

  // Pick agent with minimum assignedCustomers
  const selectedAgent = eligibleAgents.reduce((prev, curr) =>
    prev.assignedCustomers.length <= curr.assignedCustomers.length ? prev : curr
  );

  // Get customer by userId
  this.customersService.getCustomerDetails(userId).subscribe(customers => {
    if (!customers.length) {
      alert('Customer not found');
      return;
    }

    const customer = customers[0];
    const customerId = customer.id;

    // Create policy request payload
    const requestPayload = {
      id: crypto.randomUUID(),
      userId: String(userId),
      policyId: selectedPolicyId,
      nominee: {
        name: this.requestForm.value.nomineeName!,
        relation: this.requestForm.value.nomineeRelation!,
        age: this.requestForm.value.nomineeAge
          ? Number(this.requestForm.value.nomineeAge)
          : undefined
      },
      status: 'pending' as const,
      requestedAt: new Date().toISOString(),
      assignedAgentId: selectedAgent.id
    };

    // Save policy request
    this.policyRequestService.addPolicyRequest(requestPayload).subscribe(() => {

      // Update agent assignedCustomers
      const updatedAgent = {
        ...selectedAgent,
        assignedCustomers: selectedAgent.assignedCustomers.includes(customerId)
          ? selectedAgent.assignedCustomers
          : [...selectedAgent.assignedCustomers, customerId]
      };

      this.agents.updateAgent(selectedAgent.id, updatedAgent).subscribe(() => {

        // Update customer policyIds
        const updatedCustomer = {
          ...customer,
          policyIds: customer.policyIds.includes(selectedPolicyId)
            ? customer.policyIds
            : [...customer.policyIds, selectedPolicyId]
        };

        this.customersService.updateCustomer(customerId, updatedCustomer)
          .subscribe(() => {
            alert('Policy request submitted, agent assigned & customer updated!');
            this.requestForm.reset();
          });

      });

    });

  });
}


}
