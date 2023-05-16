import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { MESSAGE_GESTION } from '../../_utils/messages';
import { ModalProyectoResolucionCronogramaComponent } from '../modal-proyecto-resolucion/modal-proyecto-resolucion.component';
import { CodigoTipoCronograma, TipoCronograma } from '../../_utils/types-gestion';
import { ModalSustentarModificacionCronograma } from '../modal-sustento-modificacion/modal-sustentar-modificacion.component';

@Component({
  selector: 'minedu-modal-culminar-publicar-etapas',
  templateUrl: './modal-culminar-publicar-etapas.component.html',
  styleUrls: ['./modal-culminar-publicar-etapas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ModalCulminarPublicarEtapasComponent implements OnInit {

  selection = new SelectionModel<any>(true, []);
  dataSource = [];
  working: boolean = false;
  tiempoMensaje: number = 3000;  
  cantidadLoadings = 0;
  tipoCronograma = "";  

  modal = {
    icon: "",
    title: "",
    action: "",
    origin: ""
  }

  displayedColumns: string[] = [
    'select',
    'registro',
    'etapa',
    'vigenciaInicio',
    'vigenciaTermino',
  ];
  dialogRef: any;

  constructor(public matDialogRef: MatDialogRef<ModalCulminarPublicarEtapasComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.modal = this.data.modal;
    if (this.data.permisoCronograma.codigoTipoCronograma == CodigoTipoCronograma.Nacional)
      this.tipoCronograma = TipoCronograma.Nacional;
    else if (this.data.permisoCronograma.codigoTipoCronograma == CodigoTipoCronograma.Regional)
      this.tipoCronograma = TipoCronograma.Regional;
    else if (this.data.permisoCronograma.codigoTipoCronograma == CodigoTipoCronograma.Local)
      this.tipoCronograma = TipoCronograma.Local; 

    let data = {
      idProceso: this.data.cabeceraProceso.idProceso,
      idOtraInstancia: this.data.centroTrabajo.idOtraInstancia,
      idInstancia: this.data.centroTrabajo.idDre,
      idSubInstancia: this.data.centroTrabajo.idUgel,
      idInstitucionEducativa: this.data.centroTrabajo.idInstitucionEducativa,
      codigoTipoCronograma: this.data.permisoCronograma.codigoTipoCronograma
    }

    this.cargarLoading();
    this.working = true;
    this.dataService.GestionProcesos().obtenerEtapas(data).pipe(
      catchError(() => { return of(null); }),
      finalize(() => { this.descargarLoading(); this.working = false; })
    ).subscribe(response => {
      if (response && response.length > 0){
        if (this.modal.origin === 'modificar'){
          this.dataSource = response.filter(x => x.publicado == true);
        } else{
          this.dataSource = response;
        }
        this.masterToggle();
      }
      else{
        let mensaje = MESSAGE_GESTION.M185.replace(
          "[accionCronograma]", this.modal.origin.toUpperCase()).replace(
            "[tipoCronograma]", this.tipoCronograma.toUpperCase());
        this.dataService.Message().msgWarning(mensaje, this.handleCancelar({ reload: false }) );
      }
        
    });
  }

  esEtapaExcluida(row: any){
    return ((row.culminado && this.modal.origin == "culminar") || 
          (row.publicado && this.modal.origin == "publicar") || 
          (row.publicado && this.modal.origin == "modificar"));
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRowsMinusExcluded = this.dataSource
      .filter(row => !this.esEtapaExcluida(row)).length;
    return numSelected === numRowsMinusExcluded;
  }
  
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.forEach(row => {
        if (!this.esEtapaExcluida(row)) {
          this.selection.select(row);
        }
      });
  }

  btnCancelar() {
    this.matDialogRef.close();
  }

  btnCulminar(){
    if(this.selection.selected.length == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M91); return;
    }
    let data = {
      etapasProceso: this.selection.selected.map(item => { 
        return {
          idCronograma: item.idCronograma,
          idEtapaProceso: item.idEtapaProceso
        };
      }),
      codigoRolPassport: this.data.passport.codigoRol,
      idProceso: this.data.cabeceraProceso.idProceso,
      codigoTipoCronograma: this.data.permisoCronograma.codigoTipoCronograma,
      usuarioCreacion: this.data.passport.numeroDocumento
    };
    
    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M132, () => {
      this.cargarLoading();
      this.working = true;
      this.dataService.GestionProcesos()
        .updateCulminarCronograma(data)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.descargarLoading(); this.working = false; })
        )
        .subscribe(response => {
          if (response && response > 0) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleCancelar({ reload: true }); });
          }
        });
    }, () => { });
  }

  btnPublicar(){
    if(this.selection.selected.length == 0) {      
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M91); return;
    }
    let data = {
      etapasProceso: this.selection.selected.map(item => {
        return {
          idCronograma: item.idCronograma,
          idAlcanceProceso: item.idAlcanceProceso,
          idEtapaProceso: item.idEtapaProceso
        };
      }),
      codigoRolPassport: this.data.passport.codigoRol,
      idProceso: this.data.cabeceraProceso.idProceso,
      codigoTipoCronograma: this.data.permisoCronograma.codigoTipoCronograma,
      codigoSede: this.data.passport.codigoSede,
      codigoTipoSede: this.data.passport.codigoTipoSede,
      usuarioCreacion: this.data.passport.numeroDocumento
    };
    
    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M10, () => {
      this.cargarLoading();
      this.working = true;
      this.dataService.GestionProcesos()
        .updatePublicarCronograma(data)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.descargarLoading(); this.working = false; })
        )
        .subscribe(response => {
          if (response && response > 0) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleCancelar({ reload: true }); });
          }
        });
    }, () => { });
  }
    
  openGenerarProyecto() {
    if(this.selection.selected.length == 0) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M91); return;
    }
    this.dialogRef = this.materialDialog.open(ModalProyectoResolucionCronogramaComponent, {
      panelClass: 'modal-generar-proyecto-resolucion-form-dialog',
      disableClose: true,
      width: '1080px',
      data: {
        modal: {
          icon: "description",
          title: "Generar proyecto de resolución",
          action: "proyecto",
        },
        passport: this.data.passport,
        permisoCronograma: this.data.permisoCronograma,
        proceso: this.data.cabeceraProceso,
        centroTrabajo: this.data.centroTrabajo,
        etapasProceso: this.selection.selected.map(item => {
          return {
            idCronograma: item.idCronograma,
            idEtapaProceso: item.idEtapaProceso
          };
        }),
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
          this.handleCancelar({ reload: true });
        }
      });
  }

  
  openSustentarModificacion() {
    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M11, () => {

      this.dialogRef = this.materialDialog.open(ModalSustentarModificacionCronograma, {
        panelClass: 'modal-sustentar-modificacion-form-dialog',
        disableClose: true,
        width: '720px',
        data: {
          modal: {
            icon: "description",
            title: "Sustento de modificación del cronograma",
            action: "create",
          },
          passport: this.data.passport,
          permisoCronograma: this.data.permisoCronograma,
          proceso: this.data.cabeceraProceso,
          centroTrabajo: this.data.centroTrabajo,
          etapasProceso: this.dataSource.map(item => {
            return {
              idCronograma: item.idCronograma,
              idEtapaProceso: item.idEtapaProceso
            };
          }),
        }
      });

      this.dialogRef.afterClosed()
        .subscribe((response: any) => {
          if (!response) {
            return;
          }
          if (response.reload) {
            this.handleCancelar({ reload: true });
          }
        });
    }, () => { });
  }

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }

  cargarLoading() {
    if (this.cantidadLoadings == 0)
      setTimeout(() => { this.dataService.Spinner().show("sp6"); }, 0);
    this.cantidadLoadings++;
  }

  descargarLoading() {
    this.cantidadLoadings--;
    if (this.cantidadLoadings == 0)
      this.dataService.Spinner().hide("sp6");
  }
}

