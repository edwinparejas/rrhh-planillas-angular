import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanillaAfpComponent } from './planilla-afp.component';

describe('PlanillaAfpComponent', () => {
  let component: PlanillaAfpComponent;
  let fixture: ComponentFixture<PlanillaAfpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanillaAfpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanillaAfpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
