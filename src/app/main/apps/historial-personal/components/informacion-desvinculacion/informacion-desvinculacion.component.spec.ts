import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionDesvinculacionComponent } from './informacion-desvinculacion.component';


describe('InformacionDesvinculacionComponent', () => {
  let component: InformacionDesvinculacionComponent;
  let fixture: ComponentFixture<InformacionDesvinculacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionDesvinculacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionDesvinculacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});