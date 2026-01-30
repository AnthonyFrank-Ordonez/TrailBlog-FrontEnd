import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityDetail } from './community-detail';

describe('CommunityDetail', () => {
  let component: CommunityDetail;
  let fixture: ComponentFixture<CommunityDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
