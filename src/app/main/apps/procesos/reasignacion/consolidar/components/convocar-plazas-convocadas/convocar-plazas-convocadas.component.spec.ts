import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocarPlazasConvocadasComponent } from './convocar-plazas-convocadas.component';

describe('ConvocarPlazasConvocadasComponent', () => {
  let component: ConvocarPlazasConvocadasComponent;
  let fixture: ComponentFixture<ConvocarPlazasConvocadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvocarPlazasConvocadasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocarPlazasConvocadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
