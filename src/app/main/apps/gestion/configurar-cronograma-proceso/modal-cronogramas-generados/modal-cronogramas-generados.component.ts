import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { CodigoEstadoProyectoResolucion } from '../../_utils/types-gestion';

@Component({
  selector: 'minedu-modal-cronogramas-generados',
  templateUrl: './modal-cronogramas-generados.component.html',
  styleUrls: ['./modal-cronogramas-generados.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ModalCronogramasGeneradosComponent implements OnInit {

  selection = new SelectionModel<any>(false, []);
  dataSource: any;
  working: boolean = false;
  dialogRef: any;
  codEstadoProyectoResolucion = CodigoEstadoProyectoResolucion;
  cantidadLoadings = 0;

  modal = {
    icon: "",
    title: "",
    origin: ""
  }

  displayedColumns: string[] = [
    'registro',
    'descripcionEtapa',
    'fechaCreacion',
    'estado',
    'acciones'
  ];
  tituloFechaGeneracion ="Fecha de creación";

  constructor(public matDialogRef: MatDialogRef<ModalCronogramasGeneradosComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dataService: DataService,
    private materialDialog: MatDialog) { }

  ngOnInit(): void {
    this.modal = this.data.modal;

    let data = {
      idProceso: this.data.cabeceraProceso.idProceso,
      idOtraInstancia: this.data.centroTrabajo.idOtraInstancia,
      idInstancia: this.data.centroTrabajo.idDre,
      idSubInstancia: this.data.centroTrabajo.idUgel,
      codigoTipoCronograma: this.data.permisoCronograma.codigoTipoCronograma
    }

    if (this.modal.origin === 'publicacion'){
      this.dataService.GestionProcesos().getDocumentosCronograma(data).pipe(
        catchError(() => { return of(null); }),
      ).subscribe(response => {
        this.dataSource = response
      });
      this.tituloFechaGeneracion = "Fecha de publicación";
    }

    if (this.modal.origin === 'proyecto')
      this.dataService.GestionProcesos().getDocumentosProyectoCronograma(data).pipe(
        catchError(() => { return of(null); }),
      ).subscribe(response => {
        this.dataSource = response
      });

  }

  btnCancelar() {
    this.matDialogRef.close();
  }

  handleVerDocumento(codigoDocumentoGenerado: string) {
    if (!codigoDocumentoGenerado) return;
    this.cargarLoading();
    this.dataService.Documento().descargar(codigoDocumentoGenerado)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.descargarLoading(); this.working = false; })
      ).subscribe(response => {
        if (response) {
          let nameFile: string;
          if (this.modal.origin === 'publicacion')
            nameFile = "Cronograma_Publicado";
          if (this.modal.origin === 'proyecto')
            nameFile = "Proyecto_Resolución_Cronograma";
          this.handlePreview("Visualización de documento", response, nameFile);
        }
      });
  }

  handlePreview(title: string, file: any, nameFile: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
              icon: 'remove_red_eye',
              title: title,
              file: file,
              fileName: nameFile
            }
        }
    });

    this.dialogRef.afterClosed()
    .subscribe((response: any) => {
      if (!response) return
    });
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

