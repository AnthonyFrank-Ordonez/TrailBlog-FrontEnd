import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityCard } from './community-card';

describe('CommunityCard', () => {
  let component: CommunityCard;
  let fixture: ComponentFixture<CommunityCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
