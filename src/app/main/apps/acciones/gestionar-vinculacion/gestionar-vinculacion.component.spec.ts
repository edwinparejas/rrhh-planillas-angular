import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarVinculacionComponent } from './gestionar-vinculacion.component';

describe('GestionarVinculacionComponent', () => {
  let component: GestionarVinculacionComponent;
  let fixture: ComponentFixture<GestionarVinculacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionarVinculacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarVinculacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
