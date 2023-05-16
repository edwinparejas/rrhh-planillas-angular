import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, AfterViewInit, ɵConsole, ViewChild } from '@angular/core';
import { DocumentosSustentoComponent } from '../../../components/documentos-sustento/documentos-sustento.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { Subscription, BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { mineduAnimations } from '@minedu/animations/animations';
import * as moment from 'moment';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { GrupoAccionEnum, MotivoAccionEnum, OrigenRegistroDSEnum, RegimenLaboralEnum, GeneroEnum, TipoDocumentoIdentidadEnum } from '../../../_utils/constants';
import { DocumentoSustentoModel, FamiliarServidorPublico, LicenciaAdopcionModel, LicenciaFallecimientoModel, LicenciaModel, LicenciaPaternidadModel, OtraLicenciaModel, ServidorPublicoModel } from '../../../models/licencia.model';
import { BuscarFamiliarServidorComponent } from '../../../components/buscar-familiar-servidor/buscar-familiar-servidor.component';
import Swal from 'sweetalert2';
import { ResultadoOperacionEnum, TipoOperacionEnum } from 'app/core/model/types';
import { SecurityModel } from 'app/core/model/security/security.model';
import { GlobalsService } from '../../../../../../core/shared/globals.service';
import { TablaConfiguracionSistema } from '../../../../../../core/model/types';

