import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListarPlazasComponent } from './listar.plazas.components';


describe('ListarPlazasComponent', () => {
  let component: ListarPlazasComponent;
  let fixture: ComponentFixture<ListarPlazasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarPlazasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarPlazasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
