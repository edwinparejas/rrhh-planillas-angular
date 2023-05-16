import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaPlazasComponent } from './bandeja-plazas.component';

describe('BandejaPlazasComponent', () => {
  let component: BandejaPlazasComponent;
  let fixture: ComponentFixture<BandejaPlazasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BandejaPlazasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BandejaPlazasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
