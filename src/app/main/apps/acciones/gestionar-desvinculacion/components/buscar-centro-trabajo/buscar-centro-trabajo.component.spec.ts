import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarCentroTrabajoComponent } from './buscar-centro-trabajo.component';

describe('BuscarCentroTrabajoComponent', () => {
  let component: BuscarCentroTrabajoComponent;
  let fixture: ComponentFixture<BuscarCentroTrabajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarCentroTrabajoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarCentroTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
