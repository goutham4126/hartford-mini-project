import { TestBed } from '@angular/core/testing';

import { Agents } from './agents';

describe('Agents', () => {
  let service: Agents;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Agents);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
