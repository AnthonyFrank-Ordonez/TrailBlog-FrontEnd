import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileSaved } from './profile-saved';

describe('ProfileSaved', () => {
  let component: ProfileSaved;
  let fixture: ComponentFixture<ProfileSaved>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileSaved]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSaved);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
