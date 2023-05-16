import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConformidadAdjudicacionComponent } from './conformidad-adjudicacion.component';



describe('ConformidadAdjudicacionComponent', () => {
  let component: ConformidadAdjudicacionComponent;
  let fixture: ComponentFixture<ConformidadAdjudicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConformidadAdjudicacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConformidadAdjudicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});