import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivoCancelacionComponent } from './motivo-cancelacion.component';

describe('MotivoCancelacionComponent', () => {
  let component: MotivoCancelacionComponent;
  let fixture: ComponentFixture<MotivoCancelacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotivoCancelacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MotivoCancelacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
