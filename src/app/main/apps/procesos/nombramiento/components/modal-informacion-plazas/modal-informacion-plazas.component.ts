import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazaNombramientoResponseModel } from '../../models/plaza-nombramiento.model';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'minedu-modal-informacion-plazas',
    templateUrl: './modal-informacion-plazas.component.html',
    styleUrls: ['./modal-informacion-plazas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })
  export class ModalInformacionPlazasComponent implements OnInit{

    modal = {
      icon: "",
      title: "",
      action: "",
      info: null,
      editable: false
    }

    private passport: SecurityModel;
    private idPlazaNombramientoDetalle: number;
    plazaNombramiento: PlazaNombramientoResponseModel = new PlazaNombramientoResponseModel();

    isMobile = false;
    getIsMobile(): boolean {
      const w = document.documentElement.clientWidth;
      const breakpoint = 992;
      if (w < breakpoint) {
        return true;
      } else {
        return false;
      }
    }
    
    constructor(
      private dataService: DataService,
      public matDialogRef: MatDialogRef<ModalInformacionPlazasComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any)
    { }
  
    ngOnInit(): void {
      this.buildForm();
    }
  
    

    buildForm() {
      this.initialize();
    }
  
    initialize() {
      this.modal = this.data.modal;
      this.passport = this.data.passport;
      this.idPlazaNombramientoDetalle = this.data.idPlazaNombramientoDetalle;

      this.obtenerPlazaNombramiento();
    }
    obtenerPlazaNombramiento = () => {
      this.dataService
      .Nombramiento()
      .getPlazaNombramientoDetalle(this.idPlazaNombramientoDetalle)
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response) {
              this.plazaNombramiento = response;
          }
      });
    }
  

    handleCancelar(data?: any) {
      this.matDialogRef.close(data);
    }

  
  }