import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCommunitiesBar } from './manage-communities-bar';

describe('ManageCommunitiesBar', () => {
  let component: ManageCommunitiesBar;
  let fixture: ComponentFixture<ManageCommunitiesBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCommunitiesBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCommunitiesBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
