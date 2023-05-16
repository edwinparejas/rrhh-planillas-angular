import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionSustentoNopublicacionComponent } from './informacion-sustento-nopublicacion.component';

describe('InformacionSustentoNopublicacionComponent', () => {
  let component: InformacionSustentoNopublicacionComponent;
  let fixture: ComponentFixture<InformacionSustentoNopublicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionSustentoNopublicacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionSustentoNopublicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
