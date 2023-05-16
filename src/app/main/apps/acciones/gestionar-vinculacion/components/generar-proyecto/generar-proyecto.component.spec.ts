import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarProyectoComponent } from './generar-proyecto.component';

describe('GenerarProyectoComponent', () => {
  let component: GenerarProyectoComponent;
  let fixture: ComponentFixture<GenerarProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerarProyectoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerarProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
