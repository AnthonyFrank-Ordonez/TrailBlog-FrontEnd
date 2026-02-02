import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsAndUpdates } from './news-and-updates';

describe('NewsAndUpdates', () => {
  let component: NewsAndUpdates;
  let fixture: ComponentFixture<NewsAndUpdates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAndUpdates]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsAndUpdates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
