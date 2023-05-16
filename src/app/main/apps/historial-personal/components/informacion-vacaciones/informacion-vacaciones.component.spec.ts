import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionVacacionesComponent } from './informacion-vacaciones.component';


describe('InformacionVacacionesComponent', () => {
  let component: InformacionVacacionesComponent;
  let fixture: ComponentFixture<InformacionVacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionVacacionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});