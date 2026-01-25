import { Routes } from '@angular/router';
import { Home } from './components/home/home';

import { AdminRegister } from './components/admin/admin-register/admin-register';
import { AdminLogin } from './components/admin/admin-login/admin-login';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { AdminPolicies } from './components/admin/admin-policies/admin-policies';
import { AdminUsers } from './components/admin/admin-users/admin-users';
import { AdminClaims } from './components/admin/admin-claims/admin-claims';
import { AdminProfile } from './components/admin/admin-profile/admin-profile';


import { AgentLogin } from './components/agent/agent-login/agent-login';
import { AgentRegister } from './components/agent/agent-register/agent-register';
import { AgentDashboard } from './components/agent/agent-dashboard/agent-dashboard';
import { AgentClaims } from './components/agent/agent-claims/agent-claims';
import { AgentProfile } from './components/agent/agent-profile/agent-profile';

import { CustomerLogin } from './components/customer/customer-login/customer-login';
import { CustomerRegister } from './components/customer/customer-register/customer-register';
import { CustomerDashboard } from './components/customer/customer-dashboard/customer-dashboard';
import { CustomerPolicies } from './components/customer/customer-policies/customer-policies';
import { CustomerClaims } from './components/customer/customer-claims/customer-claims';
import { CustomerProfile } from './components/customer/customer-profile/customer-profile';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { Unauthorized } from './components/unauthorized/unauthorized';

export const routes: Routes = [
  { path: '', component: Home},

  { path: 'unauthorized', component: Unauthorized },

  { path: 'auth/admin/login', component: AdminLogin },
  { path: 'auth/admin/register', component: AdminRegister },

  { path: 'auth/agent/login', component: AgentLogin },
  { path: 'auth/agent/register', component: AgentRegister },

  { path: 'auth/customer/login', component: CustomerLogin },
  { path: 'auth/customer/register', component: CustomerRegister },


  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('admin')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: AdminDashboard },
      { path: 'policies', component: AdminPolicies },
      { path: 'users', component: AdminUsers },
      { path: 'claims', component: AdminClaims },
      { path: 'profile', component: AdminProfile },

      { path: '**', redirectTo: 'dashboard' }
    ]

  },


  {
    path: 'agent',
    canActivate: [authGuard, roleGuard('agent')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: AgentDashboard },
      { path: 'claims', component: AgentClaims },
      { path: 'profile', component: AgentProfile },

      { path: '**', redirectTo: 'dashboard' }
    ]
  },

  {
    path: 'customer',
    canActivate: [authGuard, roleGuard('customer')],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: CustomerDashboard },
      { path: 'policies', component: CustomerPolicies },
      { path: 'claims', component: CustomerClaims },
      { path: 'profile', component: CustomerProfile },
      
      // wildcard: redirect unknown routes to dashboard
      { path: '**', redirectTo: 'dashboard' }
    ]
  },

  // ** is used beacuse, if that patterns doesn't match then redirect other routes to /dashboard.
  // Global wildcard: redirect unknown routes to Home
  { path: '**', redirectTo: '' },

];
