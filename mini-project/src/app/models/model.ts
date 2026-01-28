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
  isActive?: boolean;
}

export interface Specialization {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
}

export type PolicyType = 'health' | 'vehicle' | 'life' | 'travel' | 'home';
export type PolicyStatus = 'active' | 'inactive';

export interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  specializationId: string;
  premium: number;
  sumInsured: number;
  duration: number; // in days
  description: string;
  features: string[];
  createdAt: string;
  status: PolicyStatus;
  agentIds: string[]; // Updated from agentId array

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
  assignedAgentId?: string;

  nominee: {
    name: string;
    relation: string;
    age?: number;
  };

  status: PolicyRequestStatus;
  documents?: string[];

  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;

  remarks?: string;
}

export interface Customer {
  id: string;
  userId: string;
  policyIds: string[];
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
  createdAt?: string;
}

export interface Agent {
  id: string;
  userId: number | string;
  specializationId: string;
  licenseNumber: string;
  commissionRate: number;
  assignedCustomers: string[];
  totalPoliciesSold: number;
  territory?: string;
  specialization?: string; // Optional name field from joins
  createdAt?: string;
}

export type ClaimType = 'health' | 'vehicle' | 'life' | 'travel' | 'home';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';
export type SettlementStatus = 'processing' | 'settled' | 'rejected';

export interface Claim {
  id: string;
  policyId: string;
  customerId: string;
  agentId: string;
  type: ClaimType;

  amountRequested: number;
  amountApproved?: number;

  status: ClaimStatus;
  settlementStatus?: SettlementStatus;

  description: string;
  documents: string[];

  submittedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  remarks?: string;
}

export interface Payment {
  id: string;
  requestId: string;
  customerId: string;
  policyId: string;

  totalPremium: number;
  amountPaid: number;
  pendingBalance: number;

  status: 'completed' | 'partial' | 'pending' | 'failed';
  paymentDate: string;
  method: string;

  billingCycleStartDate?: string;
  nextDueDate?: string;
  transactionId?: string;
}
