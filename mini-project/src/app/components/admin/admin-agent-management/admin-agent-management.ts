import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Agent, User, Policy, Customer } from '../../../models/model';
import { AgentService } from '../../../services/agents';
import { Users } from '../../../services/users';
import { Policies } from '../../../services/policies';
import { Customers } from '../../../services/customers';

@Component({
    selector: 'app-admin-agent-management',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-agent-management.html',
    styleUrl: './admin-agent-management.css'
})
export class AdminAgentManagement implements OnInit {
    agents: any[] = [];
    selectedAgent: any = null;

    // Raw data
    rawAgents: Agent[] = [];
    users: User[] = [];
    policies: Policy[] = [];
    customers: Customer[] = [];

    constructor(
        private agentService: AgentService,
        private userService: Users,
        private policyService: Policies,
        private customerService: Customers
    ) { }

    ngOnInit() {
        this.fetchData();
    }

    fetchData() {
        forkJoin({
            agents: this.agentService.getAgents(),
            users: this.userService.getUsers(),
            policies: this.policyService.getPolicies(),
            customers: this.customerService.getCustomers()
        }).subscribe({
            next: (data) => {
                this.rawAgents = data.agents;
                // fix types
                this.users = data.users.map((u: any) => ({ ...u, id: String(u.id) }));
                this.policies = data.policies;
                this.customers = data.customers.map((c: any) => ({ ...c, userId: String(c.userId) }));

                this.processAgents();
            },
            error: (err) => console.error('Error loading agent data', err)
        });
    }

    processAgents() {
        this.agents = this.rawAgents.map(agent => {
            const user = this.users.find(u => u.id === String(agent.userId));

            // Get Assigned Customers
            const myCustomers = this.customers.filter(c => agent.assignedCustomers.includes(c.id));

            // Get Managed Policies (via customers)
            // Collect all policy IDs from all assigned customers
            const policyIds = myCustomers.reduce((acc, cust) => [...acc, ...cust.policyIds], [] as string[]);
            const myPolicies = this.policies.filter(p => policyIds.includes(p.id));

            // Calculate Policy Types distribution
            const typeCounts: { [key: string]: number } = {};
            myPolicies.forEach(p => {
                typeCounts[p.type] = (typeCounts[p.type] || 0) + 1;
            });
            // Find top type
            const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

            return {
                ...agent,
                name: user ? `${user.firstName} ${user.lastName}` : 'Unknown Agent',
                username: user?.username,
                email: user?.email,
                customerCount: myCustomers.length,
                policyCount: myPolicies.length,
                topSpecialty: topType,
                details: {
                    customers: myCustomers.map(c => {
                        const cUser = this.users.find(u => u.id === String(c.userId));
                        return { ...c, name: cUser ? `${cUser.firstName} ${cUser.lastName}` : c.id };
                    }),
                    policies: myPolicies,
                    typeDistribution: typeCounts
                }
            };
        });
    }

    viewDetails(agent: any) {
        this.selectedAgent = agent;
        // Scroll to details or open modal? Let's use a side panel or expanded view in HTML
    }

    closeDetails() {
        this.selectedAgent = null;
    }
}
