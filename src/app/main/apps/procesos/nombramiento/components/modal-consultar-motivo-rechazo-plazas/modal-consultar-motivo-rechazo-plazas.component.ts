import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SecurityModel } from 'app/core/model/security/security.model';
import { PlazaNombramientoResponseModel } from '../../models/plaza-nombramiento.model';
import { ModalInformacionDocumentoSustentoComponent } from '../modal-informacion-documento-sustento/modal-informacion-documento-sustento.component';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'minedu-modal-consultar-motivo-rechazo-plazas',
    templateUrl: './modal-consultar-motivo-rechazo-plazas.component.html',
    styleUrls: ['./modal-consultar-motivo-rechazo-plazas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })
  export class ModalConsultarMotivoRechazoPlazasComponent implements OnInit, AfterViewInit {

    dialogRef: any;
    
    modal = {
      icon: "",
      title: "",
      action: "",
      info: null,
      editable: false
    }
  
    public idPlazaNombramientoDetalle: number;
    plazaNombramiento: PlazaNombramientoResponseModel = new PlazaNombramientoResponseModel();
    documentoSustento = [];
  
    displayedColumns: string[] = [
      'descripcionTipoDocumentoSustento',
      'numeroDocumentoSustento',
      'descripcionTipoFormatoSustento',
      'numeroFolios',
      'fechaEmision',
      'fechaCreacion',
      'acciones'
    ];
    
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
      public matDialogRef: MatDialogRef<ModalConsultarMotivoRechazoPlazasComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private materialDialog: MatDialog,
      private dataService: DataService) {
    }
  
    ngOnInit(): void {
      this.buildForm();
    }
  
    ngAfterViewInit() {
    }
  
    buildForm() {
      this.initialize();
    }
    
    initialize() {
      this.modal = this.data.modal;
      this.idPlazaNombramientoDetalle = this.data.idPlazaNombramientoDetalle;

      this.obtenerPlazaNombramiento();
      this.obtenerDocumentoSustento();
    }  
  
    handleInformacionDocumentoSustento(row: any){

      this.dialogRef = this.materialDialog.open(ModalInformacionDocumentoSustentoComponent, {
        panelClass: 'modal-proceso-form-dialog',
        disableClose: true,
        data: {
          modal: {
            icon: "save",
            title: "Informacion completa de Documento Sustento",
            action: "informate",
            info: { instancia: 16 },
            editable: true
          },
          //passport: this.passport,
          documentoSustento: row,
        }
      });

      this.dialogRef.afterClosed()
        .subscribe((response: any) => {
          if (!response) {
            return;
          }
          if (response.reload) { 
          }
        });                                          
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

    obtenerDocumentoSustento = () => {
      this.dataService
      .Nombramiento()
      .getPageDocucmentoSustento(this.idPlazaNombramientoDetalle)
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response) {
            this.documentoSustento = response;
          }
      });
    }
  
    handleCancelar(data?: any) {
      this.matDialogRef.close(data);
    }
  
  }