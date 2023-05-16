import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInfoComponent } from './registro-info.component';

describe('RegistroInfoComponent', () => {
  let component: RegistroInfoComponent;
  let fixture: ComponentFixture<RegistroInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
