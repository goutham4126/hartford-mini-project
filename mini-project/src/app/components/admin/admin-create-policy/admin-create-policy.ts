import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Agent, PolicyType, Specialization } from '../../../models/model';
import { AgentService } from '../../../services/agents';
import { Policies } from '../../../services/policies';
import { Specializations } from '../../../services/specializations';

@Component({
  selector: 'app-admin-create-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-create-policy.html',
  styleUrls: ['./admin-create-policy.css'],
})
export class AdminCreatePolicy implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private agentService = inject(AgentService);
  private policiesService = inject(Policies);
  private specService = inject(Specializations);

  isEditMode = false;
  editingPolicyId: string | null = null;

  allAgents: Agent[] = []; // Store all agents
  filteredAgents: Agent[] = []; // Agents for selected specialization
  specializations: Specialization[] = [];

  policyTypes: PolicyType[] = ['health', 'vehicle', 'life', 'travel', 'home'];

  policyForm = this.fb.group({
    // Basic Info
    name: ['', [Validators.required, Validators.minLength(3)]],
    type: ['health', [Validators.required]],
    specializationId: ['', [Validators.required]], // NEW Field
    premium: [null, [Validators.required, Validators.min(0)]],
    sumInsured: [null, [Validators.required, Validators.min(0)]],
    duration: [365, [Validators.required, Validators.min(1)]],
    description: ['', [Validators.required]],

    // Eligibility & Terms
    minEntryAge: [18, [Validators.required, Validators.min(0)]],
    maxEntryAge: [70, [Validators.required, Validators.min(0)]],
    coPay: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    waitingPeriod: [0, [Validators.required, Validators.min(0)]],

    // Dynamic Arrays
    features: this.fb.array([this.fb.control('', Validators.required)]),
    exclusions: this.fb.array([this.fb.control('', Validators.required)]),
    networkHospitals: this.fb.array([this.fb.control('', Validators.required)]),

    // Agent (Implicitly handled by Specialization)
    agentIds: [[] as string[]], // No longer required
  });

  get features() { return this.policyForm.get('features') as FormArray; }
  get exclusions() { return this.policyForm.get('exclusions') as FormArray; }
  get networkHospitals() { return this.policyForm.get('networkHospitals') as FormArray; }

  ngOnInit() {
    this.fetchInitialData();

    // Listen to Specialization Changes only for Type auto-set
    this.policyForm.get('specializationId')?.valueChanges.subscribe(specId => {
      // Auto-set Type based on Specialization Code
      const spec = this.specializations.find(s => s.id === specId);
      if (spec) {
        let derivedType: PolicyType = 'health';
        const code = spec.code.toUpperCase();
        if (code.includes('HEALTH')) derivedType = 'health';
        else if (code.includes('VEHICLE')) derivedType = 'vehicle';
        else if (code.includes('LIFE')) derivedType = 'life';
        else if (code.includes('TRAVEL')) derivedType = 'travel';

        this.policyForm.patchValue({ type: derivedType });
      }
    });

    // Check for Edit Mode
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.editingPolicyId = id;
        this.loadPolicy(id);
      }
    });
  }

  fetchInitialData() {
    this.specService.getSpecializations().subscribe(data => this.specializations = data);
    // No need to fetch all agents anymore for selection
  }

  // filterAgents removed

  loadPolicy(id: string) {
    this.policiesService.getPolicy(id).subscribe({
      next: (policy: any) => {
        // Clear Arrays first
        this.features.clear();
        this.exclusions.clear();
        this.networkHospitals.clear();

        // Populate Arrays
        policy.features?.forEach((f: string) => this.features.push(this.fb.control(f, Validators.required)));
        if (!policy.features?.length) this.addFeature();

        policy.exclusions?.forEach((e: string) => this.exclusions.push(this.fb.control(e, Validators.required)));
        if (!policy.exclusions?.length) this.addExclusion();

        policy.networkHospitals?.forEach((h: string) => this.networkHospitals.push(this.fb.control(h, Validators.required)));

        // Patch other fields
        this.policyForm.patchValue({
          name: policy.name,
          type: policy.type,
          specializationId: policy.specializationId,
          premium: policy.premium,
          sumInsured: policy.sumInsured,
          duration: policy.duration,
          description: policy.description,
          minEntryAge: policy.minEntryAge,
          maxEntryAge: policy.maxEntryAge,
          coPay: policy.coPay,
          waitingPeriod: policy.waitingPeriod,
          // agentIds ignored
        });
      },
      error: (err) => {
        console.error('Error loading policy', err);
        alert('Could not load policy for editing');
        this.router.navigate(['/admin/policies']);
      }
    });
  }

  // --- Dynamic Field Helpers ---
  addFeature() { this.features.push(this.fb.control('', Validators.required)); }
  removeFeature(index: number) { this.features.removeAt(index); }

  addExclusion() { this.exclusions.push(this.fb.control('', Validators.required)); }
  removeExclusion(index: number) { this.exclusions.removeAt(index); }

  addHospital() { this.networkHospitals.push(this.fb.control('', Validators.required)); }
  removeHospital(index: number) { this.networkHospitals.removeAt(index); }


  // --- Agent Selection Logic REMOVED ---
  // onAgentCheckboxChange, isAgentSelected removed

  onSubmit() {
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      return;
    }

    const formValue = this.policyForm.value;

    // Clean up arrays
    const cleanFeatures = (formValue.features as string[]).filter(f => f.trim() !== '');
    const cleanExclusions = (formValue.exclusions as string[]).filter(e => e.trim() !== '');
    const cleanHospitals = (formValue.networkHospitals as string[]).filter(h => h.trim() !== '');

    const policyData = {
      name: formValue.name,
      type: formValue.type,
      specializationId: formValue.specializationId,
      premium: formValue.premium,
      sumInsured: formValue.sumInsured,
      duration: formValue.duration,
      description: formValue.description,

      minEntryAge: formValue.minEntryAge,
      maxEntryAge: formValue.maxEntryAge,
      coPay: formValue.coPay,
      waitingPeriod: formValue.waitingPeriod,

      features: cleanFeatures,
      exclusions: cleanExclusions,
      networkHospitals: cleanHospitals,
      agentIds: [], // Empty array, dynamic link used instead

      status: 'active',
    };

    if (this.isEditMode && this.editingPolicyId) {
      // Update
      const updatedPolicy = {
        ...policyData,
        id: this.editingPolicyId,
      };

      this.policiesService.updatePolicy(updatedPolicy).subscribe({
        next: () => {
          alert('Policy Updated Successfully!');
          this.router.navigate(['/admin/policies']);
        },
        error: (err) => {
          console.error('Error updating policy', err);
          alert('Failed to update policy.');
        },
      });
    } else {
      // Create
      const typeInitial = (formValue.type as string).charAt(0).toUpperCase();
      const randomId = Math.floor(1000 + Math.random() * 9000); // Simple ID generation
      const newId = `POL-${typeInitial}-${randomId}`;

      const newPolicy = {
        ...policyData,
        id: newId,
        createdAt: new Date().toISOString(),
        keyBenefits: [],
      };

      this.policiesService.createPolicy(newPolicy).subscribe({
        next: () => {
          alert('Policy Created Successfully!');
          this.router.navigate(['/admin/policies']);
        },
        error: (err) => {
          console.error('Error creating policy', err);
          alert('Failed to create policy.');
        },
      });
    }
  }

  getSpecName(id: string | null | undefined): string {
    if (!id) return 'the selected category';
    const spec = this.specializations.find(s => s.id === id);
    return spec ? spec.name : 'the selected category';
  }
}
