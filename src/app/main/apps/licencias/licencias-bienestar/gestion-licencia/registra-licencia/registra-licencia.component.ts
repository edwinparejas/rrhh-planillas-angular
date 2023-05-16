import { Component, OnInit, Inject, ViewEncapsulation, ViewChild } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { of } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { catchError, finalize } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { LicenciaModel, LicenciaBienestarModel, ServidorPublicoModel, DetalleCertificadoModel, DocumentoSustentoModel } from '../../../models/licencia.model';
import { MotivoAccionEnum, GrupoAccionEnum, AccionEnum, TipoCertificadoEnum, EntidadAtencionEnum, OrigenRegistroDSEnum, GeneroEnum } from '../../../_utils/constants';
import * as moment from 'moment';
import { DocumentosSustentoComponent } from '../../../components/documentos-sustento/documentos-sustento.component';
import { GlobalsService } from 'app/core/shared/globals.service';
import { ResultadoOperacionEnum, TablaConfiguracionSistema, TipoOperacionEnum } from 'app/core/model/types';
import { saveAs } from 'file-saver';
import { SecurityModel } from 'app/core/model/security/security.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MESSAGE_LICENCIAS } from '../../../_utils/messages';

@Component({
    selector: 'minedu-registra-licencia',
    templateUrl: './registra-licencia.component.html',
    styleUrls: ['./registra-licencia.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistraLicenciaComponent implements OnInit {
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;

    form: FormGroup;
    working = false;
    dialogTitle: string;
    idOperacion: number;
    comboLists = {
        motivoAccion: [],
        tipoDescanso: [],
        entidadAtencion: [],
        tipoCertificado: [],
        listTiposSustento: [],
        listTiposTipoFormato: []
    };
    minFechaInicio = new Date(new Date().getFullYear(), 0, 1);
    maxFechaInicio = new Date(new Date().getFullYear()+ 1, 11, 31);
    minFechaFin = new Date(new Date().getFullYear(), 0, 1);
    maxFechaFin = new Date(new Date().getFullYear()+ 1, 11, 31);
    servidorPublico: ServidorPublicoModel;
    licencia: LicenciaModel = null;
    idLicencia: number;

    idGrupoAccion = GrupoAccionEnum.LICENCIAS;
    idAccion = AccionEnum.LICENCIA_CON_GOCE_DE_REMUNERACIONES;

    currentRow: any;
    descripcionGrupoAccion: string;
    descripcionAccion: string;

    grupoAccion: any;
    accion: any;
    descripcionTipoCertificado: string;
    archivoAdjunto: any;
    tipoOperacionModificar = TipoOperacionEnum.Modificar;
    archivoAdjuntoModificado = false;
    origenRegistro = OrigenRegistroDSEnum.REGISTRO_LICENCIA;
    currentSession: SecurityModel = new SecurityModel();

    campoRegla = {
        diasAcumuladosVisible: false,
        diasCargoEstadoVisible: false,
        diasCargoEsSaludVisible: false,
        fechaProbablePartoVisible: false,
    };

    icon = 'create';
    documentosSustento: DocumentoSustentoModel[] = [];
    grabado = false;
    validar = false;

    constructor(
        public matDialogRef: MatDialogRef<RegistraLicenciaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private globals: GlobalsService) {
            this.idOperacion = data.idOperacion;
            this.servidorPublico = data.servidorPublico;
            this.idLicencia = data.idLicencia;
            this.currentRow = data;
            this.currentSession = data.currentSession;        
    }

    ngOnInit(): void {
        this.working = true;
        this.buildForm();
        this.buildPassport();
        this.loadEntidadAtencion();
        this.loadTipoCertificado();
        this.loadTiposSustento();
        this.loadTiposFormato();
        this.descripcionTipoCertificado = '';
        if (this.idOperacion === TipoOperacionEnum.Modificar) {
            this.obtenerDatosLicencia(this.idLicencia);
        } else {
            this.licencia = new LicenciaModel();
            this.validar = true;
        }
        this.configurarDatoInicial();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idLicencia: 0,
            idPersona: [this.servidorPublico.idPersona],
            idServidorPublico: [this.servidorPublico.idServidorPublico],
            fechaInicio: [null, Validators.required],
            fechaFin: [null, Validators.required],
            idAccion: this.idAccion,
            idMotivoAccion: [null, Validators.required],
            idEstadoLicencia: 1,
            idCentroTrabajo: [null],
            idTipoDescanso: [null, Validators.required],
            diasAcumulados: [0],
            cantidadDias: [0],
            anotaciones: [null],
            diasCargoMinedu: [0],
            diasCargoEssalud: [0],
            idEntidadAtencion: [null, Validators.required],
            idTipoCertificado: [null, Validators.required],
            numeroCertificado: [null, Validators.required],
            nombreDoctor: [null, Validators.required],
            numeroCmp: [null, Validators.required],
            fechaEmision: [null, Validators.required],
            diagnostico: [null, Validators.required],
            generaProyecto: [false],
            generaAccionGrabada: [false],
            fechaProbableParto: [null],
            codigoDocumentoCertificado: [null]
        });

        this.form.get('cantidadDias').disable();
        // this.form.get('diasAcumulados').disable();
        this.form.get('diasCargoEssalud').disable();
        this.form.get('idCentroTrabajo').setValue(this.servidorPublico.idCentroTrabajo);

        this.form.get("fechaInicio").valueChanges.subscribe(fechaInicio => {
            if (!fechaInicio) return;
            this.minFechaFin = fechaInicio;

            const fechaFin = this.form.get('fechaFin').value;
            if (!fechaFin) return;
            if ( new Date(fechaInicio) > new Date(fechaFin) )
              this.form.patchValue({ fechaFin: null, cantidadDias: null });
        });
      
        this.form.get("fechaFin").valueChanges.subscribe(fechaFin => {      
            const fechaInicio = this.form.get('fechaInicio').value;
            if (!fechaFin || !fechaInicio) return;

            if ( new Date(fechaFin) < new Date(fechaInicio) )
                this.form.patchValue({ fechaInicio: null, cantidadDias: null });
        });
    }

    buildPassport = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    resetForm = () => {
        this.form.reset();
        this.form.patchValue({
            idAccion: this.idAccion,
            idEstadoLicencia: 1,
            diasAcumulados: 0,
            cantidadDias: 0,
            idTipoCertificado: 1,
            idPersona: this.servidorPublico.idPersona,
            idServidorPublico: this.servidorPublico.idServidorPublico,

        });
        this.documentosSustento = [];
        this.documentosSustentoComponent?.actualizarLista(this.documentosSustento);
        this.descripcionTipoCertificado = '';
    }

    loadTiposSustento = () => {
        this.dataService
            .Licencias()
            .getTiposSustento(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTiposSustento = data;
                }
            });
    }

    loadTiposFormato = () => {
        this.dataService
            .Licencias()
            .getTiposFormato(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listTiposTipoFormato = data;
                }
            });
    }

    configurarDatoInicial = () => {
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.icon = 'create';
            this.dialogTitle = 'Registrar nueva licencia por salud / maternidad';
        } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
            this.dialogTitle = 'Modificar licencia por salud / maternidad';
        }

        this.dataService.Licencias().getAccionGrupoById(this.idGrupoAccion.toString()).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                this.grupoAccion = response.data;
                this.idGrupoAccion = this.grupoAccion.idGrupoAccion;
                this.descripcionGrupoAccion = this.grupoAccion.descripcionGrupoAccion;
            }
        });

        const idRegimenLaboral = this.servidorPublico.idRegimenLaboral;
        this.dataService.Licencias().getAccion(this.idGrupoAccion, idRegimenLaboral, this.idOperacion === TipoOperacionEnum.Registrar ? true : null).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                if ((response.data || []).length === 0) {
                    this.dataService.Message().msgWarning('No se encuentra configurado acción de personal.', () => { });
                } else {
                    this.accion = response.data[0];
                    this.idAccion = this.accion.idAccion;
                    this.descripcionAccion = this.accion.descripcionAccion;
                    this.loadMotivoAccion(this.idAccion);
                }
            }
        });
    }

    loadMotivoAccion = (idAccion: number) => {
        const request = {
            codigoRolPassport: this.currentSession.codigoRol,
            idRegimenLaboral: this.servidorPublico.idRegimenLaboral,
            idGrupoAccion: this.idGrupoAccion,
            idAccion: idAccion,
            esSalud: true,
            activo: (this.idOperacion === TipoOperacionEnum.Registrar) ? true : null
        };

        this.dataService.Licencias().getComboMotivosAccion(request).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idMotivoAccion,
                    label: `${x.descripcionMotivoAccion}`
                }));
                this.comboLists.motivoAccion = data;
            }
        });
    }

    loadTipoDescansoByIdRegimenGrupoAccion = () => {
        const idMotivoAccion = this.form.getRawValue().idMotivoAccion;
        const idRegimenGrupoAccion = this.comboLists.motivoAccion.find(x => x.idMotivoAccion === idMotivoAccion)?.idRegimenGrupoAccion
        if (!idMotivoAccion || !idRegimenGrupoAccion) return;
        
        const activo = this.idOperacion === TipoOperacionEnum.Registrar ? true : null;
        this.dataService.Licencias().getComboTiposDescansoPorRegimenGrupoAccion(idRegimenGrupoAccion, activo).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.tipoDescanso = data;
            }
        });
    }

    loadTipoCertificado = () => {
        this.dataService.Licencias().getTiposCertificado(null).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`,
                    codigoCatalogoItem: x.codigoCatalogoItem
                }));
                this.comboLists.tipoCertificado = data;
            }
        });
    }

    getTipoCertificado = () => {

        const idEntidadAtencion = this.form.get('idEntidadAtencion').value;
        let codigoEntidadAtencion = 0;
        this.comboLists.entidadAtencion.forEach(element => {
            if (element.value === idEntidadAtencion) {
                codigoEntidadAtencion = element.codigoCatalogoItem;
            }
        });

        let codigoCatalogoItem = 0;
        if (codigoEntidadAtencion === EntidadAtencionEnum.ESSALUD) {
            codigoCatalogoItem = TipoCertificadoEnum.CERTIFICADO_DE_INCAPACIDAD_TEMPORAL_DE_TRABAJO;
        } else {
            codigoCatalogoItem = TipoCertificadoEnum.CERTIFICADO_MEDICO_PARTICULAR;
        }
        this.comboLists.tipoCertificado.forEach(element => {
            if (element.codigoCatalogoItem === codigoCatalogoItem) {
                this.form.get('idTipoCertificado').setValue(element.value);
                this.descripcionTipoCertificado = element.label;
            }
        });
    }

    loadEntidadAtencion = () => {
        this.dataService.Licencias().getComboEntidadesAtencion().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`,
                    codigoCatalogoItem: x.codigoCatalogoItem,
                }));
                this.comboLists.entidadAtencion = data;
                this.working = false;
            }
        });
    }

    prepararData = (row: any, idOperacion: number = TipoOperacionEnum.Registrar) => {
        const model: LicenciaModel = new LicenciaModel();
        model.idLicencia = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.idLicencia;
        model.idPersona = this.servidorPublico.idPersona;
        model.idServidorPublico = this.servidorPublico.idServidorPublico;
        model.idRegimenLaboral = this.servidorPublico.idRegimenLaboral;
        model.idGrupoAccion = this.idGrupoAccion;
        model.idAccion = this.idAccion;
        model.idMotivoAccion = row.idMotivoAccion;
        model.idEstadoLicencia = 1;
        model.idDocumentoSustento = null;
        model.idTipoResolucion = null;
        model.idCentroTrabajo = row.idCentroTrabajo;
        model.fechaInicio = moment(row.fechaInicio).format('DD/MM/YYYY');
        model.fechaFin = moment(row.fechaFin).format('DD/MM/YYYY');
        model.cantidadDias = row.cantidadDias;
        model.codigoResolucion = '';
        model.codigoAccionPersonalGrabada = 0;
        model.generaProyecto = false;
        model.generaAccionGrabada = false;
        model.anotaciones = row.anotaciones;

        const detalleCertificado: DetalleCertificadoModel = new DetalleCertificadoModel();
        detalleCertificado.idDetalleCertificado = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.detalleCertificado.idDetalleCertificado;
        detalleCertificado.idLicencia = 0;
        detalleCertificado.idEntidadAtencion = row.idEntidadAtencion;
        detalleCertificado.idTipoCertificado = row.idTipoCertificado;
        detalleCertificado.numeroCertificado = row.numeroCertificado;
        detalleCertificado.nombreDoctor = row.nombreDoctor;
        detalleCertificado.numeroCmp = row.numeroCmp;
        detalleCertificado.fechaEmision = moment(row.fechaEmision).format('DD/MM/YYYY');
        detalleCertificado.codigoDocumentoCertificado = row.codigoDocumentoCertificado;
        detalleCertificado.diagnostico = row.diagnostico;
        model.detalleCertificado = detalleCertificado;
        model.documentosSustento = this.documentosSustento;
        model.codigoMotivoAccion = 0;

        const bienestarSocial = new LicenciaBienestarModel();
        bienestarSocial.idLicenciaBienestarSocial = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.licenciaBienestarSocial.idLicenciaBienestarSocial;
        bienestarSocial.idLicencia = 0;
        bienestarSocial.idTipoDescanso = row.idTipoDescanso;
        bienestarSocial.diasCargoMinedu = +row.diasCargoMinedu;
        bienestarSocial.diasCargoEssalud = +row.diasCargoEssalud;
        bienestarSocial.diasAcumuladosAnual = +row.diasAcumulados;
        bienestarSocial.numeroCertificado = '';
        if (row.fechaProbableParto != null) {
            bienestarSocial.fechaProbableParto = moment(row.fechaProbableParto).format('DD/MM/YYYY')
        }
        model.licenciaBienestarSocial = bienestarSocial;
        model.usuarioRegistro = this.currentSession.numeroDocumento;
        model.nombreUsuarioRegistro = this.currentSession.nombreCompleto;
        model.codigoSedeRegistro = this.currentSession.codigoSede;
        model.codigoRolRegistro = this.currentSession.codigoRol;
        return model;
    }

    verificarDocumentoGuardar = () => {
        let datosDocumento = new FormData();
        if (typeof this.archivoAdjunto !== 'undefined') {
            datosDocumento.append('codigoSistema', TablaConfiguracionSistema.LICENCIA_CERTIFICADO.toString());
            datosDocumento.append('descripcionDocumento', this.form.get('codigoDocumentoCertificado').value);
            datosDocumento.append('codigoUsuarioCreacion', this.currentSession.numeroDocumento);
            datosDocumento.append('archivo', this.archivoAdjunto);
        } else {
            datosDocumento = null;
        }
        /*
        if (typeof this.archivoAdjunto === 'undefined') {
            this.dataService.Message().msgWarning('Debe adjuntar un documento de certificado.', () => { });
            return null;
        }
        */
        return datosDocumento;
    }

    handleSave = (form) => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Completar los datos requeridos.', () => { });
            return;
        }

        /*if (this.documentosSustento.length === 0) {
            // M45: “DEBE REGISTRAR COMO MINÍMO UN DOCUMENTO DE SUSTENTO”
            this.dataService.Message().msgWarning('Debe registrar como mínimo un documento de sustento.', () => { });
            return;
        }*/
        const licencia = this.prepararData(this.form.getRawValue());
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            const datosDocumento = this.verificarDocumentoGuardar();
            /*
            if (datosDocumento === null) {
                return;
            }
            */
            this.dataService.Message().msgConfirm('¿Esta seguro que desea guardar la información?', () => {
                this.dataService.Spinner().show("sp6");
                this.working = true;

                if (datosDocumento !== null) {
                    this.dataService.Documento().crear(datosDocumento).pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.working = false;
                            this.dataService.Spinner().hide("sp6");
                        })
                    ).subscribe(response => {
                        if (response && response.data.codigoDocumento) {
                            licencia.detalleCertificado.codigoDocumentoCertificado = response.data.codigoDocumento;
                            this.createLicencia(licencia);
                        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else {
                            this.dataService.Message()
                                .msgError('Ocurrieron algunos problemas al registrar el documento de certificado, por favor intente dentro de unos segundos, gracias.',
                                    () => { this.working = false; });
                        }
                    });
                } else {
                    this.createLicencia(licencia);
                }

            }, () => { });
        } else {
            if (this.archivoAdjuntoModificado === true) {
                const datosDocumento = this.verificarDocumentoGuardar();
                /*
                if (datosDocumento === null) {
                    return;
                }
                */
                // •	M03: ¿ESTÁ SEGURO DE QUE DESEA GUARDAR LOS CAMBIOS?

                this.dataService.Message().msgConfirm('¿Esta seguro de que desea guardar los cambios?', () => {
                    if (datosDocumento !== null) {
                        this.dataService.Spinner().show("sp6");
                        this.working = true;
                        this.dataService.Documento().crear(datosDocumento).pipe(
                            catchError((e) => of(e)),
                            finalize(() => {
                                this.working = false;
                                this.dataService.Spinner().hide("sp6");
                            })
                        ).subscribe(response => {
                            if (response && response.data.codigoDocumento) {
                                licencia.detalleCertificado.codigoDocumentoCertificado = response.data.codigoDocumento;
                                this.modificarLicencia(licencia);
                            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                                this.dataService.Message().msgWarning(response.messages[0], () => { });
                            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                                this.dataService.Message().msgWarning(response.messages[0], () => { });
                            } else {
                                this.dataService.Message()
                                    .msgError('Ocurrieron algunos problemas al registrar el documento de certificado, por favor intente dentro de unos segundos, gracias.',
                                        () => { this.working = false; });
                            }
                        });
                    } else {
                        this.modificarLicencia(licencia);
                    }
                }, () => { });

            } else {
                // •	M03: ¿ESTÁ SEGURO DE QUE DESEA GUARDAR LOS CAMBIOS?
                this.dataService.Message().msgConfirm('¿Esta seguro de que desea guardar los cambios?', () => {
                    this.dataService.Spinner().show("sp6");
                    this.working = true;
                    this.modificarLicencia(licencia);
                }, () => { });
            }
        }
    }

    descargarSustento = () => {
        const data = this.form.getRawValue();
        if (data.codigoDocumentoCertificado === null) {
            this.dataService.Message().msgWarning('La licencia no tiene certificado adjunto.', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(data.codigoDocumentoCertificado)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                    saveAs(response, "certificado.pdf");
                } else {
                    this.dataService.Message().msgWarning('No se pudo descargar el certificado adjunto', () => { });
                }
            });
    }

    createLicencia = (licencia: any) => {
        this.dataService.Licencias().crearLicencia(licencia).pipe(
            catchError((error: HttpErrorResponse) => {
            this.dataService.Message().msgWarning(error.error.messages[0]); return of(null);
            }),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.working = false;
            })
        ).subscribe(response => {
            if (response && response > 0) {
                this.resetForm();
                this.grabado = true;
                this.dataService.Message().msgAutoCloseSuccessNoButton(MESSAGE_LICENCIAS.M07, 3000, this.handleCancel() );
            }
        });
    }

    modificarLicencia = (licencia: any) => {
        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Licencias().modificarLicencia(licencia).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.working = false;
            })
        ).subscribe(response => {
            if (response && response.result) {
                // M07: “OPERACIÓN REALIZADA DE FORMA EXITOSA”.
                this.grabado = true;
                this.dataService.Message().msgInfo(resultMessage, () => { });
                this.matDialogRef.close({ grabado: true });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
            }
        });
    }

    handleCancel = () => {
        this.matDialogRef.close({ grabado: this.grabado });
    }

    configurarCampos = () => {
        const idMotivoAccion = this.form.get('idMotivoAccion').value;
        if (idMotivoAccion === null) return;

        let codigoMotivoAccion = 0;
        if (this.licencia.codigoMotivoAccion != null) {
            codigoMotivoAccion = this.licencia.codigoMotivoAccion;
        } else {
            codigoMotivoAccion = this.comboLists.motivoAccion.find(x => x.value === idMotivoAccion).codigoMotivoAccion;
        }

        this.campoRegla.fechaProbablePartoVisible = false;
        this.form.get('diasAcumulados').clearValidators();
        this.form.get('diasCargoMinedu').clearValidators();
        this.form.get('diasCargoEssalud').clearValidators();
        this.form.get('fechaProbableParto').clearValidators();

        switch (codigoMotivoAccion) {
            case MotivoAccionEnum.POR_MATERNIDAD:
                this.form.get('fechaProbableParto').setValidators(Validators.required);
                this.campoRegla.fechaProbablePartoVisible = true;
                this.form.updateValueAndValidity();
                break;
            case MotivoAccionEnum.EXTENSION_LICENCIA_POR_MATERNIDAD:
                this.form.updateValueAndValidity();
                break;
            default:
                break;
        }

        if (this.validar === true) {
            this.form.get('diasAcumulados').setValue(null);
            this.form.get('diasCargoMinedu').setValue(null);
            this.form.get('diasCargoEssalud').setValue(null);
            this.form.get('fechaProbableParto').setValue(null);
        }

        this.loadTipoDescansoByIdRegimenGrupoAccion();
        this.habilitarDiasAcumuladas(codigoMotivoAccion);
        this.validarMotivoAccion(codigoMotivoAccion);

        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.form.get('fechaFin').setValue(null);
        }
    }

    validarMotivoAccion = (codigoMotivoAccion: number) => {
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            if (codigoMotivoAccion === MotivoAccionEnum.POR_MATERNIDAD || codigoMotivoAccion === MotivoAccionEnum.EXTENSION_LICENCIA_POR_MATERNIDAD) {
                if (this.servidorPublico.codigoGenero === GeneroEnum.MASCULINO) {
                    const message = 'No se puede registrar la licencia, eligir otro servidor público.';
                    this.dataService.Message().msgWarning(message, () => { });
                    this.form.get('idMotivoAccion').setValue(null);
                }
            }
        }
    }

    habilitarDiasAcumuladas = (codigoMotivoAccion: number) => {
        /*
        let codigoMotivoAccion = 0;
        if (this.licencia.codigoMotivoAccion != null) {
            codigoMotivoAccion = this.licencia.codigoMotivoAccion;
        } else {
            const idMotivoAccion = this.form.get('idMotivoAccion').value;
            codigoMotivoAccion = this.comboLists.motivoAccion.find(x => x.value === idMotivoAccion).codigoMotivoAccion;
        }
        */

        this.campoRegla.diasAcumuladosVisible = false;
        this.campoRegla.diasCargoEstadoVisible = false;
        this.campoRegla.diasCargoEsSaludVisible = false;


        if (codigoMotivoAccion === MotivoAccionEnum.POR_INCAPACIDAD_TEMPORAL ||
            codigoMotivoAccion === MotivoAccionEnum.POR_INCAPACIDAD_TERMPORAL_PARA_EL_TRABAJO ||
            codigoMotivoAccion === MotivoAccionEnum.POR_ENFERMEDAD ||
            codigoMotivoAccion === MotivoAccionEnum.POR_ENFERMEDAD_O_ACCIDENTE_O_INCAPACIDAD_TEMPORAL) {
            this.form.get('diasAcumulados').setValidators(Validators.required);
            this.form.get('diasCargoMinedu').setValidators(Validators.required);
            // this.form.get('diasCargoEssalud').setValidators(Validators.required);
            this.campoRegla.diasAcumuladosVisible = true;
            this.campoRegla.diasCargoEstadoVisible = true;
            this.campoRegla.diasCargoEsSaludVisible = true;
            this.form.updateValueAndValidity();
            this.getDiasAcumuladas();
        }
    }

    obtenerDatosLicencia = (idLicencia: number) => {
        this.dataService
            .Licencias()
            .getLicencia(idLicencia)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.mapearDatosLicencia(response.data);
                }
            });
    }

    mapearDatosLicencia = (row) => {
        this.licencia = row;
        const fechaInicio = moment(row.fechaInicio, 'DD/MM/YYYY');
        const newfechaInicio = fechaInicio.format('YYYY-MM-DDTHH:mm:ss');
        const fechaFin = moment(row.fechaFin, 'DD/MM/YYYY');
        const newfechaFin = fechaFin.format('YYYY-MM-DDTHH:mm:ss');

        this.form.get('idLicencia').setValue(row.idLicencia);
        this.form.get('idPersona').setValue(row.idPersona);
        this.form.get('idServidorPublico').setValue(row.idServidorPublico);
        this.form.get('fechaInicio').setValue(newfechaInicio);
        this.form.get('fechaFin').setValue(newfechaFin);
        this.form.get('idAccion').setValue(row.idAccion);
        this.form.get('idMotivoAccion').setValue(row.idMotivoAccion);
        this.form.get('idEstadoLicencia').setValue(row.idEstadoLicencia);
        this.form.get('idTipoDescanso').setValue(row.licenciaBienestarSocial?.idTipoDescanso);
        this.form.get('diasAcumulados').setValue(row.licenciaBienestarSocial?.diasAcumuladosAnual);
        this.form.get('cantidadDias').setValue(row.cantidadDias);
        this.form.get('anotaciones').setValue(row.anotaciones);
        this.form.get('diasCargoMinedu').setValue(row.licenciaBienestarSocial?.diasCargoMinedu);
        this.form.get('diasCargoEssalud').setValue(row.licenciaBienestarSocial?.diasCargoEssalud);
        this.form.get('idEntidadAtencion').setValue(row.detalleCertificado.idEntidadAtencion);
        this.form.get('idTipoCertificado').setValue(row.detalleCertificado.idTipoCertificado);
        this.form.get('numeroCertificado').setValue(row.detalleCertificado.numeroCertificado);
        this.form.get('nombreDoctor').setValue(row.detalleCertificado.nombreDoctor);
        this.form.get('numeroCmp').setValue(row.detalleCertificado.numeroCmp);
        this.form.get('fechaEmision').setValue(row.detalleCertificado.fechaEmision);
        this.form.get('diagnostico').setValue(row.detalleCertificado.diagnostico);
        this.form.get('fechaProbableParto').setValue(moment(row.licenciaBienestarSocial.fechaProbableParto, 'DD/MM/YYYY'));
        this.form.get('idCentroTrabajo').setValue(this.licencia.idCentroTrabajo);
        this.form.get('codigoDocumentoCertificado').setValue(this.licencia.detalleCertificado.codigoDocumentoCertificado);

        /*
        if (this.licencia.detalleCertificado.codigoDocumentoCertificado != null) {
            this.recuperarDocumentoCertificado(this.licencia.detalleCertificado.codigoDocumentoCertificado);
        }
        */

        this.documentosSustento = row.documentosSustento;
        this.configurarCampos();
        this.form.get('idMotivoAccion').disable();

        if (this.documentosSustentoComponent != null) {
            this.documentosSustentoComponent.actualizarLista(this.documentosSustento);
        }

        this.comboLists.tipoCertificado.forEach(element => {
            if (element.value === this.form.get('idTipoCertificado').value) {
                this.descripcionTipoCertificado = element.label;
            }
        });
        this.validar = true;
    }

    calcularCantidadDias = () => {
        const fechaInicio = this.form.get('fechaInicio').value;
        const fechaFin = this.form.get('fechaFin').value;
        if(!fechaInicio || !fechaFin) return;
        if (this.validar == true) {
            const fechaInicio = moment(this.form.get('fechaInicio').value);
            const fechaFin = moment(this.form.get('fechaFin').value);
            const cantidadDias = fechaFin.diff(fechaInicio, 'days') + 1;
            this.form.get('cantidadDias').setValue(cantidadDias);
            this.calcularDiasSector();
            this.validarFechas();
        }
    }

    getDiasAcumuladas = () => {
        if (this.validar == true) {
            const request = {
                idLicencia: this.form.get('idLicencia').value,
                idServidorPublico: this.servidorPublico.idServidorPublico,
                idGrupoAccion: this.idGrupoAccion,
                idAccion: this.idAccion,
                idMotivoAccion: this.form.get('idMotivoAccion').value,
            };

            this.dataService.Licencias().getLicenciaResumen(request).pipe(
                catchError(() => of([])),
                finalize(() => { })
            ).subscribe((diasAcumulados: any) => {
                if (diasAcumulados || diasAcumulados >= 0) {
                    this.form.get('diasAcumulados').setValue(diasAcumulados);
                    this.calcularDiasSector();
                }
            });
        }
    }

    calcularDiasSector = () => {
        const diasAcumuladas = this.form.getRawValue().diasAcumulados;
        let cantidadDias = this.form.getRawValue().cantidadDias;

        let cargoMinedu = 0;
        let cargoEssalud = 0;
        const MAXIMO_DIAS_A_CARGO_SECTOR = 20;
        const MAXIMO_DIAS_A_CARGO_ESSALUD = 340;

        if (cantidadDias === null) {
            cantidadDias = 0;
        }
        /*
        if (diasAcumuladas + cantidadDias <= 20) {
            cargoEstado = cantidadDias;
        } else if (diasAcumuladas >= 20) {
            cargoEstado = 0;
        } else {
            cargoEstado = diasAcumuladas - cantidadDias;
        }
        if (cargoEstado < 0) {
            cargoEstado = 0;
        }
        cargoEssalud = cantidadDias - cargoEstado;
        if (cargoEssalud < 0) {
            cargoEssalud = 0;
        }*/

        if (cantidadDias <= (MAXIMO_DIAS_A_CARGO_SECTOR - diasAcumuladas)) {
            cargoMinedu = cantidadDias;
            cargoEssalud = 0;
        } else if (cantidadDias >= MAXIMO_DIAS_A_CARGO_SECTOR - diasAcumuladas) {
            if (diasAcumuladas <= MAXIMO_DIAS_A_CARGO_SECTOR) {
                cargoMinedu = MAXIMO_DIAS_A_CARGO_SECTOR - diasAcumuladas;
                cargoEssalud = cantidadDias - cargoMinedu;
            } else if (diasAcumuladas >= MAXIMO_DIAS_A_CARGO_SECTOR && cantidadDias <= MAXIMO_DIAS_A_CARGO_ESSALUD) {
                cargoMinedu = 0;
                cargoEssalud = cantidadDias;
            }
        }
        this.form.get('diasCargoMinedu').setValue(cargoMinedu);
        this.form.get('diasCargoEssalud').setValue(cargoEssalud);
    }

    adjunto = (pIdDocumento) => {
        this.form.patchValue({ codigoDocumentoCertificado: pIdDocumento });
    }

    uploadFile = (files) => {
        const inputNode: any = document.querySelector('#file');

        if (typeof (FileReader) !== 'undefined') {
            if (files[0].size >= this.globals.PESO_ARCHIVO_ADJUNTO_2MB) {
                this.dataService.Message().msgWarning(`El archivo adjunta supera el limite permitido de ${this.globals.PESO_2MB}.`, () => { });

            } else {
                this.form.controls['codigoDocumentoCertificado'].setValue(files[0].name);
                this.archivoAdjunto = files[0];
                this.archivoAdjuntoModificado = true;
            }
        }
    }

    recuperarDocumentoCertificado = (codigoDocumento) => {
        this.dataService.Documento().getDocumentoFormato(codigoDocumento).subscribe(
            data => {

            },
            error => {
                this.dataService.Message().msgWarning('No se encontro el formato', () => { });
            }
        );
    }

    validarFechas = () => {
        if (this.validar == true) {
            const row = this.form.getRawValue();
            const idGrupoAccion = GrupoAccionEnum.LICENCIAS;
            const idAccion = row.idAccion;
            const idMotivoAccion = row.idMotivoAccion;
            const fechaInicio = row.fechaInicio;
            const fechaFin = row.fechaFin;
            const idTipoDescanso = row.idTipoDescanso;
            const idRegimenLaboral = this.servidorPublico.idRegimenLaboral;

            if (idMotivoAccion === null || fechaInicio === null || fechaFin === null || idTipoDescanso == null) {
                return;
            }

            const data = {
                idServidorPublico: row.idServidorPublico,
                idLicencia: row.idLicencia,
                idGrupoAccion: idGrupoAccion,
                idAccion: idAccion,
                idMotivoAccion: idMotivoAccion,
                fechaInicio: fechaInicio,
                fechaFin: fechaFin,
                idTipoDescanso: idTipoDescanso,
                idRegimenLaboral: idRegimenLaboral
            };

            this.dataService.Spinner().show("sp6");
            this.dataService.Licencias().validarFechas(data).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                    this.working = false;
                })
            ).subscribe(response => {
                if (response && response.result) {
                    if (response.data.success === false) {
                        this.dataService.Message().msgWarning(response.data.mensaje);
                        this.form.get('fechaFin').setValue(null);
                    }
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
                }
            });

        }

    }

}
