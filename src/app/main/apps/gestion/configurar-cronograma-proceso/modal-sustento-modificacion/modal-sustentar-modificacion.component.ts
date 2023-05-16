import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { SecurityModel } from 'app/core/model/security/security.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MESSAGE_GESTION } from '../../_utils/messages';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
  selector: 'minedu-modal-sustentar-modificacion',
  templateUrl: './modal-sustentar-modificacion.component.html',
  styleUrls: ['./modal-sustentar-modificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ModalSustentarModificacionCronograma implements OnInit {

  name: string;
  form: FormGroup;
  tiempoMensaje: number = 3000; 
  working = false;
  permisoComite: any ;

  centroTrabajo: CentroTrabajoModel = null;

  etapasProceso: any;
  documentoModificatoria: any;
  modal = {
    icon: "",
    title: "",
    action: "",
    disabled: false
  }

  private passport: SecurityModel;

  combo = {
    tiposDocumento: []
  };

  dialogRef: any;


  constructor(
    public matDialogRef: MatDialogRef<ModalSustentarModificacionCronograma>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.initialize();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      motivoModificacion: [null],
      idTipoDocumento: [null],
      numeroDocumento: [null],
      adjuntarDocumento: [null],
      usuarioCreacion: [null, Validators.required],
      usuarioModificacion: [null]
    });


  }

  initialize() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    this.modal = this.data.modal;
    this.etapasProceso = this.data.etapasProceso;
    this.permisoComite = this.data.permisoCronograma;

    this.form.patchValue({
      usuarioCreacion: this.passport.numeroDocumento,
      usuarioModificacion: this.passport.numeroDocumento
    });

    if (this.modal.action === "create") {
      this.initCrearDocumentoSustento();
    }

    if (this.modal.action === "info") {
      this.obtenerDocumentoSustentoModificatoria(this.data.registro.idDocumentoSustentoModificatoria);
    }

  }

  initCrearDocumentoSustento() {

    this.form.patchValue({
      idTipoDocumento: null,
      numeroDocumento: null,
      adjuntarDocumento: null
    });


    if (this.modal.action === "create") {
      this.form.get('motivoModificacion').setValidators([Validators.required]);
      this.form.get('motivoModificacion').updateValueAndValidity();
      this.seccionSustentoModificacion();
    }

  }

  seccionSustentoModificacion() {

    this.dataService.GestionProcesos().getDocumentosSustento().pipe(
      catchError((e) => { return of(e); }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response) {
        this.combo.tiposDocumento = response;
      }
    });
  }

  obtenerDocumentoSustentoModificatoria(idDocumentoSustentoModificatoria: any) {

    this.dataService.GestionProcesos().getDocumentoSustentoModificatoria(idDocumentoSustentoModificatoria).pipe(
      catchError((e) => { return of(e); }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe((response: any) => {
      if (response) {
        this.documentoModificatoria = response;
      }
    });
  }

  removeValidations(flag: boolean) {
    if (flag) {
      this.form.get('usuarioCreacion').clearValidators();
      this.form.get('usuarioCreacion').updateValueAndValidity();
    }
  }


  btnGuardar() {

    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }

    this.crearSustentoModificacion();
  }


  handleAdjunto(file) {
    if (file === null)
      return;

    this.form.patchValue({ adjuntarDocumento: file[0] });
  }

  crearSustentoModificacion() {
    const data = this.form.value;

    let sustento = new FormData();    
    sustento.append('idCronograma', this.etapasProceso[0].idCronograma);
    sustento.append('motivoModificacion', data.motivoModificacion);
    sustento.append('idTipoDocumento', data.idTipoDocumento ?? "");
    sustento.append('numeroDocumento', data.numeroDocumento ?? "");
    sustento.append('documento', data.adjuntarDocumento);
    sustento.append('usuarioCreacion', data.usuarioCreacion);

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M02, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().modificarCronograma(sustento)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        ).subscribe((response: any) => {
          if (response)
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleCancelar({ reload: true }); });
        });
    }, () => { });
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

