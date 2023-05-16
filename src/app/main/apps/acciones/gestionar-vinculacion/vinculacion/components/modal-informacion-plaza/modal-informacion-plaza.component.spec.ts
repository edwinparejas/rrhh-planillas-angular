import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalInformacionPlaza } from './modal-informacion-plaza.component';


describe('ModalInformacionPlaza', () => {
  let component: ModalInformacionPlaza;
  let fixture: ComponentFixture<ModalInformacionPlaza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalInformacionPlaza ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInformacionPlaza);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});