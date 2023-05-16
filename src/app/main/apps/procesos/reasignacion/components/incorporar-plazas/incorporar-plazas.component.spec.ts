import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncorporarPlazasComponent } from './incorporar-plazas.component';

describe('IncorporarPlazasComponent', () => {
  let component: IncorporarPlazasComponent;
  let fixture: ComponentFixture<IncorporarPlazasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncorporarPlazasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncorporarPlazasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
