import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionDesplazamientoComponent } from './informacion-desplazamiento.component';



describe('InformacionDesplazamientoComponent', () => {
  let component: InformacionDesplazamientoComponent;
  let fixture: ComponentFixture<InformacionDesplazamientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionDesplazamientoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionDesplazamientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});