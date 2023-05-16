import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionBeneficiosComponent } from './informacion-beneficios.component';


describe('InformacionBeneficiosComponent', () => {
  let component: InformacionBeneficiosComponent;
  let fixture: ComponentFixture<InformacionBeneficiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionBeneficiosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionBeneficiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});