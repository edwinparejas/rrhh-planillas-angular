import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialPersonalComponent } from './historial-personal.component';


describe('HistorialPersonalComponent', () => {
  let component: HistorialPersonalComponent;
  let fixture: ComponentFixture<HistorialPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorialPersonalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
