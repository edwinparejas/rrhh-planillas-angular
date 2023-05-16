import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarPostulanteComponent } from './agregar-postulante.component';

describe('AgregarPostulanteComponent', () => {
  let component: AgregarPostulanteComponent;
  let fixture: ComponentFixture<AgregarPostulanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarPostulanteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarPostulanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
