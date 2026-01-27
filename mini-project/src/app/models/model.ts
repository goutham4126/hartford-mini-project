export type UserRole = 'admin' | 'customer' | 'agent';

export interface User {
  id: string;
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
  premium: number; // Base premium
  sumInsured: number; // Max coverage amount
  duration: number; // in days
  description: string;
  features: string[];
  createdAt: string;
  status: PolicyStatus;
  agentId: string[]; 

  minEntryAge?: number;
  maxEntryAge?: number;
  coPay?: number;
  waitingPeriod?: number;
  exclusions?: string[];
  claimRatio?: number;
  networkHospitals?: string[];
  brochureUrl?: string;
  keyBenefits?: string[];
  termsAndConditionsUrl?: string;
  renewalProcess?: string;
}

export type PolicyRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface PolicyRequests {
  id: string;
  userId: string;
  policyId: string;

  nominee: {
    name: string;
    relation: string;
    age?: number;
  };

  status: PolicyRequestStatus;
  assignedAgentId?: string;

  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;

  remarks?: string;
}


export interface Customer {
  id: string;
  userId: string;
  policyIds: string[];
  nominee: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  address: string;
  detailedAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  dateOfBirth: string;
  aadhaarNumber: string;
  panNumber: string;

  medicalHistory?: string[];
  occupation?: string;
  annualIncome?: number;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  dependents?: {
    name: string;
    relation: string;
    age: number;
  }[];
}

export interface Agent {
  id: string;
  userId: number | string;
  licenseNumber: string;
  commissionRate: number;
  assignedCustomers: string[];
  totalPoliciesSold: number;
  territory?: string;
  specialization?: string;
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
