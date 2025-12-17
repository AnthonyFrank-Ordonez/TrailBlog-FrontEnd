import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { Home } from './home';
import { PostService } from '@core/services/post.service';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  const mockPostService = {
    posts: signal([]),
    activeDropdown: signal({ type: null, id: null }),
    toggleDropdown: vi.fn(),
    closeDropdown: vi.fn(),
    isDropDownOpen: vi.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PostService, useValue: mockPostService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
