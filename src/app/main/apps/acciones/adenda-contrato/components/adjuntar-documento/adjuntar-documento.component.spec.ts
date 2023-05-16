import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjuntarDocumentoComponent } from './adjuntar-documento.component';

describe('AdjuntarDocumentoComponent', () => {
  let component: AdjuntarDocumentoComponent;
  let fixture: ComponentFixture<AdjuntarDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdjuntarDocumentoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjuntarDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
