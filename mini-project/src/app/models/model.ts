export type UserRole = 'admin' | 'customer' | 'agent';

export interface User {
  id: string; // Changed to string to match usage in db.json for new users
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

  // New Detailed Fields
  minEntryAge: number;
  maxEntryAge: number;
  coPay: number; // Percentage
  waitingPeriod: number; // in days
  exclusions: string[];
  claimRatio: number; // Percentage
  networkHospitals: string[]; // List of top network hospitals
  brochureUrl?: string; // Optional URL
  keyBenefits: string[];
  termsAndConditionsUrl?: string;
  renewalProcess: string;
  agentId?: string; // ID of the agent managing this policy product
}

export interface Customer {
  id: string;
  userId: string; // Changed to string to allow matching with User.id
  policyIds: string[];
  nominee: string;

  // Enhanced Profile
  kycStatus: 'verified' | 'pending' | 'rejected';
  address: string; // Keep simple address for backward compat
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

  // Health/Life specific
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
  specialization?: PolicyType[];
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
