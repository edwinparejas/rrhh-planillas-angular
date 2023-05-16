import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalSolicitarInformacionComponent } from './modal-solicitar-informacion.component';


describe('ModalSolicitarInformacionComponent', () => {
  let component: ModalSolicitarInformacionComponent;
  let fixture: ComponentFixture<ModalSolicitarInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSolicitarInformacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSolicitarInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});