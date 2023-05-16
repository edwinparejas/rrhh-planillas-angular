import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionPostulanteCalificacionComponent } from './informacion-postulante-calificacion.component';

describe('InformacionPostulanteCalificacionComponent', () => {
  let component: InformacionPostulanteCalificacionComponent;
  let fixture: ComponentFixture<InformacionPostulanteCalificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionPostulanteCalificacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionPostulanteCalificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
