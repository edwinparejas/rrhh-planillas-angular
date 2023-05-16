import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlazasConvocarComponent } from './plazas-convocar.component';

describe('PlazasConvocarComponent', () => {
  let component: PlazasConvocarComponent;
  let fixture: ComponentFixture<PlazasConvocarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlazasConvocarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlazasConvocarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
