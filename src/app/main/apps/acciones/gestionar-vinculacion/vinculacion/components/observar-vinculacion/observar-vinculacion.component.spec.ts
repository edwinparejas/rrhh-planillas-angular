import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservarVinculacionComponent } from './observar-vinculacion.component';

describe('ObservarVinculacionComponent', () => {
  let component: ObservarVinculacionComponent;
  let fixture: ComponentFixture<ObservarVinculacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObservarVinculacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservarVinculacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
