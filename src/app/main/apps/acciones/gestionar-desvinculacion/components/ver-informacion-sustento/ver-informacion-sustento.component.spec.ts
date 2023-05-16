import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerInformacionSustentoComponent } from './ver-informacion-sustento.component';

describe('VerInformacionSustentoComponent', () => {
  let component: VerInformacionSustentoComponent;
  let fixture: ComponentFixture<VerInformacionSustentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerInformacionSustentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerInformacionSustentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});