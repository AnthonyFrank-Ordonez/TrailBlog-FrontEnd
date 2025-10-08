import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentViewedPost } from './recent-viewed-post';

describe('RecentViewedPost', () => {
  let component: RecentViewedPost;
  let fixture: ComponentFixture<RecentViewedPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentViewedPost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentViewedPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
