import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivorechazoComponent } from './motivorechazo.component';

describe('MotivorechazoComponent', () => {
  let component: MotivorechazoComponent;
  let fixture: ComponentFixture<MotivorechazoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotivorechazoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotivorechazoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
