import { TestBed } from '@angular/core/testing';

import { Claims } from './claims';

describe('Claims', () => {
  let service: Claims;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Claims);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
