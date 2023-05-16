import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtencionInfoComponent } from './atencion-info.component';

describe('AtencionInfoComponent', () => {
  let component: AtencionInfoComponent;
  let fixture: ComponentFixture<AtencionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtencionInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtencionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
