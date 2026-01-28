import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Specializations } from '../../../services/specializations';
import { AgentService } from '../../../services/agents'; // NEW
import { Specialization, Agent } from '../../../models/model'; // Added Agent

@Component({
    selector: 'app-admin-specializations',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './admin-specializations.html',
})
export class AdminSpecializations implements OnInit {
    specializations = signal<Specialization[]>([]);
    agents = signal<Agent[]>([]);

    // UI Helper: temporary store of selected agent IDs during edit
    selectedAgentIds: string[] = [];

    isModalOpen = false;
    editingId: string | null = null;
    specForm: FormGroup;

    constructor(
        private specService: Specializations,
        private agentService: AgentService, // Injected
        private fb: FormBuilder
    ) {
        this.specForm = this.fb.group({
            name: ['', Validators.required],
            code: ['', Validators.required],
            description: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.loadSpecializations();
        this.loadAgents();
    }

    loadSpecializations() {
        this.specService.getSpecializations().subscribe(data => this.specializations.set(data));
    }

    loadAgents() {
        this.agentService.getAgents().subscribe(data => this.agents.set(data));
    }

    openModal(spec?: Specialization) {
        this.isModalOpen = true;
        this.loadAgents(); // Refresh in case of changes

        if (spec) {
            this.editingId = spec.id;
            this.specForm.patchValue(spec);

            // Pre-select Agents belonging to this spec
            // (Note: In a real app we might need to filter only unassigned or assigned to THIS spec)
            const assigned = this.agents().filter(a => a.specializationId === spec.id);
            this.selectedAgentIds = assigned.map(a => a.id);
        } else {
            this.editingId = null;
            this.specForm.reset();
            this.selectedAgentIds = [];
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.editingId = null;
        this.specForm.reset();
        this.selectedAgentIds = [];
    }

    toggleAgentSelection(agentId: string) {
        if (this.selectedAgentIds.includes(agentId)) {
            this.selectedAgentIds = this.selectedAgentIds.filter(id => id !== agentId);
        } else {
            this.selectedAgentIds.push(agentId);
        }
    }

    saveSpecialization() {
        if (this.specForm.invalid) return;

        const formVal = this.specForm.value;

        // Callback to update agents after Spec is saved
        const updateAgents = (specId: string) => {
            // 1. Agents who ARE selected should have specId set
            this.selectedAgentIds.forEach(agentId => {
                const agent = this.agents().find(a => a.id === agentId);
                if (agent && agent.specializationId !== specId) {
                    this.agentService.updateAgent(agentId, { specializationId: specId }).subscribe();
                }
            });

            // 2. Agents who WERE assigned to this spec but are NOW UNSELECTED should be cleared?
            // "If agent was in this spec, but is NOT in selectedAgentIds, set specId to null/empty"
            // We iterate ALL agents assigned to this spec currently (from 'agents' signal)
            const previouslyAssigned = this.agents().filter(a => a.specializationId === specId);
            previouslyAssigned.forEach(agent => {
                if (!this.selectedAgentIds.includes(agent.id)) {
                    // Unassign
                    this.agentService.updateAgent(agent.id, { specializationId: '' }).subscribe();
                }
            });

            // Reload everything
            setTimeout(() => {
                this.loadSpecializations();
                this.loadAgents();
                this.closeModal();
            }, 500); // Small delay to let updates propagate
        };

        if (this.editingId) {
            this.specService.updateSpecialization(this.editingId, formVal).subscribe((res) => {
                updateAgents(this.editingId!); // ! safe because inside if
            });
        } else {
            const newId = `SPEC-${Math.floor(Math.random() * 10000)}`;
            const newSpec: Specialization = {
                id: newId,
                createdAt: new Date().toISOString(),
                ...formVal
            };
            this.specService.createSpecialization(newSpec).subscribe((res) => {
                updateAgents(newId);
            });
        }
    }

    deleteSpecialization(id: string) {
        this.specService.deleteSpecialization(id).subscribe(() => {
            this.loadSpecializations();
        });
    }
    getSpecName(id: string | null | undefined): string {
        if (!id) return 'Unassigned';
        const spec = this.specializations().find(s => s.id === id);
        return spec ? spec.name : 'Unassigned';
    }
}
