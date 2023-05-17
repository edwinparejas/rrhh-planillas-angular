import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalHaberesDescuentosComponent } from './modal-haberes-descuentos.component';

describe('ModalHaberesDescuentosComponent', () => {
  let component: ModalHaberesDescuentosComponent;
  let fixture: ComponentFixture<ModalHaberesDescuentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalHaberesDescuentosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalHaberesDescuentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
