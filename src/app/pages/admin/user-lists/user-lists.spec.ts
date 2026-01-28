import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLists } from './user-lists';

describe('UserLists', () => {
  let component: UserLists;
  let fixture: ComponentFixture<UserLists>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLists]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLists);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
