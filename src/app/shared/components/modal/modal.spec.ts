import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { Modal } from './modal';
import { CommunityService } from '@core/services/community.service';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  const mockCommunityService = {
    isSubmitting: signal(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CommunityService, useValue: mockCommunityService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
