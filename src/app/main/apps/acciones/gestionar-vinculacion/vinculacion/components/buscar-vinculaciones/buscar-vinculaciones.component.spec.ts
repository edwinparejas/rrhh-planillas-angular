import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarVinculacionesComponent } from './buscar-vinculaciones.component';

describe('BuscarVinculacionesComponent', () => {
  let component: BuscarVinculacionesComponent;
  let fixture: ComponentFixture<BuscarVinculacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarVinculacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarVinculacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
