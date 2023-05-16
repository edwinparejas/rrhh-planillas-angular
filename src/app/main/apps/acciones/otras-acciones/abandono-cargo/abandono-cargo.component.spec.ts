import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbandonoCargoComponent } from './abandono-cargo.component';

describe('AbandonoCargoComponent', () => {
  let component: AbandonoCargoComponent;
  let fixture: ComponentFixture<AbandonoCargoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbandonoCargoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AbandonoCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
