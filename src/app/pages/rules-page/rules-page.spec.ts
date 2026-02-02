import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesPage } from './rules-page';

describe('RulesPage', () => {
  let component: RulesPage;
  let fixture: ComponentFixture<RulesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
