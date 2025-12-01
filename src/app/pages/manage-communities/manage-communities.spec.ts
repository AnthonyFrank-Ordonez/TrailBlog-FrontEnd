import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCommunities } from './manage-communities';

describe('ManageCommunities', () => {
  let component: ManageCommunities;
  let fixture: ComponentFixture<ManageCommunities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageCommunities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCommunities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
