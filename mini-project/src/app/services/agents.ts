import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from './auth';
import { forkJoin } from 'rxjs';
import { PolicyRequests } from '../models/model';
@Injectable({ providedIn: 'root' })
export class AgentService {
  private api = 'http://localhost:3000';
  constructor(
    private http: HttpClient,
    private auth: Auth
  ) { }
  getAgent(cb: (data: any | null) => void) {
    const currentUser = this.auth.user();
    if (!currentUser) {
      cb(null);
      return;
    }
    const userId = String(currentUser.id);
    forkJoin({
      users: this.http.get<any[]>(`${this.api}/users`),
      agents: this.http.get<any[]>(`${this.api}/agents`)
    }).subscribe(({ users, agents }) => {
      console.log('AUTH USER ID:', userId);
      console.log('AGENTS:', agents);
      const user = users.find(u => String(u.id) === userId);
      const agent = agents.find(a => String(a.userId) === userId);
      if (!user || !agent) {
        cb(null);
        return;
      }
      cb({
        ...agent,
        user
      });
    });
  }
  getAgents() {
    return this.http.get<any[]>(`${this.api}/agents`);
  }
  updateAgent(agentId: string, updatedAgent: any) {
    return this.http.patch(
      `${this.api}/agents/${String(agentId)}`,
      updatedAgent
    );
  }
  getDashboardData(cb: (data: {
    customers: any[];
    customersCount: number;
    totalPolicies: number;
    totalClaims: number;
  }) => void) {
    this.getAgent(agent => {
      if (!agent) {
        cb({ customers: [], customersCount: 0, totalPolicies: 0, totalClaims: 0 });
        return;
      }
      forkJoin({
        users: this.http.get<any[]>(`${this.api}/users`),
        customers: this.http.get<any[]>(`${this.api}/customers`),
        policies: this.http.get<any[]>(`${this.api}/policies`),
        policyRequests: this.http.get<any[]>(`${this.api}/policyRequests`),
        claims: this.http.get<any[]>(`${this.api}/claims`)
      }).subscribe(({ users, customers, policies, policyRequests, claims }) => {
        const agentSpecId = agent.specializationId;
        const myPolicies = policies.filter(p => p.specializationId === agentSpecId);
        const myPolicyIds = myPolicies.map(p => p.id);
        const myRequests = policyRequests.filter(req => myPolicyIds.includes(req.policyId));
        const myCustomerIds = [...new Set(myRequests.map(r => r.customerId))];
        const assignedCustomers = customers
          .filter(c => myCustomerIds.includes(c.id))
          .map(c => {
            const user = users.find(u => u.id === c.userId);
            return {
              id: c.id,
              name: user ? `${user.firstName} ${user.lastName}` : '—',
              email: user?.email ?? '—',
              phone: user?.phone ?? '—',
              city: c.detailedAddress?.city ?? '—',
              kycStatus: c.kycStatus,
              policiesCount: c.policyIds?.length || 0
            };
          });
        const totalPolicies = myRequests.filter(r => r.status === 'approved').length;
        const totalClaims = claims.filter(c => myPolicyIds.includes(c.policyId)).length;
        cb({
          customers: assignedCustomers,
          customersCount: assignedCustomers.length,
          totalPolicies: totalPolicies,
          totalClaims
        });
      });
    });
  }
  getClaims(cb: (claims: any[]) => void) {
    this.getAgent(agent => {
      if (!agent) {
        cb([]);
        return;
      }
      forkJoin({
        policies: this.http.get<any[]>(`${this.api}/policies`),
        claims: this.http.get<any[]>(`${this.api}/claims`)
      }).subscribe(({ policies, claims }) => {
        const myPolicies = policies.filter(p => p.specializationId === agent.specializationId);
        const myPolicyIds = myPolicies.map(p => p.id);
        const agentClaims = claims
          .filter(c => myPolicyIds.includes(c.policyId))
          .map(c => ({
            ...c,
            customerName: c.customerId,
            policyType: c.type
          }));
        cb(agentClaims);
      });
    });
  }
  updateClaim(id: string, data: any) {
    return this.http.patch(
      `${this.api}/claims/${id}`,
      data
    );
  }
  getPolicyRequests(cb: (reqs: any[]) => void) {
    this.getAgent(agent => {
      if (!agent) {
        cb([]);
        return;
      }
      forkJoin({
        policies: this.http.get<any[]>(`${this.api}/policies`),
        requests: this.http.get<any[]>(`${this.api}/policyRequests`)
      }).subscribe(({ policies, requests }) => {
        const myPolicies = policies.filter(p => p.specializationId === agent.specializationId);
        const myPolicyIds = myPolicies.map(p => p.id);
        const myRequests = requests.filter(r => myPolicyIds.includes(r.policyId));
        cb(myRequests);
      });
    });
  }
  updatePolicyRequest(id: string, data: Partial<PolicyRequests>) {
    return this.http.patch(
      `${this.api}/policyRequests/${id}`,
      data
    );
  }
}
