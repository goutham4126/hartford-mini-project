import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Policy } from '../models/model';

@Injectable({
  providedIn: 'root',
})
export class Policies {
  constructor(private http: HttpClient) { }

  getPolicies() {
    return this.http.get<Policy[]>('http://localhost:3000/policies')
  }

  createPolicy(policy: any) {
    return this.http.post('http://localhost:3000/policies', policy);
  }

  getPolicy(id: string) {
    return this.http.get<Policy>(`http://localhost:3000/policies/${id}`);
  }

  updatePolicy(policy: any) {
    return this.http.put(`http://localhost:3000/policies/${policy.id}`, policy);
  }

  deletePolicy(id: string) {
    return this.http.delete(`http://localhost:3000/policies/${id}`);
  }
}
