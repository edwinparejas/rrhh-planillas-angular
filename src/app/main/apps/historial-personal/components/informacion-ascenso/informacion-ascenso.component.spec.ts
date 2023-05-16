import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionAscensoComponent } from './informacion-ascenso.component';


describe('InformacionAscensoComponent', () => {
  let component: InformacionAscensoComponent;
  let fixture: ComponentFixture<InformacionAscensoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionAscensoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionAscensoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});