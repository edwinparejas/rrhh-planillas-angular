import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SolicitarAutorizacionComponent } from './solicitar-autorizacion.component';


describe('SolicitarAutorizacionComponent', () => {
  let component: SolicitarAutorizacionComponent;
  let fixture: ComponentFixture<SolicitarAutorizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolicitarAutorizacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitarAutorizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});