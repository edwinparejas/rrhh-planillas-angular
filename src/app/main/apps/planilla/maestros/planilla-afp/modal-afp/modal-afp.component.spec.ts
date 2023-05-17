import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAfpComponent } from './modal-afp.component';

describe('ModalAfpComponent', () => {
  let component: ModalAfpComponent;
  let fixture: ComponentFixture<ModalAfpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAfpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAfpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
