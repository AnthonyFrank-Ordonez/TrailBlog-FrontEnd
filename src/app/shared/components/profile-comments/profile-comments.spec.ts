import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComments } from './profile-comments';

describe('ProfileComments', () => {
  let component: ProfileComments;
  let fixture: ComponentFixture<ProfileComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
