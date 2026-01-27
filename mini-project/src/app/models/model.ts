export type UserRole = 'admin' | 'customer' | 'agent';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  createdAt: string;
}



export type PolicyType = 'health' | 'vehicle' | 'life' | 'travel' | 'home';
export type PolicyStatus = 'active' | 'inactive';

export interface Policy {
  id: string;  
  name: string;
  type: PolicyType;
  premium: number;
  coverage: number;
  duration: number;
  description: string;
  features: string[];
  createdAt: string;
  status: PolicyStatus;
}

export interface PolicyRequests{
  
}

// User can be anyone (admin,agent or customer).
// A user can become a customer only if he take a policy.
// User can become agent only if admin verifies and makes him agent.

export interface Customer {
  id: string;
  userId: number;
  policyIds: string[];
  nominee: string;
  address: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  panNumber: string;
}

export interface Agent {
  id: string;
  userId: number;
  licenseNumber: string;
  commissionRate: number;
  assignedCustomers: string[];
  totalPoliciesSold: number;
}


export type ClaimType = 'health' | 'vehicle' | 'life' | 'travel' | 'home';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Claim {
  id: string;
  policyId: string;
  customerId: string;
  type: ClaimType;
  amount: number;
  date: string;
  status: ClaimStatus;
  description: string;
  documents: string[];
}
