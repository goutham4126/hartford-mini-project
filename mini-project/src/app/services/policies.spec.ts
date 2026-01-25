import { TestBed } from '@angular/core/testing';

import { Policies } from './policies';

describe('Policies', () => {
  let service: Policies;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Policies);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
