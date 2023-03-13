import { TestBed } from '@angular/core/testing';

import { AskWikiApiService } from './askwikiapi.service';

describe('AskApiService', () => {
  let service: AskWikiApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AskWikiApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
