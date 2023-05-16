import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialNexusComponent } from './historial-nexus.component';


describe('HistorialNexusComponent', () => {
  let component: HistorialNexusComponent;
  let fixture: ComponentFixture<HistorialNexusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorialNexusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialNexusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});