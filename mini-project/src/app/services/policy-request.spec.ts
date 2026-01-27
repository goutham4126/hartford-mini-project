import { TestBed } from '@angular/core/testing';

import { PolicyRequest } from './policy-request';

describe('PolicyRequest', () => {
  let service: PolicyRequest;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PolicyRequest);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
