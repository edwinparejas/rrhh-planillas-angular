import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanillaHaberesComponent } from './planilla-haberes.component';

describe('PlanillaHaberesComponent', () => {
  let component: PlanillaHaberesComponent;
  let fixture: ComponentFixture<PlanillaHaberesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanillaHaberesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanillaHaberesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
