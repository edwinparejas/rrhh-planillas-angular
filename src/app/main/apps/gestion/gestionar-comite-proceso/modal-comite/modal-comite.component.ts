import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TablaTipoDocumentoConfiguracion } from 'app/core/model/types';
import { CentroTrabajoModel } from 'app/core/model/centro-trabajo.model';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ModalVinculacionesComponent } from './modal-vinculaciones/modal-vinculaciones.component';
import { HttpErrorResponse } from '@angular/common/http';
import { MESSAGE_GESTION } from '../../_utils/messages';
import { CodigoCatalogo } from '../../_utils/types-gestion';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
  selector: 'minedu-modal-comite',
  templateUrl: './modal-comite.component.html',
  styleUrls: ['./modal-comite.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ModalComiteComponent implements OnInit {

  name: string;
  form: FormGroup;
  tiempoMensaje: number = 3000; 
  working = false;
  mostrarDatos = false;
  permisoComite: any ;
  registroCargado: boolean = false;
  maxLenghtDocumento: number = 12;
  longitudDocumentoExacta: boolean = false;

  centroTrabajo: CentroTrabajoModel = null;

  persona: any = {};
  miembroComite: any = {};

  divSustento: boolean = false;
  divBusquedaPersona: boolean = false;
  cabeceraProceso: any;
  modal = {
    title: "",
    action: "",
    idComite: 0,
    disabled: false
  }

  private passport: SecurityModel;

  combo = {
    nombresComite: [],
    tipoMiembroComite: [],
    cargosComite: [],
    representantesMiembroComite: [],
    // miembrosComite: [],
    tiposDocumentoIdentidad: [],
    tiposDocumento: []
  };

  temp = {
    tiposDocumentoIdentidad: []
  }
  dialogRef: any;


  constructor(
    public matDialogRef: MatDialogRef<ModalComiteComponent>,
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
      idComite: [0],
      idProceso: [null, Validators.required],
      idAlcanceProceso: [null, Validators.required],
      idPersona: [null, Validators.required],
      noTieneImpedimento: [false, Validators.requiredTrue],
      idCargo: [null],
      idNombreComite: [null, Validators.required],
      idCargoNombreComite: [null, Validators.required],
      idTipoMiembroComite: [null, Validators.required],
      idRepresentanteCargo: [null, Validators.required],
      telefonoMovil: [null, Validators.compose([Validators.required, Validators.maxLength(9), Validators.minLength(9), Validators.pattern(/^-?(0|[1-9]\d*)?$/)])],
      email: [null, Validators.compose([Validators.required, Validators.email])],

      idTipoDocumentoIdentidad: [null],
      numeroDocumentoIdentidad: [null],
      usuarioCreacion: [null, Validators.required],
      usuarioModificacion: [null],

      motivoModificacion: [null],
      idTipoDocumento: [null],
      numeroDocumento: [null],
      adjuntarDocumento: [null],

    });

    this.form.get("numeroDocumentoIdentidad").valueChanges.subscribe(value => {
      if (value && this.mostrarDatos && this.longitudDocumentoExacta && value.length != this.maxLenghtDocumento) 
        this.mostrarDatos = false;
    });

    this.form.get("idNombreComite").valueChanges.subscribe(value => {

      this.form.patchValue({ idTipoMiembroComite: null, idCargoNombreComite: null, idRepresentanteCargo: null });
      this.combo.tipoMiembroComite = [];
      this.combo.cargosComite = [];
      this.combo.representantesMiembroComite = [];
      if (!value) {
        return;
      }

      if (value) {
        this.getComboTipoMiembroComite(value);
      }
    });

    this.form.get("idTipoMiembroComite").valueChanges.subscribe(value => {

      this.form.patchValue({ idCargoNombreComite: null, idRepresentanteCargo: null });
      this.combo.cargosComite = [];
      this.combo.representantesMiembroComite = [];
      if (!value) {
        return;
      }

      if (value) {
        this.getComboCargoComite(value);
      }
    });

    this.form.get("idCargoNombreComite").valueChanges.subscribe(value => {

      this.form.patchValue({ idRepresentanteCargo: null });
      this.combo.representantesMiembroComite = [];
      if (!value) {
        return;
      }

      if (value) {
        this.getComboRepresentanteCargoComite(value);
      }
    });

  }

  initialize() {
    this.passport = this.dataService.Storage().getInformacionUsuario();
    this.modal = this.data.modal;
    this.cabeceraProceso = this.data.cabeceraProceso;
    this.permisoComite = this.data.permisoComite;

    this.form.patchValue({
      idComite: this.data.idComite,
      idProceso: this.cabeceraProceso.idProceso,
      idAlcanceProceso: this.permisoComite.idAlcanceProceso,
      usuarioCreacion: this.passport.numeroDocumento,
      usuarioModificacion: this.passport.numeroDocumento
    });

    if (this.modal.action === "create") {
      this.initCrearMiembroComite();
    }

    if (this.modal.action === "edit") {
      this.mostrarDatos = true;
      this.initEditarMiembroComite(this.data.estadoComite);
    }

    if (this.modal.action === "info") {
      this.mostrarDatos = true;

      if (this.data.registro.estadoComite === 'MODIFICADO') {
        this.divSustento = true;
      }

      this.setDatosPersona(this.data.registro);
    }

  }

  initCrearMiembroComite() {

    this.divBusquedaPersona = true;
    this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe(value => {
      if (!value)
        return;

      let tipoDocumentoIdentidad = this.temp.tiposDocumentoIdentidad.find(x => x.idCatalogoItem === value).codigoCatalogoItem;

      this.form.get('numeroDocumentoIdentidad').clearValidators();
      this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();

      if (TablaTipoDocumentoConfiguracion.DNI === tipoDocumentoIdentidad) {
        this.maxLenghtDocumento = 8;
        this.longitudDocumentoExacta = true;
        this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern(/^[0-9]+$/)])]);
        this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
      }

      if (TablaTipoDocumentoConfiguracion.CE === tipoDocumentoIdentidad || 
          TablaTipoDocumentoConfiguracion.PASS === tipoDocumentoIdentidad) {
        this.maxLenghtDocumento = 12;
        this.longitudDocumentoExacta = false;
        this.form.get('numeroDocumentoIdentidad').setValidators([Validators.compose([Validators.required, Validators.maxLength(12), Validators.minLength(9), Validators.pattern(/^[a-zA-Z0-9]+$/)])]);
        this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
      }

    });

    this.getComboTiposDocumentoIdentidad();
    this.getComboNombresComite();
  }

  initEditarMiembroComite(estadoComite: string) {

    this.form.patchValue({
      idTipoDocumentoIdentidad: this.data.registro.idTipoDocumentoIdentidad,
      idPersona: this.data.registro.idPersona,
      noTieneImpedimento: !this.data.registro.tieneImpedimentoVigente,
      telefonoMovil: this.data.registro.telefonoMovil,
      email: this.data.registro.email,
      numeroDocumentoIdentidad: this.data.registro.numeroDocumentoIdentidad,
      idTipoDocumento: null,
      numeroDocumento: null,
      adjuntarDocumento: null
    });

    this.setDatosPersona(this.data.registro);

    if (estadoComite === 'APROBADO') {
      this.divSustento = true;
      this.form.get('motivoModificacion').setValidators([Validators.required]);
      this.form.get('motivoModificacion').updateValueAndValidity();
      this.seccionSustentoModificacion();
      this.divBusquedaPersona = true;
    }

    this.getComboTiposDocumentoIdentidad();
    this.getComboNombresComite();

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

  btnBuscarPersona(event) {
    // event.preventDefault();
    let idTipoDocumentoIdentidad = this.form.value.idTipoDocumentoIdentidad;
    if (!idTipoDocumentoIdentidad) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_TIPO_DOCUMENTO_PERSONA, () => { });
      return;
    }

    let numeroDocumentoIdentidad = this.form.value.numeroDocumentoIdentidad;
    if (!numeroDocumentoIdentidad) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.INVALID_NRO_DOCUMENTO_PERSONA, () => { });
      return;
    }

    this.dataService.Spinner().show("sp6");
    this.dataService.GestionProcesos().buscarMiembroComite(idTipoDocumentoIdentidad, numeroDocumentoIdentidad).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
      finalize(() => { })
    ).subscribe((response: any) => {
      this.dataService.Spinner().hide("sp6");

      if (!response)
        return;

      this.mostrarDatos = true;

      if (response.miembros.length > 1)
        this.abrirVinculaciones(response);
      else
        this.setDatosPersona(response.miembros[0]);
    });
  }

  abrirVinculaciones(vinculaciones) {

    this.dialogRef = this.materialDialog.open(ModalVinculacionesComponent, {
      panelClass: 'modal-vinculaciones-dialog',
      disableClose: true,
      data: vinculaciones
    });

    this.dialogRef.afterClosed().subscribe((response: any) => {
      if (!response)
        return;
      this.setDatosPersona(response);
    });

  }

  setDatosPersona(miembro) {
    this.form.patchValue({
      idPersona: miembro.idPersona ?? 0,
      email: miembro.email,
      telefonoMovil: miembro.telefonoMovil,
      idCargo: miembro.idCargo
    });
    
    this.miembroComite = miembro;
  }

  removeValidations(flag: boolean) {
    if (flag) {
      this.form.get('idTipoDocumentoIdentidad').clearValidators();
      this.form.get('idTipoDocumentoIdentidad').updateValueAndValidity();

      this.form.get('numeroDocumentoIdentidad').clearValidators();
      this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();

      this.form.get('telefonoMovil').clearValidators();
      this.form.get('telefonoMovil').updateValueAndValidity();

      this.form.get('email').clearValidators();
      this.form.get('email').updateValueAndValidity();

      this.form.get('idNombreComite').clearValidators();
      this.form.get('idNombreComite').updateValueAndValidity();

      this.form.get('idCargoNombreComite').clearValidators();
      this.form.get('idCargoNombreComite').updateValueAndValidity();

      this.form.get('idTipoMiembroComite').clearValidators();
      this.form.get('idTipoMiembroComite').updateValueAndValidity();

      this.form.get('usuarioCreacion').clearValidators();
      this.form.get('usuarioCreacion').updateValueAndValidity();
    } else {
      this.form.get('idTipoDocumentoIdentidad').clearValidators();
      this.form.get('idTipoDocumentoIdentidad').updateValueAndValidity();

      this.form.get('numeroDocumentoIdentidad').clearValidators();
      this.form.get('numeroDocumentoIdentidad').updateValueAndValidity();
    }

  }

  getComboTiposDocumentoIdentidad() {
    this.dataService.GestionProcesos().getCatalogoItemXCodigoCatalogo(CodigoCatalogo.TipoDocumentoIdentidad)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
      ).subscribe(response => {

        this.combo.tiposDocumentoIdentidad = response;
        this.temp.tiposDocumentoIdentidad = response;
      });
  }

  getComboNombresComite() {
    let data = {
      idRegimenLaboral: this.data.cabeceraProceso.idRegimenLaboral,
      idTipoProceso: this.data.cabeceraProceso.idTipoProceso,
      idDescripcionMaestroProceso: this.data.cabeceraProceso.idDescripcionMaestroProceso,
      idNumeroConvocatoria: this.data.cabeceraProceso.idConvocatoria
    }
    this.dataService.GestionProcesos().getNombresComite(data)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
        }),
        finalize(() => { })
      ).subscribe((response: any) => {
        if (response) {
          this.combo.nombresComite = response;
          if (this.modal.action === 'create') {
            if (response.length < 2) 
              this.form.patchValue({ idNombreComite: response[0].idNombreComite });
          } else {
            if (!this.registroCargado) 
              this.form.patchValue({ idNombreComite: this.data.registro.idNombreComite });
          }
        }
        else {
          this.combo.nombresComite = [];
        }


      });
  }


  getComboTipoMiembroComite(idNombreComite: any) {
    this.dataService.GestionProcesos().getTiposMiembroComite(idNombreComite).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(response => {
      if (response) {
        this.combo.tipoMiembroComite = response;
        if (this.modal.action === 'create') {
          if (response.length < 2) 
            this.form.patchValue({ idTipoMiembroComite: response[0].idTipoMiembroComite });
        } else {
          if (!this.registroCargado) 
            this.form.patchValue({ idTipoMiembroComite: this.data.registro.idTipoMiembroComite });
        }
      } else {
        this.combo.tipoMiembroComite = [];
      }

    });
  }

  getComboCargoComite(idTipoMiembroComite: any) {
    this.dataService.GestionProcesos().getCargoComite(idTipoMiembroComite).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(response => {
      if (response) {
        this.combo.cargosComite = response;
        if (this.modal.action === 'create') {
          if (response.length < 2) 
            this.form.patchValue({ idCargoNombreComite: response[0].idCargoNombreComite });
        } else {
          if (!this.registroCargado) 
            this.form.patchValue({ idCargoNombreComite: this.data.registro.idCargoNombreComite });
        }
      } else {
        this.combo.cargosComite = [];
      }
    });
  }

  getComboRepresentanteCargoComite(idCargoComite: any) {
    this.dataService.GestionProcesos().getRepresentanteCargo(idCargoComite).pipe(
      catchError((error: HttpErrorResponse) => {
        this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
      }),
    ).subscribe(response => {
      if (response) {
        this.combo.representantesMiembroComite = response;
        if (this.modal.action === 'create') {
          if (response.length < 2) 
            this.form.patchValue({ idRepresentanteCargo: response[0].idRepresentanteCargo });
        } else {
          if (!this.registroCargado) {
            this.form.patchValue({ idRepresentanteCargo: this.data.registro.idRepresentanteCargo });
            this.registroCargado = true;
          }
        }
      } else {
        this.combo.representantesMiembroComite = [];
      }
    });
  }

  btnGuardar() {

    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }

    this.crearComite();
  }

  crearComite() {
    const form = this.form.value;

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M02, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;

      this.dataService.GestionProcesos().saveMiembroComite(form)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
          }),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        ).subscribe(response => {
          if (response) {
            if (response > 0)
              this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_GESTION.M07, this.tiempoMensaje, () => { this.handleCancelar({ reload: true }); });
            else
              this.dataService.Message().msgWarning('"NO SE PUDO REALIZAR EL REGISTRO"', () => { this.handleCancelar({ reload: true }); });
          }
        });
    });
  }

  btnModificar() {
    if (!this.form.valid) {
      this.dataService.Message().msgWarning(MESSAGE_GESTION.M08, () => { });
      return;
    }
    this.modificarComite();
  }

  handleAdjunto(file) {
    if (file === null)
      return;

    this.form.patchValue({ adjuntarDocumento: file[0] });
  }

  modificarComite() {

    let data = this.form.value;

    let documento = new FormData();
    documento.append('idComite', data.idComite);
    documento.append('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
    documento.append('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
    documento.append('idNombreComite', data.idNombreComite);
    documento.append('idCargoNombreComite', data.idCargoNombreComite);
    documento.append('idTipoMiembroComite', data.idTipoMiembroComite);
    documento.append('idRepresentanteCargo', data.idRepresentanteCargo);
    documento.append('telefonoMovil', data.telefonoMovil);
    documento.append('email', data.email);
    documento.append('noTieneImpedimento', data.noTieneImpedimento);
    documento.append('idProceso', data.idProceso);
    documento.append('idAlcanceProceso', data.idAlcanceProceso);
    documento.append('idPersona', data.idPersona);
    documento.append('idCargo', data.idCargo ?? "");
    documento.append('usuarioCreacion', data.usuarioCreacion);

    if (this.data.estadoComite == "APROBADO") {
      documento.append('sustento.motivoModificacion', data.motivoModificacion);
      documento.append('sustento.idTipoDocumento', data.idTipoDocumento ?? "");
      documento.append('sustento.numeroDocumento', data.numeroDocumento ?? "");
      documento.append('sustento.documento', data.adjuntarDocumento);
      documento.append('actualizacionAprobados', "true");
    }

    this.dataService.Message().msgConfirm(MESSAGE_GESTION.M03, () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService.GestionProcesos().updateMiembroComite(documento)
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

