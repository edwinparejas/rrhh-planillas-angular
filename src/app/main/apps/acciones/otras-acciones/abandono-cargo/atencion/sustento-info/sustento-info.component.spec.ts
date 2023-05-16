import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SustentoInfoComponent } from './sustento-info.component';

describe('SustentoInfoComponent', () => {
  let component: SustentoInfoComponent;
  let fixture: ComponentFixture<SustentoInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SustentoInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SustentoInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
