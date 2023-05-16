import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocarPlazasObservadasComponent } from './convocar-plazas-observadas.component';

describe('ConvocarPlazasObservadasComponent', () => {
  let component: ConvocarPlazasObservadasComponent;
  let fixture: ComponentFixture<ConvocarPlazasObservadasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvocarPlazasObservadasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocarPlazasObservadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
