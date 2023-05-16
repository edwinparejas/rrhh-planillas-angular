import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { DocumentoSustentoAbandono } from 'app/core/model/abandono-cargo.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-sustento-info',
  templateUrl: './sustento-info.component.html',
  styleUrls: ['./sustento-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class SustentoInfoComponent implements OnInit {

  nombreCabecera = 'Ver Información de Sustento';
  documentoSustento = new DocumentoSustentoAbandono();
  working = false;
  isMobile = false;
  
  constructor(
    public matDialogRef: MatDialogRef<SustentoInfoComponent>,
    @Inject(MAT_DIALOG_DATA) private dataDialog: any,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.handleResponsive();
  }

  ngAfterContentInit() {
    this.buildForm();
}

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
  }

  getIsMobile(): boolean {
    var w = document.documentElement.clientWidth;
    const breakpoint = 992;
    if (w < breakpoint) {
        return true;
    } else {
        return false;
    }
  }

  buildForm() {
    this.working = true;
    if (this.dataDialog.documentoSustento.idDocumentoSustento > 0) {
      this.dataService.OtrasFuncionalidades().getDocumentoSustento(this.dataDialog.documentoSustento.idDocumentoSustento).pipe(
        catchError(() => of(null)),
        finalize(() => { this.working = false; })
      ).subscribe(
        (response) => {
          if(response)
          {
            this.documentoSustento = response;
          }
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      )
    }
    else{
      this.documentoSustento.tipoDocumentoSustento = this.dataDialog.documentoSustento.tipoDocumentoSustento;
      this.documentoSustento.numeroDocumentoSustento = this.dataDialog.documentoSustento.numeroDocumentoSustento;
      this.documentoSustento.entidadEmisora = this.dataDialog.documentoSustento.entidadEmisora;
      this.documentoSustento.tipoFormatoSustento = this.dataDialog.documentoSustento.tipoFormatoSustento;
      this.documentoSustento.fechaEmision = this.dataDialog.documentoSustento.fechaEmision;
      this.documentoSustento.numeroFolios = this.dataDialog.documentoSustento.numeroFolios;
      this.documentoSustento.sumilla = this.dataDialog.documentoSustento.sumilla;
      this.documentoSustento.codigoDocumentoSustento = this.dataDialog.documentoSustento.plazoDescargo;
      this.working = false;
    }
  }

  btnDescargarAdjunto(codigoDocumentoSustento: string) {
    this.dataService.Spinner().show('sp6');
    if (typeof codigoDocumentoSustento === "string") {
      this.dataService.Documento().descargar(codigoDocumentoSustento)
          .pipe(
              catchError((e) => {
                  return of(e);
              }),
              finalize(() => this.dataService.Spinner().hide('sp6'))
          ).subscribe(response => {
            if(response){
              saveAs(response, this.documentoSustento.numeroDocumentoSustento);
            }
          });
    }
    else{
      saveAs(codigoDocumentoSustento, "temp_documento_sustento");
      this.dataService.Spinner().hide('sp6')
    }
  }
}
