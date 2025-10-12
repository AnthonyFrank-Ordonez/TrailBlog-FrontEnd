import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityForm } from './community-form';

describe('CommunityForm', () => {
  let component: CommunityForm;
  let fixture: ComponentFixture<CommunityForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
