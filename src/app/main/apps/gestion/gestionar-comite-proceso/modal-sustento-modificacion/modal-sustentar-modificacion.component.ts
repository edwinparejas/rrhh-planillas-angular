import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { HttpErrorResponse } from '@angular/common/http';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
  selector: 'minedu-modal-sustentar-modificacion',
  templateUrl: './modal-sustentar-modificacion.component.html',
  styleUrls: ['./modal-sustentar-modificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ModalSustentarModificacionComite implements OnInit {

  name: string;
  tiempoMensaje: number = 3000; 
  working = false;
  permisoComite: any ;

  centroTrabajo: CentroTrabajoModel = null;

  miembroComite: any;
  modal = {
    icon: "",
    title: "",
    action: "",
    disabled: false
  }

  dialogRef: any;


  constructor(
    public matDialogRef: MatDialogRef<ModalSustentarModificacionComite>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dataService: DataService,
    private materialDialog: MatDialog) {
  }

  ngOnInit(): void {
    this.initialize();
  }

  initialize() {
    this.modal = this.data.modal;
    this.miembroComite = this.data.registro;
  }

  handleAdjunto(file) {
    if (file === null)
      return;
  }
  
  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }

  handleVerDocumentoSustento(codigoDocumentoSustento: string) {
    if (!codigoDocumentoSustento) return;
    this.dataService.Spinner().show("sp6");
    this.dataService.Documento().descargar(codigoDocumentoSustento)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
      ).subscribe(response => {
        if (response) {
          this.handlePreview("Documento sustento de modificación", response, "Documento sustento de modificación");
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

}

