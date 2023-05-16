import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaConsolidarComponent } from './bandeja-consolidar.component';

describe('BandejaConsolidarComponent', () => {
  let component: BandejaConsolidarComponent;
  let fixture: ComponentFixture<BandejaConsolidarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BandejaConsolidarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BandejaConsolidarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
