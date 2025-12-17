import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { CreatePost } from './create-post';
import { CommunityService } from '@core/services/community.service';
import { PostService } from '@core/services/post.service';
import { MessageService } from '@core/services/message.service';

describe('CreatePost', () => {
  let component: CreatePost;
  let fixture: ComponentFixture<CreatePost>;

  const mockCommunityService = {
    userCommunities: signal([]),
  };

  const mockPostService = {
    isSubmitting: signal(false),
    isDropDownOpen: vi.fn().mockReturnValue(false),
    toggleDropdown: vi.fn(),
  };

  const mockMessageService = {
    showMessage: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePost],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: CommunityService, useValue: mockCommunityService },
        { provide: PostService, useValue: mockPostService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
