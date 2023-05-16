import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvocarPlazasComponent } from './convocar-plazas.component';

describe('ConvocarPlazasComponent', () => {
  let component: ConvocarPlazasComponent;
  let fixture: ComponentFixture<ConvocarPlazasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvocarPlazasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvocarPlazasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
