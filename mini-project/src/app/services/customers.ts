import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Customer, Policy, Claim, User } from '../models/model';
@Injectable({
  providedIn: 'root',
})
export class Customers {
  private baseUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) { }

  getCustomerDetails(id: string) {
    return this.http.get<Customer[]>('http://localhost:3000/customers/?userId='+id)
  }

  updateCustomer(customerId: string, updatedCustomer: any) {
    return this.http.put(`${this.baseUrl}/customers/${customerId}`, updatedCustomer);
  }


  getCustomers() {
    return this.http.get<Customer[]>(`${this.baseUrl}/customers`);
  }

  getCustomerPolicies(id: string) {
    return this.getCustomerDetails(id).pipe(
      switchMap(customers => {
        if (!customers.length) {
          return [];
        }

        const policyIds = customers[0].policyIds;

        const policyRequests = policyIds.map((policyId: string) =>
          this.http.get<Policy[]>(
            `${this.baseUrl}/policies?id=${policyId}`
          )
        );

        return forkJoin(policyRequests).pipe(
          map(policies => policies.flat())
        );
      })
    );
  }

  getCustomerClaims(id: string) {
    return this.getCustomerDetails(id).pipe(
      switchMap((customers: Customer[]) => {
        if (customers.length === 0) {
          return ([]);
        }

        const customerId = customers[0].id;

        return this.http.get<Claim[]>(
          `${this.baseUrl}/claims?customerId=${customerId}`
        );
      })
    );
  }

  getUserName(id: number) {
    return this.http.get<User[]>(`http://localhost:3000/users?id=${id}`)
  }

  getPolicyName() {
    return this.http
      .get<Policy[]>('http://localhost:3000/policies')
      .pipe(
        map(policies => {
          const policyMap: Record<string, string> = {};
          policies.forEach(policy => {
            policyMap[policy.id] = policy.name;
          });
          return policyMap;
        })
      );
  }
  getAllClaims() {
  return this.http.get<Claim[]>(`${this.baseUrl}/claims`);
}

postClaim(claim:Claim){
  return this.http.post<Claim>(`${this.baseUrl}/claims`,claim);
}
}
