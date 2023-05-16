import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionSancionesComponent } from './informacion-sanciones.component';


describe('InformacionSancionesComponent', () => {
  let component: InformacionSancionesComponent;
  let fixture: ComponentFixture<InformacionSancionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionSancionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionSancionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});