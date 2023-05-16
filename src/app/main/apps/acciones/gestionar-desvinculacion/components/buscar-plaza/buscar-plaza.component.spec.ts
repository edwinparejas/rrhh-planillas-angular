import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarPlazaComponent } from './buscar-plaza.component';

describe('BuscarPlazaComponent', () => {
  let component: BuscarPlazaComponent;
  let fixture: ComponentFixture<BuscarPlazaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarPlazaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuscarPlazaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
