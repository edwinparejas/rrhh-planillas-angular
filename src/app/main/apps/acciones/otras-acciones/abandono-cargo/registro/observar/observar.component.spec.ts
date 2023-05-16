import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservarComponent } from './observar.component';

describe('ObservarComponent', () => {
  let component: ObservarComponent;
  let fixture: ComponentFixture<ObservarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
