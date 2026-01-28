import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDashboardOriginal } from './customer-dashboard-original';

describe('CustomerDashboardOriginal', () => {
  let component: CustomerDashboardOriginal;
  let fixture: ComponentFixture<CustomerDashboardOriginal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDashboardOriginal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerDashboardOriginal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
