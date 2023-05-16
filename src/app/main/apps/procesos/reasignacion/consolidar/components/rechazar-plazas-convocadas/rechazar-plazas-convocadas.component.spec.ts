import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechazarPlazasConvocadasComponent } from './rechazar-plazas-convocadas.component';

describe('RechazarPlazasConvocadasComponent', () => {
  let component: RechazarPlazasConvocadasComponent;
  let fixture: ComponentFixture<RechazarPlazasConvocadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechazarPlazasConvocadasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RechazarPlazasConvocadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
