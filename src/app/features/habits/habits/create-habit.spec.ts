import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHabit } from './create-habit';

describe('CreateHabit', () => {
  let component: CreateHabit;
  let fixture: ComponentFixture<CreateHabit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHabit],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateHabit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
