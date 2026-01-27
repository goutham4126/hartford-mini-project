import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Agent, PolicyType } from '../../../models/model';

@Component({
    selector: 'app-admin-create-policy',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './admin-create-policy.html',
    styleUrl: './admin-create-policy.css',
})
export class AdminCreatePolicy {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private router = inject(Router);

    agents: Agent[] = [];
    policyTypes: PolicyType[] = ['health', 'vehicle', 'life', 'travel', 'home'];

    policyForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        type: ['health', [Validators.required]],
        premium: [null, [Validators.required, Validators.min(0)]],
        sumInsured: [null, [Validators.required, Validators.min(0)]],
        duration: [365, [Validators.required, Validators.min(1)]],
        description: ['', [Validators.required]],
        minEntryAge: [18, [Validators.required, Validators.min(0)]],
        maxEntryAge: [70, [Validators.required, Validators.min(0)]],
        agentId: ['', [Validators.required]] // "Select which agent to take care this policy"
    });

    ngOnInit() {
        this.fetchAgents();
    }

    fetchAgents() {
        this.http.get<Agent[]>('http://localhost:3000/agents').subscribe({
            next: (data) => {
                this.agents = data;
            },
            error: (err) => console.error('Failed to fetch agents', err)
        });
    }

    onSubmit() {
        if (this.policyForm.invalid) {
            this.policyForm.markAllAsTouched();
            return;
        }

        const formValue = this.policyForm.value;

        // Generate a simple ID
        // Logic: POL-<TYPE_Initial>-<Random4Digits>
        const typeInitial = (formValue.type as string).charAt(0).toUpperCase();
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const newId = `POL-${typeInitial}-${randomId}`;

        const newPolicy = {
            id: newId,
            ...formValue,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            features: ['Standard Coverage'], // Default featureL
            exclusions: [],
            networkHospitals: [],
            keyBenefits: []
        };

        this.http.post('http://localhost:3000/policies', newPolicy).subscribe({
            next: () => {
                alert('Policy Created Successfully!');
                this.router.navigate(['/admin/policies']);
            },
            error: (err) => {
                console.error('Error creating policy', err);
                alert('Failed to create policy.');
            }
        });
    }
}
