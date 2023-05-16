import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrePublicacionComponent } from './pre-publicacion.component';

describe('PrePublicacionComponent', () => {
  let component: PrePublicacionComponent;
  let fixture: ComponentFixture<PrePublicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrePublicacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrePublicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
