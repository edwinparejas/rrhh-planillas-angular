import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarSancionAdministrativaComponent } from './buscar-sancion-administrativa.component';

describe('BuscarSancionAdministrativaComponent', () => {
  let component: BuscarSancionAdministrativaComponent;
  let fixture: ComponentFixture<BuscarSancionAdministrativaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarSancionAdministrativaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarSancionAdministrativaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
