import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from './auth';
@Injectable({
  providedIn: 'root'
})
export class AgentService {
  api = 'http://localhost:3000';
  constructor(
    private http: HttpClient,
    private auth: Auth
  ) { }

  getAgents() {
    return this.http.get<any[]>(`${this.api}/agents`);
  }

  // get logged-in agent
  getAgent(callback: (agent: any) => void) {
    const userId = String(this.auth.user()?.id);
    this.http.get<any[]>(`${this.api}/agents`)
      .subscribe(agents => {
        callback(agents.find(a => String(a.userId) === userId));
      });
  }
  // get claims
  getClaims(callback: (claims: any[]) => void) {
    this.getAgent(agent => {
      const assignedCustomerIds = agent.assignedCustomers.map(String);
      this.http.get<any[]>(`${this.api}/claims`)
        .subscribe(claims => {
          callback(
            claims.filter(c =>
              assignedCustomerIds.includes(String(c.customerId))
            )
          );
        });
    });
  }
  getDashboardData(callback: (data: any) => void) {
    this.getAgent(agent => {
      const assignedCustomerIds = agent.assignedCustomers.map(String);
      this.http.get<any[]>(`${this.api}/customers`)
        .subscribe(customers => {
          const agentCustomers = customers.filter(c =>
            assignedCustomerIds.includes(String(c.id))
          );
          this.http.get<any[]>(`${this.api}/users`)
            .subscribe(users => {
              const userMap: any = {};
              users.forEach(u => userMap[String(u.id)] = u);
              // BUILD DATA FOR GRID
              const customerDetails = agentCustomers.map(c => {
                const user = userMap[String(c.userId)];
                return {
                  name: `${user.firstName} ${user.lastName}`,
                  email: user.email,
                  phone: user.phone,
                  policiesCount: c.policyIds.length
                };
              });
              let totalPolicies = 0;
              agentCustomers.forEach(c => totalPolicies += c.policyIds.length);
              this.http.get<any[]>(`${this.api}/claims`)
                .subscribe(claims => {
                  const totalClaims = claims.filter(claim =>
                    assignedCustomerIds.includes(String(claim.customerId))
                  ).length;
                  callback({
                    customersCount: agentCustomers.length,
                    totalPolicies,
                    totalClaims,
                    customers: customerDetails
                  });
                });
            });
        });
    });
  }
}