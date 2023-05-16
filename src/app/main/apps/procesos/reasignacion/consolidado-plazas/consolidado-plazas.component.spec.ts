import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidadoPlazasComponent } from './consolidado-plazas.component';

describe('ConsolidadoPlazasComponent', () => {
  let component: ConsolidadoPlazasComponent;
  let fixture: ComponentFixture<ConsolidadoPlazasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsolidadoPlazasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsolidadoPlazasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
