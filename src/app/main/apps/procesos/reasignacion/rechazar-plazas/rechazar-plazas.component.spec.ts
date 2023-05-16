import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechazarPlazasComponent } from './rechazar-plazas.component';

describe('RechazarPlazasComponent', () => {
  let component: RechazarPlazasComponent;
  let fixture: ComponentFixture<RechazarPlazasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RechazarPlazasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RechazarPlazasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
