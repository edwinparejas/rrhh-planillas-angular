import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionCalificacionEvalComponent } from './informacion-calificacion-eval.component';

describe('InformacionCalificacionEvalComponent', () => {
  let component: InformacionCalificacionEvalComponent;
  let fixture: ComponentFixture<InformacionCalificacionEvalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionCalificacionEvalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionCalificacionEvalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
