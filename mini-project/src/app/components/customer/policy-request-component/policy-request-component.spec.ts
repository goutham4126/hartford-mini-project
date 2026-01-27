import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyRequestComponent } from './policy-request-component';

describe('PolicyRequestComponent', () => {
  let component: PolicyRequestComponent;
  let fixture: ComponentFixture<PolicyRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyRequestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
