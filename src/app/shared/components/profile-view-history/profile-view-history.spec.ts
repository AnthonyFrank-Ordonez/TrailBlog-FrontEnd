import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileViewHistory } from './profile-view-history';

describe('ProfileViewHistory', () => {
  let component: ProfileViewHistory;
  let fixture: ComponentFixture<ProfileViewHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileViewHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileViewHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
