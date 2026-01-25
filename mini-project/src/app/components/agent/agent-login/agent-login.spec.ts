import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentLogin } from './agent-login';

describe('AgentLogin', () => {
  let component: AgentLogin;
  let fixture: ComponentFixture<AgentLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
