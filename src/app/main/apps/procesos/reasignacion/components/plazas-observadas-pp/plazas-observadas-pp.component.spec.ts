import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlazasObservadasPPComponent } from './plazas-observadas-pp.component';

describe('PlazasObservadasPPComponent', () => {
  let component: PlazasObservadasPPComponent;
  let fixture: ComponentFixture<PlazasObservadasPPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlazasObservadasPPComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlazasObservadasPPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
