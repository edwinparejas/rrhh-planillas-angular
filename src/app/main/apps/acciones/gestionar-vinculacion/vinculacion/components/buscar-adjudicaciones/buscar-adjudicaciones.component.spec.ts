import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarAdjudicacionesComponent } from './buscar-adjudicaciones.component';

describe('BuscarAdjudicacionesComponent', () => {
  let component: BuscarAdjudicacionesComponent;
  let fixture: ComponentFixture<BuscarAdjudicacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarAdjudicacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarAdjudicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
