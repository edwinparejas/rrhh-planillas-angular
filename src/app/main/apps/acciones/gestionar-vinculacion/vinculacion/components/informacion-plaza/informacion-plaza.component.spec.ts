import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionPlazaComponent } from './informacion-plaza.component';


describe('InformacionPlazaComponent', () => {
  let component: InformacionPlazaComponent;
  let fixture: ComponentFixture<InformacionPlazaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionPlazaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionPlazaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});