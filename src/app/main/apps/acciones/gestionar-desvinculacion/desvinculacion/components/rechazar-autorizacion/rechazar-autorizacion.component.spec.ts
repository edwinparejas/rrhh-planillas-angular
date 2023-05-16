import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RechazarAutoizacionComponent } from './rechazar-autorizacion.component';


describe('RechazarAutoizacionComponent', () => {
  let component: RechazarAutoizacionComponent;
  let fixture: ComponentFixture<RechazarAutoizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechazarAutoizacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RechazarAutoizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});