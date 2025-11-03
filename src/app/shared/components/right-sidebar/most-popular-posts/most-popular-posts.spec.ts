import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MostPopularPosts } from './most-popular-posts';

describe('MostPopularPosts', () => {
  let component: MostPopularPosts;
  let fixture: ComponentFixture<MostPopularPosts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostPopularPosts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MostPopularPosts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
