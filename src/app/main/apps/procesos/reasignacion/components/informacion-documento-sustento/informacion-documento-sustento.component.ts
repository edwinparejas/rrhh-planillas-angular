import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { saveAs } from 'file-saver';
import { of } from 'rxjs';
import { catchError, finalize} from 'rxjs/operators';
import { DocumentViewerComponent } from "app/main/apps/components/document-viewer/document-viewer.component";

@Component({
  selector: 'minedu-informacion-documento-sustento',
  templateUrl: './informacion-documento-sustento.component.html',
  styleUrls: ['./informacion-documento-sustento.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class InformacionDocumentoSustentoComponent implements OnInit {

  documento: any = null;
  working = false;
  dialogRef: any;

  constructor(
    public matDialogRef: MatDialogRef<InformacionDocumentoSustentoComponent>,
    private dataService: DataService,
    private materialDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.documento = this.data.documento;
  }

  descargarResolucion = () => {
    const data = this.documento;
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(data.codigoDocumentoSustento)
        .pipe(
            catchError((e) => of(null)),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                saveAs(response, 'documentosustento.pdf');
            } else {
                this.dataService.Message().msgWarning('No se pudo descargar documento sustento', () => { });
            }
        });
  }

    handleVerAdjunto(row) {
        if (!row.documentoAdjuntoSustento) {
            this.dataService.Message().msgWarning('EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO ADJUNTADO.', () => {
            });
            return;
        }

        this.handlePreview(row.documentoAdjuntoSustento, "");
    }

    handlePreview(file: any, nombreAdjuntoSustento: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: 'remove_red_eye',
                    title: 'Documento de sustento',
                    file: file,
                    fileName: nombreAdjuntoSustento
                }
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
            });
    }

}