@Component({
    selector: 'minedu-registra-licencia-otra',
    templateUrl: './registra-licencia-otra.component.html',
    styleUrls: ['./registra-licencia-otra.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistraLicenciaOtraComponent implements OnInit {
    private _unsubscribeAll: Subject<any>;
    private sharedSubscription: Subscription;
    @ViewChild(DocumentosSustentoComponent)
    private documentosSustentoComponent: DocumentosSustentoComponent;
    maxLengthnumeroDocumentoIdentidad: number;
    form: FormGroup;
    working = false;
    dialogTitle: string;
    idOperacion: number;
    comboLists = {
        comboAccion: [],
        motivoAccion: [],
        tipoDescanso: [],
        entidadAtencion: [],
        tipoCertificado: [],
        tipoResolucion: [],
        tipoDocumento: [],
        tipoParto: [],
        lugarDeceso: [],
        tipoDiagnostico: [],
        listTiposSustento: [],
        listTiposTipoFormato: []
    };
    maxDate = new Date();
    minDate = new Date();
    servidorPublico: ServidorPublicoModel;
    licencia: LicenciaModel = null;
    idLicencia: number;
    campos: MotivoAccionCampoConfig[] = [];
    panelDatosFamiliarVisible = false;
    panelFamiliarTitle = 'Datos de hijo';
    datosHijoVisible = false;

    idGrupoAccion = GrupoAccionEnum.LICENCIAS;
    idAccion: number;
    currentRow: any;
    descripcionGrupoAccion: string;
    descripcionAccion: string;
    origenRegistro = OrigenRegistroDSEnum.REGISTRO_LICENCIA;
    grupoAccion: any;
    accion: any;

    dialogRef: any;
    currentSession: SecurityModel = new SecurityModel();
    archivoAdjunto: any;
    archivoAdjuntoModificado = false;

    campoRegla = {
        diasAcumuladosVisible: false,
        diasCargoEstadoVisible: false,
        diasCargoEsSaludVisible: false,
        fechaProbablePartoVisible: false,
        codigoResolucionVisible: false,
        codigoDocumentoResolucionVisible: false,
        idTipoResolucionVisible: true,
        accionGrabaVisible: true
    };

    campoLabel = {
        CantidadDiasLabel: 'Cantidad días'
    };

    icon = 'create';
    documentosSustento: DocumentoSustentoModel[] = [];
    grabado = false;
    familiar = new FamiliarServidorPublico();
    edadPermitidoAdopcion = 12;

    constructor(
        public matDialogRef: MatDialogRef<RegistraLicenciaOtraComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        private globals: GlobalsService,
        private materialDialog: MatDialog) {
        this._unsubscribeAll = new Subject();
        this.idOperacion = data.idOperacion;
        this.servidorPublico = data.servidorPublico;
        this.idLicencia = data.idLicencia;
        this.currentRow = data;
        this.currentSession = data.currentSession;
        this.idAccion = data.idAccion;

        this.loadAccion();
        this.loadTipoDescanso();
        this.loadEntidadAtencion();
        this.loadTipoResolucion();
        this.loadTipoParto();
        this.loadLugarDesceso();
        this.loadTiposDocumento();
        this.loadTipoDiagnostico();
        this.loadTiposSustento();
        this.loadTiposFormato();
    }

    ngOnInit(): void {
        this.working = true;
        this.buildForm();
        this.setConfiguracionCampos();
        this.configurarDatoInicial();
        if (this.idOperacion === TipoOperacionEnum.Modificar) {
            this.obtenerDatosLicencia(this.idLicencia);
        } else {
            this.licencia = new LicenciaModel();
            this.working = false;
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
            idAccion: [this.idAccion, Validators.required],
            idMotivoAccion: [null, Validators.required],
            idEstadoLicencia: [1],
            idTipoDescanso: [null],
            diasAcumulados: [0],
            cantidadDias: [0],
            anotaciones: [null],
            diasCargoMinedu: [0],
            diasCargoEssalud: [0],
            idEntidadAtencion: [null],
            idTipoCertificado: [null],
            numeroCertificado: [null],
            nombreDoctor: [null],
            numeroCmp: [null],
            fechaEmision: [null],
            diagnostico: [null],
            generaProyecto: [false],
            generaAccionGrabada: [false],
            fechaProbableParto: [null],
            idTipoResolucion: [null, Validators.required],
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            idLicenciaPaternidad: [null],
            idTipoParto: [null],
            idLicenciaAdopcion: [0],
            idFamiliarServidorPublico: [0],
            idLicenciaFallecimiento: [0],
            idLugarDeceso: [null],
            idTipoDiagnostico: [null],
            idCentroTrabajo: [null],
            codigoResolucion: [null],
            codigoDocumentoResolucion: [null, [Validators.maxLength(100)]]
        });

        this.form.get('cantidadDias').disable();
        if (this.idOperacion !== TipoOperacionEnum.Registrar) {
            this.form.get('idAccion').disable();
            this.form.get('idMotivoAccion').disable();
        }
        this.form.get('idCentroTrabajo').setValue(this.servidorPublico.idCentroTrabajo);
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
        this.form.get('diasAcumulados').setValue(row.diasAcumulados);
        this.form.get('cantidadDias').setValue(row.cantidadDias);
        this.form.get('anotaciones').setValue(row.anotaciones);
        this.form.get('idTipoResolucion').setValue(row.idTipoResolucion);
        this.form.get('codigoResolucion').setValue(row.codigoResolucion);
        this.form.get('idCentroTrabajo').setValue(row.idCentroTrabajo);
        this.form.get('codigoDocumentoResolucion').setValue(this.licencia.codigoDocumentoResolucion);
        this.documentosSustento = row.documentosSustento;

        this.documentosSustentoComponent.actualizarLista(this.documentosSustento);
        if (row.idMotivoAccion === MotivoAccionEnum.POR_ADOPCION) {
            const licenciaAdopcion = new LicenciaAdopcionModel();
            this.form.get('idFamiliarServidorPublico').setValue(row.licenciaAdopcion?.idFamiliarServidorPublico);
            this.form.get('numeroDocumentoIdentidad').setValue(row.licenciaAdopcion?.numeroDocumentoIdentidad);
            this.form.get('idTipoDocumentoIdentidad').setValue(row.licenciaAdopcion?.idTipoDocumentoIdentidad);
            this.familiar = row.licenciaAdopcion;
        }
        if (row.idMotivoAccion === MotivoAccionEnum.POR_PATERNIDAD) {
            this.form.get('idTipoParto').setValue(row.licenciaPaternidad?.idTipoParto);
            this.form.get('idLicenciaPaternidad').setValue(row.licenciaPaternidad?.idLicenciaPaternidad);
            this.familiar = row.licenciaPaternidad;
        }
        if (row.idMotivoAccion === MotivoAccionEnum.POR_FALLECIMIENTO_DE_PADRES_CONYUGE_E_HIJOS) {
            this.form.get('idLugarDeceso').setValue(row.licenciaFallecimiento?.idLugarDeceso);
            this.form.get('idFamiliarServidorPublico').setValue(row.licenciaFallecimiento?.idFamiliarServidorPublico);
            this.familiar = row.licenciaFallecimiento;
        }
        if (row.idMotivoAccion === MotivoAccionEnum.POR_ENFERMEDAD_GRAVE_TERMINAL_O_POR_ACCIDENTE_GRAVE) {
            this.form.get('idTipoDiagnostico').setValue(row.otraLicencia?.idTipoDiagnostico);
            this.form.get('idFamiliarServidorPublico').setValue(row.otraLicencia?.idFamiliarServidorPublico);
            this.form.get('numeroDocumentoIdentidad').setValue(row.otraLicencia?.numeroDocumentoIdentidad);
            this.form.get('idTipoDocumentoIdentidad').setValue(row.otraLicencia?.idTipoDocumentoIdentidad);
            this.familiar = row.otraLicencia;
        }
        this.working = false;
        // this.configurarCampos();
    }

    configurarDatoInicial = () => {
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.icon = 'create';
            this.dialogTitle = 'Registrar nueva licencia';
        } else if (this.idOperacion === TipoOperacionEnum.Modificar) {
            this.dialogTitle = 'Modificar licencia';
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
    }

    handleCancel = () => {
        this.matDialogRef.close({ grabado: this.grabado });
    }

    calcularCantidadDias = () => {
        const fechaInicio = moment(this.form.get('fechaInicio').value);
        const fechaFin = moment(this.form.get('fechaFin').value);
        let cantidadDias = fechaFin.diff(fechaInicio, 'days') + 1;
        const idMotivoAccion: number = this.form.get('idMotivoAccion').value;

        if (cantidadDias != undefined && idMotivoAccion != null) {
            const codigoMotivoAccion = this.getCodigoMotivoAccion(idMotivoAccion);
            if (codigoMotivoAccion === MotivoAccionEnum.POR_DESEMPENO_DE_CARGO_DE_CONSEJERO_REGIONAL_O_REGIDOR_MUNICIPAL) {
                let cantidadNueva = (cantidadDias / 30) * 4;
                cantidadDias = Math.trunc(cantidadNueva);
            }
        }
        this.form.get('cantidadDias').setValue(cantidadDias);
        /*
        if (idMotivacion === MotivoAccionEnum.POR_MATERNIDAD) {
            if (cantidadDias >= 30) {
                this.dataService.Message().msgWarning('Cantidad de días no debe superar a 30 días');
                this.form.get('fechaFin').setValue('');
            }
        }
        */

        this.validarFechas();
    }

    loadAccion = () => {
        this.dataService
            .Licencias()
            .getAccion()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((resp: any) => {
                if (resp && resp.result) {
                    const data = resp.data.map((x) => ({
                        ...x,
                        value: x.idAccion,
                        label: `${x.descripcionAccion}`,
                    }));
                    this.comboLists.comboAccion = data;
                    data.forEach(element => {
                        if (element.codigoAccion === this.idAccion) {
                            this.descripcionAccion = element.descripcionAccion;
                        }
                    });
                    this.loadMotivoAccion();
                }
            });
    }

    loadMotivoAccion = () => {
        const idAccion = this.form.get('idAccion').value;
        const data = {
            idAccion,
            idGrupoAccion: this.idGrupoAccion,
            idRegimenLaboral: this.servidorPublico.idRegimenLaboral,
            codigoRolPassport: this.currentSession.codigoRol,
            activo: null
        };

        this.dataService
            .Licencias()
            .getComboMotivosAccion(data)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((resp: any) => {
                if (resp && resp.result) {
                    const data = resp.data.map((x) => ({
                        ...x,
                        value: x.idMotivoAccion,
                        label: `${x.descripcionMotivoAccion}`,
                    }));
                    this.comboLists.motivoAccion = data;
                }
            });
    }

    loadTipoDescanso = () => {
        this.dataService.Licencias().getComboTiposDescanso().pipe(
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

    loadTipoParto = () => {
        this.dataService.Licencias().getComboTiposParto().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {

            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.tipoParto = data;
            }
        });
    }

    loadLugarDesceso = () => {
        this.dataService.Licencias().getComboLugarDesceso().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.lugarDeceso = data;
            }
        });
    }

    loadTiposDocumento = () => {
        this.dataService.Licencias().getComboTiposDocumento().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.tipoDocumento = data;
            }
        });
    }

    loadTipoDiagnostico = () => {
        this.dataService.Licencias().getComboTiposdiagnostico().pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                const data = response.data.map(x => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`
                }));
                this.comboLists.tipoDiagnostico = data;
            }
        });
    }

    getTipoCertificado = () => {
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

    loadTipoResolucion = () => {
        this.dataService.Licencias().getTiposResolucion().pipe(
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
                this.comboLists.tipoResolucion = data;
                this.working = false;
            }
        });
    }

    // TODO: No se utiliza
    getDiasAcumuladas = () => {
        const request = {
            anio: new Date().getFullYear(),
            idServidorPublico: this.servidorPublico.idServidorPublico,
            idGrupoAccion: this.idGrupoAccion,
            idAccion: this.idAccion,
            idMotivoAccion: this.form.get('idMotivoAccion').value,
        };

        this.dataService.Licencias().getLicenciaResumen(request).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response && response.result) {
                this.form.get('diasAcumulados').setValue(response.data?.diasAcumuladas);
            }
        });
    }

    verificarDocumentoGuardar = () => {
        const datosDocumento = new FormData();
        datosDocumento.append('codigoSistema', TablaConfiguracionSistema.LICENCIA_CERTIFICADO.toString());
        datosDocumento.append('descripcionDocumento', this.form.get('codigoDocumentoResolucion').value);
        datosDocumento.append('codigoUsuarioCreacion', 'Admin');
        datosDocumento.append('archivo', this.archivoAdjunto);

        if (typeof this.archivoAdjunto === 'undefined') {
            this.dataService.Message().msgWarning('Debe adjuntar resolución.', () => { });
            return null;
        }
        return datosDocumento;
    }

    handleSave = (accion: any) => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe ingresar datos obligatorios.', () => { });
            return;
        }

        if (this.documentosSustento.length === 0) {
            // M45: “DEBE REGISTRAR COMO MINÍMO UN DOCUMENTO DE SUSTENTO”
            this.dataService.Message().msgWarning('Debe registrar como mínimo un documento de sustento.', () => { });
            return;
        }

        const generaProyecto: boolean = accion == 'proyecto';
        const accionGrabada: boolean = accion == 'acciongrabada';

        let mensajeConfirmacion = '¿Esta seguro de que desea guardar la información?';
        if (generaProyecto === true) mensajeConfirmacion = '¿Esta seguro de que desea generar Proyecto de resolución?';
        if (accionGrabada === true) mensajeConfirmacion = '¿Esta seguro de que desea guardar la acción?';

        if (accion === 'save') {
            if (this.idOperacion === TipoOperacionEnum.Registrar) {
                mensajeConfirmacion = '¿Esta seguro de que desea guardar la información?';
            } else {
                mensajeConfirmacion = '¿Esta seguro de que desea guardar los cambios?';
            }
        }

        const licencia = this.prepararData(this.form.getRawValue());
        licencia.generaProyecto = generaProyecto;
        licencia.generaAccionGrabada = accionGrabada;

        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            let datosDocumento: any = null;
            if (licencia.codigoResolucion != null) {
                datosDocumento = this.verificarDocumentoGuardar();
                if (datosDocumento === null) {
                    return;
                }
            }

            this.dataService.Message().msgConfirm(mensajeConfirmacion, () => {
                this.working = true;
                this.dataService.Spinner().show("sp6");
                if (datosDocumento != null) {
                    this.dataService.Documento().crear(datosDocumento).pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.working = false;
                            this.dataService.Spinner().hide("sp6");
                        })
                    ).subscribe(response => {
                        if (response && response.data.codigoDocumento) {
                            licencia.codigoDocumentoResolucion = response.data.codigoDocumento;
                            this.createLicencia(licencia);
                        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else {
                            this.dataService.Message()
                                .msgError('Ocurrieron algunos problemas al registrar el documento de certificado, por favor intente dentro de unos segundos, gracias.',
                                    () => {
                                        this.working = false;
                                        this.dataService.Spinner().hide("sp6");
                                    });
                        }
                    });
                } else {
                    this.createLicencia(licencia);
                }
            }, (error) => { });
        } else {
            // •	M03: ¿ESTÁ SEGURO DE QUE DESEA GUARDAR LOS CAMBIOS?
            this.dataService.Message().msgConfirm(mensajeConfirmacion, () => {
                this.working = true;
                this.dataService.Spinner().show("sp6")
                let datosDocumento: any = null;
                if (licencia.codigoResolucion != null) {
                    datosDocumento = this.verificarDocumentoGuardar();
                    if (datosDocumento === null) {
                        return;
                    }
                    if (this.archivoAdjuntoModificado === true) {
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
                                licencia.codigoDocumentoResolucion = response.data.codigoDocumento;
                                this.modificarLicencia(licencia);
                            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                                this.dataService.Message().msgWarning(response.messages[0], () => { });
                            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                                this.dataService.Message().msgWarning(response.messages[0], () => { });
                            } else {
                                this.dataService.Message()
                                    .msgError('Ocurrieron algunos problemas al registrar el documento de certificado, por favor intente dentro de unos segundos, gracias.',
                                        () => {
                                            this.working = false;
                                            this.dataService.Spinner().hide("sp6");
                                        });
                            }
                        });
                    } else {
                        this.modificarLicencia(licencia);
                    }
                } else {
                    this.modificarLicencia(licencia);
                }
            }, () => { });
        }

    }

    createLicencia = (licencia: any) => {
        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Licencias().crearLicencia(licencia).pipe(
            catchError((e) => of(e)),
            finalize(() => {
                this.dataService.Spinner().hide("sp6");
                this.working = false;
            })
        ).subscribe(response => {
            if (response && response.result) {
                // M07: “OPERACIÓN REALIZADA DE FORMA EXITOSA”.
                this.resetForm();
                this.grabado = true;
                this.dataService.Message().msgInfo(resultMessage, () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                this.dataService.Message().msgWarning(response.messages[0], () => { });
            } else {
                this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
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

    prepararData = (row: any, idOperacion: number = TipoOperacionEnum.Registrar) => {
        const model: LicenciaModel = new LicenciaModel();
        model.idLicencia = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.idLicencia;
        model.idPersona = this.servidorPublico.idPersona;
        model.idServidorPublico = this.servidorPublico.idServidorPublico;
        model.idGrupoAccion = this.idGrupoAccion;
        model.idAccion = row.idAccion;
        model.idMotivoAccion = row.idMotivoAccion;
        model.idEstadoLicencia = 1;
        model.idDocumentoSustento = null;
        model.idTipoResolucion = row.idTipoResolucion;
        model.idCentroTrabajo = this.servidorPublico.idCentroTrabajo;
        //model.anio = new Date().getFullYear();
        model.fechaInicio = moment(row.fechaInicio).format('DD/MM/YYYY');
        model.fechaFin = moment(row.fechaFin).format('DD/MM/YYYY');
        model.cantidadDias = row.cantidadDias;
        model.codigoResolucion = row.codigoResolucion;
        model.codigoAccionPersonalGrabada = 0;
        model.generaProyecto = false;
        model.generaAccionGrabada = false;
        model.anotaciones = row.anotaciones;
        model.codigoMotivoAccion = 0;
        model.codigoDocumentoResolucion = row.codigoDocumentoResolucion;        

        const codigoMotivoAccion = this.getCodigoMotivoAccion(model.idMotivoAccion);
        if (codigoMotivoAccion === MotivoAccionEnum.POR_ADOPCION) {
            const licenciaAdopcion = new LicenciaAdopcionModel();
            licenciaAdopcion.idLicenciaAdopcion = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.licenciaAdopcion.idLicenciaAdopcion;
            licenciaAdopcion.idLicencia = 0;
            licenciaAdopcion.idPersona = this.familiar.idPersona;
            licenciaAdopcion.idFamiliarServidorPublico = this.familiar.idFamiliarServidorPublico;
            licenciaAdopcion.numeroDocumentoIdentidad = row.numeroDocumentoIdentidad;
            licenciaAdopcion.primerApellido = row.primerApellido;
            licenciaAdopcion.segundoApellido = row.segundoApellido;
            licenciaAdopcion.nombres = row.nombres;
            licenciaAdopcion.fechaNacimiento = row.fechaNacimiento;
            licenciaAdopcion.edad = row.edad;
            model.licenciaAdopcion = licenciaAdopcion;
        }

        if (codigoMotivoAccion === MotivoAccionEnum.POR_PATERNIDAD) {
            const licenciaPaternidad = new LicenciaPaternidadModel();
            licenciaPaternidad.idLicenciaPaternidad = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.licenciaPaternidad.idLicenciaPaternidad;
            licenciaPaternidad.idLicencia = 0;
            licenciaPaternidad.idTipoParto = row.idTipoParto;
            licenciaPaternidad.descripcionTipoParto = row.descripcionTipoParto;
            model.licenciaPaternidad = licenciaPaternidad;
        }

        if (codigoMotivoAccion === MotivoAccionEnum.POR_FALLECIMIENTO_DE_PADRES_CONYUGE_E_HIJOS) {
            const licenciaFallecimiento = new LicenciaFallecimientoModel();
            licenciaFallecimiento.idLicenciaFallecimiento = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.licenciaFallecimiento.idLicenciaFallecimiento;
            licenciaFallecimiento.idLicenciaFallecimiento = 0;
            licenciaFallecimiento.idLugarDeceso = row.idLugarDeceso;
            licenciaFallecimiento.idPersona = this.familiar.idPersona;
            licenciaFallecimiento.idFamiliarServidorPublico = this.familiar.idFamiliarServidorPublico;
            licenciaFallecimiento.descripcionLugarDesceso = row.descripcionLugarDesceso;
            model.licenciaFallecimiento = licenciaFallecimiento;
        }

        if (codigoMotivoAccion === MotivoAccionEnum.POR_ENFERMEDAD_GRAVE_TERMINAL_O_POR_ACCIDENTE_GRAVE) {
            const otraLicencia = new OtraLicenciaModel();
            otraLicencia.idOtraLicencia = this.idOperacion === TipoOperacionEnum.Registrar ? 0 : this.licencia.otraLicencia.idOtraLicencia;
            otraLicencia.idLicencia = 0;
            otraLicencia.idPersona = this.familiar.idPersona;
            otraLicencia.idFamiliarServidorPublico = this.familiar.idFamiliarServidorPublico;
            otraLicencia.idTipoDiagnostico = row.idTipoDiagnostico;
            otraLicencia.diasAcumulados = row.diasAcumulados;
            otraLicencia.descripcionTipoDiagnostico = row.descripcionTipoDiagnostico;
            model.otraLicencia = otraLicencia;
        }

        model.documentosSustento = this.documentosSustento;
        model.usuarioRegistro = this.currentSession.numeroDocumento;
        return model;
    }

    resetForm = () => {
        this.form.reset();
        this.form.patchValue({
            idAccion: this.idAccion,
            idEstadoLicencia: 1,
            diasAcumulados: 0,
            cantidadDias: 0,
            idLicencia: 0,
            idServidorPublico: this.servidorPublico.idServidorPublico,
        });
        this.documentosSustento = [];
        this.documentosSustentoComponent?.actualizarLista(this.documentosSustento);
        this.familiar = new FamiliarServidorPublico();
        this.configurarCampos();
    }

    configurarFechaFin = () => {
        this.form.get('fechaFin').setValue(null);
        this.minDate = this.form.get('fechaInicio').value;
        this.calcularCantidadDias();
    }

    setConfiguracionCampos = () => {
        this.campos.push({ codigoMotivoAccion: MotivoAccionEnum.POR_PATERNIDAD, nombreCampo: 'idTipoParto', visible: true, required: true });
        this.campos.push({ codigoMotivoAccion: MotivoAccionEnum.POR_FALLECIMIENTO_DE_PADRES_CONYUGE_E_HIJOS, nombreCampo: 'idLugarDeceso', visible: true, required: true });
        this.campos.push({
            codigoMotivoAccion: MotivoAccionEnum.POR_ENFERMEDAD_GRAVE_TERMINAL_O_POR_ACCIDENTE_GRAVE,
            nombreCampo: 'idTipoDiagnostico', visible: true, required: true
        });
    }

    configurarCampos = () => {
        const idMotivoAccion: number = this.form.get('idMotivoAccion').value;
        this.campos.forEach(element => {
            this.form.get(element.nombreCampo).clearValidators();
        });

        if (idMotivoAccion !== null) {
            let codigoMotivoAccion;
            if (this.idOperacion === TipoOperacionEnum.Registrar) {
                codigoMotivoAccion = this.comboLists.motivoAccion.find(x => x.value === idMotivoAccion).codigoMotivoAccion;
            } else {
                codigoMotivoAccion = this.licencia.codigoMotivoAccion;
            }
            const camposMotivoAccion = this.campos.filter(x => x.codigoMotivoAccion === codigoMotivoAccion);

            camposMotivoAccion.forEach(element => {
                if (element.visible === true) {
                    if (element.required === true) {
                        this.form.get(element.nombreCampo).setValidators(Validators.required);
                    }
                }
            });
        }
        this.configurarPanel();
        this.validarReglasAdicionales();
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.form.get('fechaFin').setValue(null);
        }
    }

    getCodigoMotivoAccion = (idMotivoAccion: number) => {
        let codigoMotivoAccion;
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            codigoMotivoAccion = this.comboLists.motivoAccion.find(x => x.value === idMotivoAccion).codigoMotivoAccion;
        } else {
            codigoMotivoAccion = this.licencia.codigoMotivoAccion;
        }
        return codigoMotivoAccion;
    }

    configurarPanel = () => {
        this.form.get('idLugarDeceso').clearValidators();
        this.form.get('idTipoDocumentoIdentidad').clearValidators();
        this.form.get('numeroDocumentoIdentidad').clearValidators();
        this.form.get('idTipoDiagnostico').clearValidators();

        this.form.get('codigoResolucion').clearValidators();
        this.form.get('codigoDocumentoResolucion').clearValidators();
        this.form.get('idTipoResolucion').setValidators(Validators.required);

        this.campoRegla.codigoResolucionVisible = false;
        this.campoRegla.codigoDocumentoResolucionVisible = false;
        this.campoRegla.idTipoResolucionVisible = true;
        this.campoLabel.CantidadDiasLabel = 'Cantidad días';

        this.form.get('codigoResolucion').setValue(null);
        this.form.get('codigoDocumentoResolucion').setValue(null);
        this.archivoAdjunto = null;
        this.archivoAdjuntoModificado = false;
        this.campoRegla.accionGrabaVisible = true;

        this.form.updateValueAndValidity();

        this.panelDatosFamiliarVisible = false;
        let idMotivoAccion;
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            this.form.get('idLugarDeceso').setValue(null);
            this.form.get('idTipoDocumentoIdentidad').setValue(null);
            this.form.get('numeroDocumentoIdentidad').setValue(null);
            this.form.get('idTipoDiagnostico').setValue(null);
            idMotivoAccion = this.form.get('idMotivoAccion').value;
        } else {
            idMotivoAccion = this.licencia.idMotivoAccion;
        }

        if (idMotivoAccion !== undefined && idMotivoAccion !== null) {
            let codigoMotivoAccion;
            if (this.idOperacion === TipoOperacionEnum.Registrar) {
                codigoMotivoAccion = this.comboLists.motivoAccion.find(x => x.value === idMotivoAccion).codigoMotivoAccion;
            } else {
                codigoMotivoAccion = this.licencia.codigoMotivoAccion;
            }

            switch (codigoMotivoAccion) {
                case MotivoAccionEnum.POR_ADOPCION:
                    this.panelDatosFamiliarVisible = true;
                    this.panelFamiliarTitle = 'Datos del hijo';
                    this.datosHijoVisible = true;
                    this.form.get('idTipoDocumentoIdentidad').setValidators(Validators.required);
                    this.form.get('numeroDocumentoIdentidad').setValidators(Validators.required);
                    this.form.updateValueAndValidity();
                    break;
                case MotivoAccionEnum.POR_FALLECIMIENTO_DE_PADRES_CONYUGE_E_HIJOS:
                    this.form.get('idLugarDeceso').setValidators(Validators.required);
                    this.panelDatosFamiliarVisible = true;
                    this.panelFamiliarTitle = 'Datos del familiar';
                    this.datosHijoVisible = false;
                    this.form.get('idTipoDocumentoIdentidad').setValidators(Validators.required);
                    this.form.get('numeroDocumentoIdentidad').setValidators(Validators.required);
                    this.form.updateValueAndValidity();
                    break;
                case MotivoAccionEnum.POR_ENFERMEDAD_GRAVE_TERMINAL_O_POR_ACCIDENTE_GRAVE:
                    this.panelDatosFamiliarVisible = true;
                    this.datosHijoVisible = false;
                    this.panelFamiliarTitle = 'Datos del familiar';
                    this.form.get('idTipoDiagnostico').setValidators(Validators.required);
                    this.form.get('idTipoDocumentoIdentidad').setValidators(Validators.required);
                    this.form.get('numeroDocumentoIdentidad').setValidators(Validators.required);
                    this.form.updateValueAndValidity();
                    break;

                case MotivoAccionEnum.POR_ASUMIR_REPRESENTACION_OFICIAL_DEL_ESTADO_PERUANO:
                    if (this.servidorPublico.codigoRegimenLaboral === RegimenLaboralEnum.LEY_29944 ||
                        this.servidorPublico.codigoRegimenLaboral === RegimenLaboralEnum.LEY_30512) {
                        this.campoRegla.codigoResolucionVisible = true;
                        this.campoRegla.codigoDocumentoResolucionVisible = true;
                        this.campoRegla.idTipoResolucionVisible = false;
                        this.form.get('codigoResolucion').setValidators(Validators.required);
                        this.form.get('codigoDocumentoResolucion').setValidators(Validators.required);
                        this.form.get('idTipoResolucion').clearValidators();
                        this.form.get('idTipoResolucion').setValue(null);
                        this.campoRegla.accionGrabaVisible = false;
                    }
                    break;
                case MotivoAccionEnum.POR_DESEMPENO_DE_CARGO_DE_CONSEJERO_REGIONAL_O_REGIDOR_MUNICIPAL:
                    this.campoLabel.CantidadDiasLabel = 'Cantidad días (1 día semanal mensual)';
                    break;
                default:
                    break;
            }
        }
    }

    esCampoVisible = (fieldName) => {
        let visible = false;
        const idMotivoAccion = this.form.get('idMotivoAccion').value;
        const motivoAccion = this.comboLists.motivoAccion.find(x => x.value === idMotivoAccion);
        if (motivoAccion != null && motivoAccion !== undefined) {
            const campo = this.campos.find(x => x.nombreCampo === fieldName && x.codigoMotivoAccion === motivoAccion.codigoMotivoAccion);
            if (campo != null) {
                visible = campo?.visible;
            }
        }
        return visible;
    }

    buscarFamiliarServidorPublico(): void {
        const idTipoDocumentoIdentidad = this.form.get('idTipoDocumentoIdentidad').value;
        const numeroDocumentoIdentidad = this.form.get('numeroDocumentoIdentidad').value;
        if (numeroDocumentoIdentidad === null || idTipoDocumentoIdentidad == null) {
            this.dataService
                .Message()
                .msgWarning('Debe ingresar Tipo de documento y Número de documento', () => { });
            return;
        }

        const param = {
            idPersona: this.servidorPublico.idPersona,
            idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
            numeroDocumentoIdentidad,
            primerApellido: null,
            segundoApellido: null,
            nombres: null,
        };
        const paginaActual = 1;
        const tamanioPagina = 10;

        this.dataService
            .Licencias()
            .getFamiliarServidorPublico(param, paginaActual, tamanioPagina)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const persona = response.data[0];
                    if (persona === null || persona === undefined) {
                        this.dataService
                            .Message()
                            .msgWarning('Número de documento ingresado no existe', () => { });
                    } else {
                        let isValid = true;
                        if (this.form.get('idMotivoAccion').value === MotivoAccionEnum.POR_ADOPCION) {
                            if (persona.edad > this.edadPermitidoAdopcion) {
                                this.dataService
                                    .Message()
                                    .msgWarning('Debe seleccionar hijo(a) menor o igual 12 años', () => { });
                                isValid = false;
                                this.familiar = new FamiliarServidorPublico();
                            }
                        }
                        if (isValid) {
                            this.familiar = persona;
                        }
                    }
                }
            });
    }

    busquedaPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarFamiliarServidorComponent,
            {
                panelClass: 'buscar-familiar-servidor-publico-dialog',
                width: '980px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                    idPersona: this.servidorPublico.idPersona
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                const servidorPublico = resp.servidorPublico;
                this.familiar = resp.familiarServidor;
                this.form.get('idFamiliarServidorPublico').setValue(this.familiar.idFamiliarServidorPublico);
                this.form.get('idTipoDocumentoIdentidad').setValue(this.familiar.idTipoDocumentoIdentidad);
                this.form.get('numeroDocumentoIdentidad').setValue(this.familiar.numeroDocumentoIdentidad);
            }
        });
    }

    handleGenerar = () => {
        this.handleSave('proyecto')
    }

    generarProyecto = () => {
        if (!this.form.valid) {
            this.dataService
                .Message()
                .msgWarning('Debe seleccionar el tipo de resolución', () => { });
            return;
        }

        const idTipoResolucion = this.form.get('idTipoResolucion').value;
        const data = {
            idLicencia: this.idLicencia,
            idTipoResolucion: idTipoResolucion,
            documentosSustento: this.documentosSustento
        };

        Swal.fire({
            title: '',
            text: '¿Está seguro que desea generar el proyecto de resolución?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService
                    .Licencias()
                    .generarLicencia(data)
                    .subscribe(response => {
                        if (response && response.result) {
                            this.matDialogRef.close({ grabado: true });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                            this.dataService.Message().msgWarning(response.messages[0], () => { });
                        } else {
                            this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
                        }
                    },
                        (error) => {

                        }
                    );
            }
        });
    }

    handleEnviar() {
        this.handleSave('acciongrabada');
    }

    enviarAccionGrabada = () => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Debe seleccionar el tipo de resolución', () => { });
            return;
        }
        const idTipoResolucion = this.form.get('idTipoResolucion').value;
        const data = {
            idLicencia: this.idLicencia,
            idTipoResolucion: idTipoResolucion,
            documentosSustento: this.documentosSustento
        };

        Swal.fire({
            title: '',
            text: '¿Está seguro que desea guardar la acción?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.dataService.Spinner().show("sp6");
                const resultMessage = 'Acción grabada se guardó exitosamente';
                this.dataService.Licencias().enviarAccionesGrabadas(data).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                        this.working = false;
                    })
                ).subscribe(response => {
                    if (response && response.result) {
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
        });
    }

    validarFechas = () => {
        const row = this.form.getRawValue();
        const idGrupoAccion = GrupoAccionEnum.LICENCIAS;
        const idAccion = row.idAccion;
        const idMotivoAccion = row.idMotivoAccion;
        const fechaInicio = row.fechaInicio;
        const fechaFin = row.fechaFin;
        const idTipoDescanso = 0;
        const idTipoParto = row.idTipoParto != null ? row.idTipoParto : 0;
        const idLugarDesceso = row.idLugarDeceso != null ? row.idLugarDeceso : 0;
        const idRegimenLaboral = this.servidorPublico.idRegimenLaboral;

        if (idMotivoAccion === null || fechaInicio === null || fechaFin === null) {
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
            idTipoParto: idTipoParto,
            idLugarDesceso: idLugarDesceso,
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

    validarReglasAdicionales = () => {
        if (this.idOperacion === TipoOperacionEnum.Registrar) {
            const idMotivoAccion = this.form.get('idMotivoAccion').value;
            const motivoAccion = this.comboLists.motivoAccion.find(x => x.value === idMotivoAccion);
            if (motivoAccion != null) {
                if (motivoAccion.codigoMotivoAccion === MotivoAccionEnum.POR_PATERNIDAD) {
                    if (this.servidorPublico.codigoGenero !== GeneroEnum.MASCULINO) {
                        this.dataService.Message().msgWarning('No se puede registrar la licencia, eligir otro servidor público.', () => { this.working = false; });
                        this.form.get('idMotivoAccion').setValue(null);
                    }
                }
            }

        }
    }

    uploadFile = (files) => {
        const inputNode: any = document.querySelector('#file');

        if (typeof (FileReader) !== 'undefined') {
            if (files[0].size >= this.globals.PESO_ARCHIVO_ADJUNTO_2MB) {
                this.dataService.Message().msgWarning(`El archivo adjunta supera el limite permitido de ${this.globals.PESO_2MB}.`, () => { });

            } else {
                this.form.controls['codigoDocumentoResolucion'].setValue(files[0].name);
                this.archivoAdjunto = files[0];
                this.archivoAdjuntoModificado = true;
            }
        }
    }

    selectTipoDocumento(tipoDocumento: number): void {
        this.form.get('numeroDocumentoIdentidad').setValue('');
        this.maxLengthnumeroDocumentoIdentidad =

            tipoDocumento === TipoDocumentoIdentidadEnum.DNI ? 8 : 12;

        this.form
            .get('numeroDocumentoIdentidad')
            .setValidators([
                Validators.maxLength(this.maxLengthnumeroDocumentoIdentidad),
            ]);

    }

    validaNumericos = (event) => {
        if (event.charCode >= 48 && event.charCode <= 57) {
            return true;
        }
        return false;
    }
}

export class MotivoAccionCampoConfig {
    codigoMotivoAccion: number;
    nombreCampo: string;
    visible: boolean;
    required: boolean;
}

