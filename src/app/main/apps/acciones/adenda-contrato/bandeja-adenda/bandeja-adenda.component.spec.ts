import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BandejaAdendaComponent } from './bandeja-adenda.component';

describe('BandejaAdendaComponent', () => {
  let component: BandejaAdendaComponent;
  let fixture: ComponentFixture<BandejaAdendaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BandejaAdendaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BandejaAdendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
