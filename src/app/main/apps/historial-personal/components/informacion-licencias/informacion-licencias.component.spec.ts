import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionLicenciasComponent } from './informacion-licencias.component';


describe('InformacionLicenciasComponent', () => {
  let component: InformacionLicenciasComponent;
  let fixture: ComponentFixture<InformacionLicenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionLicenciasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionLicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});