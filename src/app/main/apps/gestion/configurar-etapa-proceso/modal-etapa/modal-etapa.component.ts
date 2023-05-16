import { Component, OnInit, ViewEncapsulation, Inject, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { HttpErrorResponse } from '@angular/common/http';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { MESSAGE_GESTION } from '../../_utils/messages';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { CodigoCatalogo, CodigoEstadoEtapa, CodigoTipoVigencia } from '../../_utils/types-gestion';

export const YEAR_MODE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'minedu-modal-etapa',
  templateUrl: './modal-etapa.component.html',
  styleUrls: ['./modal-etapa.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: YEAR_MODE_FORMATS }
  ]
})
export class ModalEtapaComponent implements OnInit {

  form: FormGroup;
  tiempoMensaje: number = 3000;  

  working = false;
  minInicio = new Date(new Date().setHours(0, 0, 0, 0));
  minDate = new Date(new Date().setHours(0, 0, 0, 0));
  minDateHolgura = new Date(new Date().setHours(0, 0, 0, 0));
  untilDate = new Date(new Date().getFullYear(), 11, 31);
  maxDate = new Date(new Date().getFullYear(), 11, 31);

  proceso: any;

  permisoPassport = {
    buttonCrearEtapaFase: false,
    buttonModificarEtapaFase: false,
    buttonEliminarEtapaFase: false,
    buttonObservarEtapaFase: false
  }

  @Input() etapaProceso: any;

  modal = {
    icon: "",
    title: "",
    action: "",
    disabled: false
  }

  private passport: SecurityModel;

  tipoVigencia: any[];
  feriados: any[];

