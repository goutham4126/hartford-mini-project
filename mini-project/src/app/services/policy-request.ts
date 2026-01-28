import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PolicyRequests } from '../models/model';
@Injectable({
  providedIn: 'root',
})
export class PolicyRequestService {
  private apiUrl = 'http://localhost:3000/policyRequests';
  constructor(private http: HttpClient) {}
  addPolicyRequest(request: PolicyRequests) {
    return this.http.post<PolicyRequests>(this.apiUrl, request);
  }
}
