import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentPolicyrequests } from './agent-policyrequests';

describe('AgentPolicyrequests', () => {
  let component: AgentPolicyrequests;
  let fixture: ComponentFixture<AgentPolicyrequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentPolicyrequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentPolicyrequests);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
