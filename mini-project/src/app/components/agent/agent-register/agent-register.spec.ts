import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentRegister } from './agent-register';

describe('AgentRegister', () => {
  let component: AgentRegister;
  let fixture: ComponentFixture<AgentRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentRegister);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
