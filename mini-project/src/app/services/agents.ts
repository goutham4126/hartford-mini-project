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

  //agent +userinfo 
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

      // console.log('MATCHED USER:', user);
      // console.log('MATCHED AGENT:', agent);

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
        cb({
          customers: [],
          customersCount: 0,
          totalPolicies: 0,
          totalClaims: 0
        });
        return;
      }
      forkJoin({
        users: this.http.get<any[]>(`${this.api}/users`),
        customers: this.http.get<any[]>(`${this.api}/customers`),
        policyRequests: this.http.get<any[]>(
          `${this.api}/policyRequests?assignedAgentId=${agent.id}`
        ),
        claims: this.http.get<any[]>(`${this.api}/claims`)
      }).subscribe(({ users, customers, policyRequests, claims }) => {
        //Customers assigned to agent
        const assignedCustomers = customers
          .filter(c => agent.assignedCustomers?.includes(c.id))
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
        //Total policies handled by agent
        const totalPolicies = policyRequests.length;
        //Claims related to agent policies
        const policyIds = policyRequests.map(p => p.policyId);
        const totalClaims = claims.filter(c =>
          policyIds.includes(c.policyId)
        ).length;

        cb({
          customers: assignedCustomers,
          customersCount: assignedCustomers.length,
          totalPolicies,
          totalClaims
        });
      });
    });
  }
  //claims of loggedin agent
  getClaims(cb: (claims: any[]) => void) {
    this.getAgent(agent => {
      if (!agent) {
        cb([]);
        return;
      }
      //Policy requests assigned to this agent
      this.http
        .get<any[]>(
          `${this.api}/policyRequests?assignedAgentId=${agent.id}`
        )
        .subscribe(policyReqs => {

          if (policyReqs.length === 0) {
            cb([]);
            return;
          }
          const policyIds = policyReqs.map(r => r.policyId);
          //Get all claims
          this.http.get<any[]>(`${this.api}/claims`)
            .subscribe(allClaims => {
              //Filter only agent-related claims
              const agentClaims = allClaims
                .filter(c => policyIds.includes(c.policyId))
                .map(c => ({
                  ...c,
                  customerName: c.customerId,
                  policyType: c.type
                }));
              cb(agentClaims);
            });
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
      this.http
        .get<any[]>(`${this.api}/policyRequests?assignedAgentId=${String(agent.id)}`)
        .subscribe(cb);
    });
  }
  updatePolicyRequest(id: string, data: Partial<PolicyRequests>) {
    return this.http.patch(
      `${this.api}/policyRequests/${id}`,
      data
    );
  }

}
