import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionVinculacionComponent } from './informacion-vinculacion.component';

describe('InformacionVinculacionComponent', () => {
  let component: InformacionVinculacionComponent;
  let fixture: ComponentFixture<InformacionVinculacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InformacionVinculacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionVinculacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});