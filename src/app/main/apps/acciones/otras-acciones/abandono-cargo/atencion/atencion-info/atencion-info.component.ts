import { SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from 'app/core/data/data.service';
import { AtencionReporte, DocumentoSustentoAbandono } from 'app/core/model/abandono-cargo.model';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SustentoInfoComponent } from '../sustento-info/sustento-info.component';

@Component({
  selector: 'minedu-atencion-info',
  templateUrl: './atencion-info.component.html',
  styleUrls: ['./atencion-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AtencionInfoComponent implements OnInit {

  nombreCabecera = 'Ver Información - Registro Abandono Cargo y Otros';
  atencionReporte = new AtencionReporte();
  working = false;
  isMobile = false;
  currentWidth: string;
  dialogRefPreview: any;
  
  dataSource: DocumentoSustentoAbandono[];
  selection = new SelectionModel<any>(true, []);
  
  displayedColumns: string[] = [
    'numeroRegistro',
    'tipoDocumentoSustento',
    'numeroDocumentoSustento',
    'fechaEmision',
    'tipoFormatoSustento',
    'numeroFolios',
    'fechaRegistro',
    'acciones'
  ];

  constructor(
    public matDialogRef: MatDialogRef<AtencionInfoComponent>,
    @Inject(MAT_DIALOG_DATA) private dataDialog: any,
    private dataService: DataService,
    private materialDialog: MatDialog) { }

  ngOnInit(): void {
    this.buildForm();
    this.handleResponsive();
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
  }

  getIsMobile(): boolean {
    var w = document.documentElement.clientWidth;
    this.currentWidth = (w-135).toString() + 'px';
    const breakpoint = 992;
    if (w < breakpoint) {
        this.nombreCabecera = 'Ver Información';
        return true;
    } else {
        this.nombreCabecera = 'Ver Información - Registro Abandono Cargo y Otros';
        return false;
    }
  }

  buildForm() {
    this.working = true;
    this.dataService.OtrasFuncionalidades().getAtencionReporteIdAtencion(this.dataDialog.idAtencionReporte).pipe(
      catchError(() => of(null)),
      finalize(() => { this.working = false; })
    ).subscribe(
      (response) => {
        if(response)
        {
          this.atencionReporte = response;
          this.dataSource = this.atencionReporte.documentoSustento;
        }
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }

  handleExportar(row: any) {
    this.dataService.Spinner().show('sp6');
    this.dataService.Documento().descargar(row.codigoDocumentoSustento)
        .pipe(
            catchError((e) => {
                return of(e);
            }),
            finalize(() => this.dataService.Spinner().hide('sp6'))
        ).subscribe(response => {
            if (response) {
                this.handlePreview(response, row.codigoDocumentoSustento);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL INFORME ESCALAFONARIO."', () => {
                });
            }
        });
  }

  handleInformacion(row: any) {
    this.dialogRefPreview = this.materialDialog.open(SustentoInfoComponent, {
        panelClass: 'servidorpublico-sustento-info',
        disableClose: true,
        data: {
            documentoSustento: row
        }
    });    
  }
  
  handlePreview(file: any, codigoAdjuntoSustento: string) {
    this.dialogRefPreview = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        disableClose: true,
        data: {
            modal: {
                icon: 'remove_red_eye',
                title: 'Documento de Sustento',
                file: file,
                fileName: codigoAdjuntoSustento
            }
        }
    });
  };

}
