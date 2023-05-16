import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarDesvinculacionComponent } from './gestionar-desvinculacion.component';


describe('GestionarDesvinculacionComponent', () => {
  let component: GestionarDesvinculacionComponent;
  let fixture: ComponentFixture<GestionarDesvinculacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionarDesvinculacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarDesvinculacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
