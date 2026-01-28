import { TestBed } from '@angular/core/testing';

import { PolicyRequestService } from './policy-request';

describe('PolicyRequest', () => {
  let service: PolicyRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