  dialogRef: any;
  constructor(
    public matDialogRef: MatDialogRef<ModalEtapaComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
    private formBuilder: FormBuilder,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    this.buildForm();
    this.defaultPermisoPassport();
    this.getCombosYCabecera();
    this.obtenerVigenciaInicioEtapaAnterior();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      idProceso: [null],
      idEstadoEtapa: [null],
      idTipoVigencia: [null, Validators.required],
      vigenciaInicio: [{value: null, disabled: true}, Validators.required],
      vigenciaTermino: [{value: null, disabled: true}, Validators.required],
      vigenciaTerminoHolgura: [{value: null, disabled: true}, Validators.required],
      cantidadDias: [null],
      descripcionEtapa: [null],
      motivoCancelacion: [null],
      aceptaPostulanteWeb: [false],
      aceptaReclamosWeb: [false],
      codigoDocumentoEtapa: [null],
      documentoConvocatoria: [null],
      usuarioCreacion: [null, Validators.required],
      idEtapaProceso: [0],
      etapa: [null],
      diasHabiles: [0],
      diasHolgura: [0]
    });

    this.form.get("idTipoVigencia").valueChanges.subscribe(value => {
      if (value) {
        
        if (this.form.get("vigenciaInicio").disabled)
          this.activarControlesVigencia();

        if (!this.filtroTipoVigencia(this.minInicio))
          this.form.patchValue({ vigenciaInicio: null, diasHabiles: null });

        this.calcularDiasVigencia();
        this.calcularDiasHolgura();
      }
    });

    this.form.get("vigenciaInicio").valueChanges.subscribe(value => {
      if (value){
        this.minDate = value;
        this.calcularDiasVigencia();
      }
    });

    this.form.get("vigenciaTermino").valueChanges.subscribe(value => {
      if (value) {
        const vigenciaTermino = new Date(value);
        if (this.form.get("vigenciaTerminoHolgura").value){
          const vigenciaTerminoHolgura = new Date(this.form.get("vigenciaTerminoHolgura").value);
          if (vigenciaTermino > vigenciaTerminoHolgura)
            this.form.patchValue({ vigenciaTerminoHolgura: null, diasHolgura: null });
        }

        this.untilDate = vigenciaTermino;
        this.minDateHolgura = vigenciaTermino;
      }
    });

    this.form.get("vigenciaTerminoHolgura").valueChanges.subscribe(value => {
      if (value){
        this.calcularDiasHolgura();
      }
    });

    this.obtenerFeriados();
    this.initialize();
  }

  filtroTipoVigencia = (d: any): boolean => {
    const idTipoVigencia = this.form.get('idTipoVigencia').value;
    if (!this.tipoVigencia || !idTipoVigencia) return true;
    var codigotipoVigencia = this.tipoVigencia.find(x => x.idCatalogoItem === idTipoVigencia).codigoCatalogoItem;

    const date = new Date (d);
    const day = date.getDay();
    
    switch (codigotipoVigencia) {
      case CodigoTipoVigencia.diasHabiles:
        return day !== 0 && day !== 6 &&
            (this.feriados.filter(x=> x.toLocaleDateString() == date.toLocaleDateString() ).length == 0);
      case CodigoTipoVigencia.diasHabilesIncluyendoSabado:
        return day !== 0 &&
            (this.feriados.filter(x=> x.toLocaleDateString() == date.toLocaleDateString() ).length == 0);
      case CodigoTipoVigencia.diasCalendario:
        return true;
      default:
        return true;
    }
  }

  obtenerFeriados() {
    const anioInicio = new Date().getFullYear();
    this.dataService.GestionProcesos().obtenerFeriadosAPartirDeAnioInicio(anioInicio).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(feriados => {
      if (feriados?.length > 0) {
        this.feriados = feriados.map(fecha => {
          return new Date(fecha);
        })
      } 
    });
  }

  calcularDiasVigencia() {
    const idTipoVigencia = this.form.get('idTipoVigencia').value;
    const vigenciaInicio = this.form.get('vigenciaInicio').value;
    const vigenciaTermino = this.form.get('vigenciaTermino').value;
    if(!idTipoVigencia || !vigenciaInicio || !vigenciaTermino) return;
    const data = {
      idTipoVigencia: idTipoVigencia,
      fechaInicial: vigenciaInicio,
      fechaFinal: vigenciaTermino
    }
    this.dataService.GestionProcesos().calcularDiasVigencia(data).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(response => {
      if (response >= 0) {
        this.form.patchValue({ diasHabiles: response });
      } else {
        this.form.patchValue({ diasHabiles: null });
      }
    });
  }

  calcularDiasHolgura() {
    const idTipoVigencia = this.form.get('idTipoVigencia').value;
    const vigenciaTermino = this.form.get('vigenciaTermino').value;
    const vigenciaTerminoHolgura = this.form.get('vigenciaTerminoHolgura').value;
    if(!idTipoVigencia || !vigenciaTermino || !vigenciaTerminoHolgura) return;
    const data = {
      idTipoVigencia: idTipoVigencia,
      fechaInicial: vigenciaTermino,
      fechaFinal: vigenciaTerminoHolgura
    }
    this.dataService.GestionProcesos().calcularDiasVigencia(data).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(response => {
      if (response >= 0) {
        this.form.patchValue({ diasHolgura: (response == 0 ? response: response - 1) });
      } else {
        this.form.patchValue({ diasHolgura: null });
      }
    });
  }

  obtenerVigenciaInicioEtapaAnterior() {
    const data = {
      idProceso: this.proceso.idProceso,
      idEtapaProceso: this.etapaProceso.idEtapaProceso
    }
    this.dataService.GestionProcesos().obtenerVigenciaInicioEtapaAnterior(data).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0], () => {
          if (this.modal.action === "edit") 
            this.handleCancelar();
        });
        return of(null);
      }),
      ).subscribe(response => {
        if (response){
          this.minInicio = response;
          this.minDate = response;
          this.minDateHolgura = response;

          if(this.etapaProceso.vigenciaInicio && this.etapaProceso.vigenciaTermino && this.etapaProceso.vigenciaTerminoHolgura) {
            this.form.patchValue({ 
              vigenciaInicio: this.etapaProceso.vigenciaInicio >= response ? this.etapaProceso.vigenciaInicio : null,
              vigenciaTermino: this.etapaProceso.vigenciaTermino >= response ? this.etapaProceso.vigenciaTermino : null,
              diasHabiles: this.etapaProceso.vigenciaInicio >= response && this.etapaProceso.vigenciaTermino >= response ? this.etapaProceso.diasHabiles: null,
              vigenciaTerminoHolgura: this.etapaProceso.vigenciaTerminoHolgura >= response ? this.etapaProceso.vigenciaTerminoHolgura : null,
              diasHolgura: this.etapaProceso.vigenciaTermino >= response && this.etapaProceso.vigenciaTerminoHolgura >= response ? this.etapaProceso.diasHolgura: null
            });
            if (response > this.etapaProceso.vigenciaTermino)
              this.untilDate = this.maxDate;
          }

        }
      });
  }
  
  getCombosYCabecera() {
    forkJoin(
      [
        this.dataService.GestionProcesos().getCatalogoItemXCodigoCatalogo(CodigoCatalogo.TipoVigenca)
      ]
    ).pipe(
      catchError(() => { return of(null); }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      this.tipoVigencia = response[0];
    })
  }

  initialize() {
    this.modal = this.data.modal;
    this.passport = this.data.passport;
    this.proceso = this.data.proceso;
    this.etapaProceso = this.data.etapaProceso;
    this.maxDate = new Date(+this.proceso.anio + 1 , 11, 31);
    this.untilDate = this.maxDate;
    
    this.form.patchValue({ 
      idProceso: this.proceso.idProceso, 
      usuarioCreacion: this.passport.numeroDocumento,

      idEtapaProceso: this.etapaProceso.idEtapaProceso,
      descripcionEtapa: this.etapaProceso.descripcionEtapa,
      idTipoVigencia: this.etapaProceso.idTipoVigencia,
      vigenciaInicio: this.etapaProceso.vigenciaInicio ? new Date(this.etapaProceso.vigenciaInicio) : null,
      vigenciaTermino: this.etapaProceso.vigenciaTermino ? new Date(this.etapaProceso.vigenciaTermino) : null,
      vigenciaTerminoHolgura: this.etapaProceso.vigenciaTerminoHolgura ? new Date(this.etapaProceso.vigenciaTerminoHolgura) : null,
      aceptaPostulanteWeb: this.etapaProceso.aceptaPostulantesWeb,
      aceptaReclamosWeb: this.etapaProceso.aceptaReclamosWeb,
      codigoDocumentoEtapa: this.etapaProceso.codigoDocumentoEtapa,
      motivoCancelacion: this.etapaProceso.motivoCancelacion,
      etapa: this.etapaProceso.etapa,
      diasHabiles: this.etapaProceso.diasHabiles,
      diasHolgura: this.etapaProceso.diasHolgura
    });
    this.modal.disabled = false;

    if (this.modal.action === "cancel") 
      this.validateFormCancelar();

    if (this.modal.action === 'cancel' || this.modal.action === 'info') {
      this.modal.disabled = true;
    }
  }

  defaultPermisoPassport() {
    this.permisoPassport.buttonCrearEtapaFase = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Agregar);
    this.permisoPassport.buttonModificarEtapaFase = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Modificar);
    this.permisoPassport.buttonEliminarEtapaFase = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Eliminar);
    this.permisoPassport.buttonObservarEtapaFase = this.dataService.Storage().tienePermisoAccion(TablaProcesosConfiguracionAcciones.Observar);
  }

  activarControlesVigencia() {
    this.form.get('vigenciaInicio').enable();
    this.form.get('vigenciaTermino').enable();
    this.form.get('vigenciaTerminoHolgura').enable();
  }

  validateFormCancelar() {
    this.form.get('motivoCancelacion').setValidators([Validators.required]);
    this.form.get('motivoCancelacion').updateValueAndValidity();
    this.removeCreateValidations();
  }

  removeCreateValidations() {
    this.form.get('idTipoVigencia').clearValidators();
    this.form.get('idTipoVigencia').updateValueAndValidity();

    this.form.get('vigenciaInicio').clearValidators();
    this.form.get('vigenciaInicio').updateValueAndValidity();

    this.form.get('vigenciaTermino').clearValidators();
    this.form.get('vigenciaTermino').updateValueAndValidity();

    this.form.get('vigenciaTerminoHolgura').clearValidators();
    this.form.get('vigenciaTerminoHolgura').updateValueAndValidity();
  }

  adjunto(file) {
    if (file === null)
      return;

    this.form.patchValue({ documentoConvocatoria: file[0] });
  }

  handleEliminarAdjunto(){
    this.form.patchValue({ documentoConvocatoria: null, codigoDocumentoEtapa: "" });
  }

  handleCrear() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }
    /*if (!this.permisoPassport.buttonCrearEtapaFase) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }*/
    this.obtenerClavePublica(TablaProcesosConfiguracionAcciones.Agregar);
  }

  handleCancelarEtapaProceso() {
    let form = {
      idProceso: this.proceso.idProceso,
      idEtapaProceso: this.form.get('idEtapaProceso').value,
      codigoCatalogoItem: CodigoEstadoEtapa.Cancelado,
      motivoCancelacion: this.form.get('motivoCancelacion').value,
      usuarioModificacion: this.passport.numeroDocumento
    };
    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M02, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().actualizarEtapaProceso(form).pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
      ).subscribe(response => {
          if (response)
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleCancelar({ reload: true, result: response }); });
        });
    }, () => { });
  }

  handleModificar() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }

    /*if (!this.permisoPassport.buttonModificarEtapaFase) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }*/
    //this.obtenerClavePublica(TablaProcesosConfiguracionAcciones.Modificar);
    this.modificarEtapa();
  }

  modificarEtapa() {
    const form = this.form.value;
    let documento = new FormData();
    documento.append('idEtapaProceso', form.idEtapaProceso);
    documento.append('descripcionEtapa', form.descripcionEtapa ?? "");
    documento.append('idTipoVigencia', form.idTipoVigencia);
    documento.append('vigenciaInicio', new Date(form.vigenciaInicio).toJSON());
    documento.append('vigenciaTermino', new Date(form.vigenciaTermino).toJSON());
    documento.append('vigenciaTerminoHolgura', new Date(form.vigenciaTerminoHolgura).toJSON());
    documento.append('aceptaPostulanteWeb', form.aceptaPostulanteWeb ?? false);
    documento.append('aceptaReclamosWeb', form.aceptaReclamosWeb ?? false);
    documento.append('documentoConvocatoria', form.documentoConvocatoria);
    documento.append('codigoDocumentoEtapa', form.codigoDocumentoEtapa ?? "");
    documento.append('usuarioCreacion', form.usuarioCreacion);

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M02, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().modificarEtapa(documento)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          if (response) {
            this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleCancelar({ reload: true }); });
          }
        });
    }, () => { });
  }

  handleEliminar() {
    /*if (!this.permisoPassport.buttonEliminarEtapaFase) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }*/
    this.obtenerClavePublica(TablaProcesosConfiguracionAcciones.Eliminar);
  }

  handleFinalizar() {
    /*if (!this.permisoPassport.buttonObservarEtapaFase) {
      this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      return;
    }*/
    this.obtenerClavePublica(TablaProcesosConfiguracionAcciones.Observar);
  }

  handleVisualizar() {
    const form = this.form.value;
    if (!form.codigoDocumentoEtapa) {
      return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.Documento().descargar(form.codigoDocumentoEtapa)
      .pipe(
        catchError((e) => of(null)),
        finalize(() => this.dataService.Spinner().hide("sp6"))
      ).subscribe(response => {
        if (response) {
          this.handlePreview('Documento de convocatoria', response, 'Documento de convocatoria');
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
    }
);
}

  obtenerClavePublica(operacion: TablaProcesosConfiguracionAcciones) {
    this.dataService.Spinner().show("sp6");
    this.dataService.Passport().boot().pipe(
      catchError(() => of(null))
    ).subscribe((response: any) => {
      if (response) {
        //const d = JSON.parse(response);
        const d = response;
        this.confirmarOperacion(d.Token, operacion);
      } else {
        this.dataService.Spinner().hide("sp6");
        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      }
    });
  }

  confirmarOperacion(token: any, operacion: TablaProcesosConfiguracionAcciones) {
    const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
    const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);
    this.dataService.Passport().getAutorizacion(param).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response && !response.HasErrors) {
        const data = response.Data[0];
        if (data.ESTA_AUTORIZADO) {
          switch (operacion) {
            case TablaProcesosConfiguracionAcciones.Agregar: {
              break;
            }
            case TablaProcesosConfiguracionAcciones.Modificar: {
              this.modificarEtapa();
              break;
            }
          }
        } else {
          this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
        }
      } else {
        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => { });
      }
    });
  }

  handleCancelar(data?: any) {
    this.matDialogRef.close(data);
  }
}
