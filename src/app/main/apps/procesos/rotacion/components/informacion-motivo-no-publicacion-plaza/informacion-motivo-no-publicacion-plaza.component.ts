import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { isArray } from 'lodash';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { InformacionDocumentoSustentoComponent } from '../informacion-documento-sustento/informacion-documento-sustento.component';

@Component({
  selector: 'minedu-informacion-motivo-no-publicacion-plaza',
  templateUrl: './informacion-motivo-no-publicacion-plaza.component.html',
  styleUrls: ['./informacion-motivo-no-publicacion-plaza.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class InformacionMotivoNoPublicacionPlazaComponent implements OnInit {


  motivoNoPublicacion = null;

  displayedColumns: string[] = [
    'index',
    'tipoDocumentoSustento',
    'numeroDocumentoSustento',
    'tipoFormatoSustento',
    'numeroFolios',
    'fechaEmision',
    'fechaRegistro',
    'opciones'
  ];
  private _loadingChange = new BehaviorSubject<boolean>(false);
  loading = this._loadingChange.asObservable();
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(false, []);


  dialogRef: any;

  constructor(
    public matDialogRef: MatDialogRef<InformacionMotivoNoPublicacionPlazaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    setTimeout(() => { this.buildForm(); }, 0);
  }


  buildForm() {
    this.dataSource = new MatTableDataSource([]);
    setTimeout(() => { this.getMotivoNoPublicacion(); }, 0);
  }



  private getMotivoNoPublicacion() {

    const { idPlazaRotacion, idPlazaRotacionDetalle } = this.data;

    this.dataService.Spinner().show('sp6');
    this.dataService.Rotacion()
      .getMotivoNoPublicacionPlazaRotacion(idPlazaRotacion, idPlazaRotacionDetalle)
      .pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => {
          this.dataService.Spinner().hide('sp6');
        })
      )
      .subscribe(response => {
        if (response) {
          const { motivo, sustentos } = response;
          if (!motivo) {
            this.handleCancelar();
          }
          this.motivoNoPublicacion = motivo;
          this.dataSource = new MatTableDataSource(sustentos);
        } else {
          this.dataService.Message().msgWarning('Error inesperado en el servidor. Inténtelo en unos segundos, si el error persiste comuníquese con el administrador del sistema.', () => {
          });
        }
      });
  }


  handleInformacion(row) {
    this.dialogRef = this.materialDialog.open(InformacionDocumentoSustentoComponent, {
      panelClass: 'documento-sustento-informacion',
      disableClose: true,
      data: { documento: row }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
      });
  }

  handleVerAdjunto(row) {
    if (!row.codigoAdjunto) {
      this.dataService.Message().msgWarning('EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO ADJUNTADO.', () => {
      });
      return;
    }
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(row.codigoAdjunto)
      .pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => this.dataService.Spinner().hide('sp6'))
      ).subscribe(response => {
        if (response) {
          this.handlePreview(response, row.codigoAdjunto);
        } else {
          this.dataService.Message().msgWarning('NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.', () => {
          });
        }
      });
  }

  handlePreview(file: any, codigoAdjuntoSustento: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
      panelClass: 'modal-viewer-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: 'remove_red_eye',
          title: 'Documento de sustento',
          file: file,
          fileName: codigoAdjuntoSustento
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

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }
  configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}

