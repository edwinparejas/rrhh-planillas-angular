import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionContratoAdenda } from './gestionar-contrato-adenda.component';

describe('GestionarContratoAdendaComponent', () => {
  let component: GestionContratoAdenda;
  let fixture: ComponentFixture<GestionContratoAdenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionContratoAdenda ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionContratoAdenda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
