import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentView } from './recent-view';

describe('RecentView', () => {
  let component: RecentView;
  let fixture: ComponentFixture<RecentView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
