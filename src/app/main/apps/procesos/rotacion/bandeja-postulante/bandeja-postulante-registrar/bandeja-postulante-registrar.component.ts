import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { GlobalsService } from 'app/core/shared/globals.service';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';
import { constants } from 'buffer';
import { isArray } from 'lodash';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BusquedaCentroTrabajoComponent } from '../../components/busqueda-centro-trabajo/busqueda-centro-trabajo.component';
import { BusquedaDocumentoIdentidadComponent } from '../../components/busqueda-documento-identidad/busqueda-documento-identidad.component';
import { MENSAJES, TablaAlternativaPostulacion, TablaTipoDocumentoIdentidad, TablaTipoRotacion } from '../../_utils/constants';
import { ModalServidorPublicoVinculadoComponent } from './modal-servidor-publico-vinculado/modal-servidor-publico-vinculado.component';

@Component({
    selector: 'minedu-bandeja-postulante-registrar',
    templateUrl: './bandeja-postulante-registrar.component.html',
    styleUrls: ['./bandeja-postulante-registrar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPostulanteRegistrarComponent implements OnInit {

    form: FormGroup;
    formInforme: FormGroup;
    formExpediente: FormGroup;
    formCentroTrabajo: FormGroup;
    working: boolean = false;
    workingInforme: boolean = false;
    workingServidor: boolean = false;
    workingCentroTrabajo: boolean = false;
    workingRegistro: boolean = false;
    permiteBuscar: boolean = true;
    obligatorioFechaExpediente = true;
    visibleBusquedaAvanzadaCentroTrabajo = true;
    styleraised = true;
    maximo = 8;
    nowDate = new Date();

    combo = {
        tiposDocumentoIdentidad: [],
        tiposRotacion: []
    };

    spublico = null;
    plaza = null;
    informe = null;
    centroTrabajo = null;
    postulacion = null;
    mostrarDatos = false;    
    idRegimenLaboral = -1;
    estudios = [];
    meritos = [];
    sanciones = [];

    displayedColumns: string[] = [
        'index',
        'alternativa',
        'codigoModular',
        'centroTrabajo',
        'tipoRotacion',
        'opciones'
    ];
    private _loadingChange = new BehaviorSubject<boolean>(false);
    loading = this._loadingChange.asObservable();
    dataSource: MatTableDataSource<any>;
    selection = new SelectionModel<any>(false, []);
    centrosTrabajo: any[] = [];
    dialogRef: any;

    /*
        *_____________________________estudios___________________________________
     */
    displayedColumnsEstudios: string[] = [
        'index',
        'centroEstudios',
        'especialidad',
        'gradoAcademico',
        'grupoCarrera',
        'nivelEducativo',
        'situacionAcademica',
        'titulo',
        'anioInicio',
        'anioFin'
    ];
    private _loadingChangeEstudios = new BehaviorSubject<boolean>(false);
    loadingEstudios = this._loadingChangeEstudios.asObservable();
    dataSourceEstudios: MatTableDataSource<any>;
    selectionEstudios = new SelectionModel<any>(false, []);
    /*
        *_____________________________meritos___________________________________
     */
    displayedColumnsMerito: string[] = [
        'index',
        'tipoMerito',
        'merito',
        'fechaMerito',
        'instancia'
    ];
    private _loadingChangeMerito = new BehaviorSubject<boolean>(false);
    loadingMerito = this._loadingChangeMerito.asObservable();
    dataSourceMerito: MatTableDataSource<any>;
    selectionMerito = new SelectionModel<any>(false, []);
    /*
        *_____________________________sanciones___________________________________
     */
    displayedColumnsSancion: string[] = [
        'index',
        'tipoDemerito',
        'demerito',
        'fechaInicio',
        'fechaFin'
    ];
    private _loadingChangeSancion = new BehaviorSubject<boolean>(false);
    loadingSancion = this._loadingChangeSancion.asObservable();
    dataSourceSancion: MatTableDataSource<any>;
    selectionSancion = new SelectionModel<any>(false, []);


    constructor(
        public matDialogRef: MatDialogRef<BandejaPostulanteRegistrarComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private materialDialog: MatDialog,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        public globals: GlobalsService,
    ) {
        this.permiteBuscar = this.data.permiteBuscar;
        console.log("this.data...", this.data);
    }

    ngOnInit(): void {
        setTimeout((_) => {
            this.getCombos();
            if (!this.permiteBuscar) {
                this.GetPustulacion();
            }
        });
        this.buildForm();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null, Validators.compose([Validators.required])],
            numeroDocumentoIdentidad: [null, Validators.compose([Validators.required])],
        });
        this.formInforme = this.formBuilder.group({
            numeroInformeEscalafonario: [null, Validators.compose([Validators.required])]
        });
        this.formExpediente = this.formBuilder.group({
            numeroExpediente: [null, Validators.compose([Validators.required])],
            fechaExpediente: [null, Validators.compose([Validators.required])]
        });
        this.formCentroTrabajo = this.formBuilder.group({
            idCentroTrabajo: [null],
            codigoModular: [null, Validators.compose([Validators.required])],
            idTipoRotacion: [null, Validators.compose([Validators.required])],
            centroTrabajo: [null],
            tienePlazaDisponible: [null]
        });

        this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe((value) => {
            if (value) {
                this.validarTipoDocumentoIdentidad(value);
            }
        });
        this.formCentroTrabajo.get("idTipoRotacion").valueChanges.subscribe((value) => {
            console.log("tipo de rotacion", value);
            if (value) {
                const tipoRotacion = this.combo.tiposRotacion.find(d => d.idCatalogoItem === value);
                console.log("tipo rotacion", tipoRotacion.codigoCatalogoItem);
                if (TablaTipoRotacion.Interna === tipoRotacion.codigoCatalogoItem) {
                    console.log("plaza", this.plaza)
                    console.log("codigo modular", this.plaza.codigoModular)
                    if (!this.plaza || !this.plaza.codigoModular) {
                        console.log("plaza", this.plaza)
                        this.dataService.Message().msgWarning('"DEBE REALIZAR LA BÚSQUEDA DEL SERVIDOR PÚBLICO."', () => {
                        });
                        this.formCentroTrabajo.patchValue({ idTipoRotacion: null });
                        return;
                    }
                    this.visibleBusquedaAvanzadaCentroTrabajo = false;
                    this.formCentroTrabajo.patchValue({ codigoModular: this.plaza.codigoModular });
                    this.formCentroTrabajo.controls['codigoModular'].disable();
                    this.busquedaCentroTrabajo2();
                    //this.handleBuscarCentroTrabajo(0);
                }
                if (TablaTipoRotacion.Externa === tipoRotacion.codigoCatalogoItem) {
                    this.visibleBusquedaAvanzadaCentroTrabajo = true;
                    this.formCentroTrabajo.controls['codigoModular'].enable();
                }
            }
        });

        this.dataSource = new MatTableDataSource([]);
        this.dataSourceEstudios = new MatTableDataSource([]);
        this.dataSourceMerito = new MatTableDataSource([]);
        this.dataSourceSancion = new MatTableDataSource([]);

        this.form.get("numeroDocumentoIdentidad").valueChanges.subscribe(value => {
            if (this.mostrarDatos && value.length != this.maximo) {                
                this.mostrarDatos = false;
                this.plaza = null;
                this.spublico = null;
                this.informe = null;
                this.formInforme.controls['numeroInformeEscalafonario'].setValue('');
                this.formCentroTrabajo.controls['idTipoRotacion'].setValue('');
                this.formCentroTrabajo.controls['codigoModular'].setValue('');
                this.centroTrabajo = null;
                this.formExpediente.controls['numeroExpediente'].setValue('');
                this.formExpediente.controls['fechaExpediente'].setValue('');                
            }            
        });
    }
    
    busquedaCentroTrabajo2 = () => {
        const codigoCentroTrabajo = this.formCentroTrabajo.get('codigoModular').value;
        if (!codigoCentroTrabajo) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR UN CÓDIGO MODULAR PARA REALIZAR LA BÚSQUEDA."', () => {
            });
            return;
        }
        if (codigoCentroTrabajo.length < 6 || codigoCentroTrabajo.length > 7) {
            this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON (6 a 7) DÍGITOS."', () => {
            });
            return;
        }
        if (!this.plaza || !this.plaza.codigoModular) {
            this.dataService.Message().msgWarning('"DEBE BUSCAR EL SERVIDOR PÚBLICO ANTES DE REALIZAR ÉSTA OPERACIÓN."', () => { });
            return;
        }
        const data = {
            codigoCentroTrabajo: codigoCentroTrabajo.trim(),
            codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia),
            codigoModularAmbito: this.plaza.codigoModular,
            idCategoriaRemunerativa: this.plaza.idCategoriaRemunerativa,
            idGrupoOcupacional: this.plaza.idGrupoOcupacional,
            codigoPlaza: this.plaza.codigoPlaza
        };
        this.workingCentroTrabajo = true;
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
            catchError((e) => { return this.configCatch(e); }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
                this.workingCentroTrabajo = false;
            })
        ).subscribe((response: any) => {
            if (response) {
                const data: any[] = response;
                if (data.length === 1) {
                    this.setCentroTrabajo(data[0]);
                } else if (data.length > 1) {
                    this.handleCentroTrabajoDialog(data);
                    this.dataService.Message().msgAutoInfo('"SE ENCONTRÓ MÁS DE UN REGISTRO PARA EL CÓDIGO MODULAR INGRESADO, SELECCIONE UN REGISTRO"', 3000, () => {
                    });
                } else {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS"', () => {
                    });
                }
            } else {
                this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => {
                });
            }
        });
    }

    private getCombos = () => {
        forkJoin(
            [
                this.dataService.Rotacion().getTiposDocumentoIdentidad(),
                this.dataService.Rotacion().getTiposRotacion(),
                this.dataService.Rotacion().getComboRegimenLaboral()
            ]
        ).pipe(
            catchError((e) => { return this.configCatch(e); }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            console.log("tipos de rotacion", response, response.length);
            if (response && response.length === 0) {
                return;
            }
            const tiposDocumentoIdentidad = response[0];
            if (tiposDocumentoIdentidad) {
                this.combo.tiposDocumentoIdentidad = tiposDocumentoIdentidad;
                this.form.controls['idTipoDocumentoIdentidad'].setValue(this.combo.tiposDocumentoIdentidad[0].idCatalogoItem);
            }

            const tiposRegistro = response[1];
            console.log("tipos registro", tiposRegistro);
            if (tiposRegistro) {
                this.combo.tiposRotacion = tiposRegistro;
            }
            const regimenLaboral = response[2];
            this.idRegimenLaboral = regimenLaboral[0].idRegimenLaboral;
        });
    }

    private validarTipoDocumentoIdentidad = (value: number) => {
        this.maximo = 8;
        const tipoDocumentoIdentidad = this.combo.tiposDocumentoIdentidad.find(pred => pred.idCatalogoItem === value);
        let validatorNumeroDocumento = null;
        switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
            case TablaTipoDocumentoIdentidad.DNI:
                this.maximo = 8;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[0-9]*$"),
                ]);
                break;
            case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
                this.maximo = 12;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[a-zA-Z0-9]*$"),
                ]);
                break;
            case TablaTipoDocumentoIdentidad.PASAPORTE:
                this.maximo = 12;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[a-zA-Z0-9]*$"),
                ]);
                break;
            default:
                this.maximo = 8;
                break;
        }

        const numeroDocumentoIdentidad = this.form.get("numeroDocumentoIdentidad");

        numeroDocumentoIdentidad.setValidators(validatorNumeroDocumento);
        numeroDocumentoIdentidad.updateValueAndValidity();
        this.form.patchValue({ numeroDocumentoIdentidad: null });
    }

    onKeyOnlyNumbers(e) {
        const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
        let permiteIngreso = true;
        const tipoDocumentoIdentidad = this.combo.tiposDocumentoIdentidad.find(pred => pred.idCatalogoItem === idTipoDocumentoIdentidad);

        switch (tipoDocumentoIdentidad?.codigoCatalogoItem) {
            case TablaTipoDocumentoIdentidad.DNI:
                if (e.keyCode == 13 || (e.keyCode >= 48 && e.keyCode <= 57)) {
                    permiteIngreso = true;
                } else {
                    permiteIngreso = false;
                }
                break;
            case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
                permiteIngreso = true;
                break;
            case TablaTipoDocumentoIdentidad.PASAPORTE:
                permiteIngreso = true;
                break;
            default:
                permiteIngreso = false;
                break;
        }
        return permiteIngreso;
    }


    busquedaDocumentoIdentidadDialog = ($event) => {
        const form = this.form.value;
        console.log("permisos", form)
        const idTipoDocumentoIdentidad = form.idTipoDocumentoIdentidad;
        const numeroDocumentoIdentidad = form.numeroDocumentoIdentidad;

        this.dialogRef = this.materialDialog.open(BusquedaDocumentoIdentidadComponent,
            {
                panelClass: 'buscar-documento-identidad',
                disableClose: true,
                data: {
                    idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
                    numeroDocumentoIdentidad: numeroDocumentoIdentidad,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.form.patchValue({ numeroDocumentoIdentidad: resp.numeroDocumentoIdentidad });
        });
    };


    handleBuscar = () => {
        //console.log("hola buscar");
        const form = this.form.value;
        if (!form.numeroDocumentoIdentidad) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR UN NÚMERO DE DOCUMENTO PARA REALIZAR LA BÚSQUEDA."', () => {
            });
            return;
        }
        if (form.numeroDocumentoIdentidad.length < 8 || form.numeroDocumentoIdentidad.length > 12) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR UN NÚMERO DE DOCUMENTO DE (8 A 12) DÍGITOS PARA REALIZAR LA BÚSQUEDA."', () => {
            });
            return;
        }
        this.workingServidor = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .getServidorPublico(form.idTipoDocumentoIdentidad, form.numeroDocumentoIdentidad, this.idRegimenLaboral, null)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingServidor = false; })
            ).subscribe((response: any) => {                
                if (typeof(response.ok) !== 'undefined') {
                    if (!response.ok) {
                        this.dataService.Message().msgWarning(response.error.messages[0], () => { });
                    }
                }
                if (response.listaVinculacionServidorPublico.length > 1) {
                    this.dialogRef = this.materialDialog.open(ModalServidorPublicoVinculadoComponent, {
                        panelClass: 'minedu-modal-documentos-publicados',
                        disableClose: true,
                        data: {                
                            dialogTitle:"Vinculaciones vigentes",
                            listaVinculacionServidorPublico: response.listaVinculacionServidorPublico
                        }
                    });
                    this.dialogRef.afterClosed().subscribe((response) => {
                        if (!response) {
                            return;
                        }
                        console.log(response);
                        this.dataService
                            .Rotacion()
                            .getServidorPublico(form.idTipoDocumentoIdentidad, form.numeroDocumentoIdentidad, this.idRegimenLaboral, response[0].idServidorPublico)
                            .pipe(
                                catchError((e) => { return this.configCatch(e); }),
                                finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingServidor = false; })
                            ).subscribe((response: any) => {                
                                if (response.servidorPublico) {
                                    this.mostrarDatos = true;
                                    const { servidorPublico, plaza } = response;
                                    console.log("response plaza:  ", response.codigoPlaza);
                                    console.log("response servidorPublico:  ", servidorPublico);
                                    console.log("response:  ", response);

                                    this.spublico = servidorPublico;
                                    this.plaza = plaza;
                                    console.log("response plaza2:  ", plaza);
                                } 
                                else if (response.error != null) {
                                    this.dataService.Message().msgWarning(response.error.messages[0], () => { });
                                }
                                else {
                                    this.dataService.Message().msgWarning('"DOCUMENTO BUSCADO NO PERTENECE A UN SERVIDOR PÚBLICO O EL SERVIDOR PÚBLICO CUENTA CON UNA POSTULACIÓN "', () => { });
                                }
                            });
                    });
                }
                else if (response.servidorPublico) {
                    this.mostrarDatos = true;
                    const { servidorPublico, plaza } = response;
                    console.log("response plaza:  ", response.codigoPlaza);
                    console.log("response servidorPublico:  ", servidorPublico);
                    console.log("response:  ", response);

                    this.spublico = servidorPublico;
                    this.plaza = plaza;
                    console.log("response plaza2:  ", plaza);
                } 
                else if (response.error != null) {
                    this.dataService.Message().msgWarning(response.error.messages[0], () => { });
                }
                else {
                    this.dataService.Message().msgWarning('"DOCUMENTO BUSCADO NO PERTENECE A UN SERVIDOR PÚBLICO O EL SERVIDOR PÚBLICO CUENTA CON UNA POSTULACIÓN "', () => { });
                }
            });
    };


    private GetPustulacion = () => {
        const { idPostulacion, idEtapaProceso } = this.data;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .getPostulacion(idPostulacion, idEtapaProceso)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).subscribe((response: any) => {
                if (response) {
                    const { postulacion, servidorPublico, plaza, informe, destinos } = response;
                    this.postulacion = postulacion;
                    this.formExpediente.patchValue({
                        fechaExpediente: postulacion.fechaExpediente,
                        numeroExpediente: postulacion.numeroExpediente
                    });
                    this.spublico = servidorPublico;
                    this.plaza = plaza;
                    console.log("informe..", informe);
                    this.informe = informe;
                    this.centrosTrabajo = destinos;
                    this.dataSource = new MatTableDataSource(this.centrosTrabajo);
                    this.estudios = informe.estudios;
                    this.meritos = informe.meritos;
                    this.sanciones = informe.sanciones;
                    this.dataSourceEstudios = new MatTableDataSource(informe.estudios);
                    this.dataSourceMerito = new MatTableDataSource(informe.meritos);
                    this.dataSourceSancion = new MatTableDataSource(informe.sanciones);
                    this.mostrarDatos = true;
                } else {
                    this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA OPERACIÓN "', () => { });
                }
            });
    }

    handleModificar = () => {
        const { idPostulacion, idEtapaProceso, idDesarrolloProceso } = this.data;
        const formExpediente = this.formExpediente.value;
        const passport = this.dataService.Storage().getInformacionUsuario();
        if (this.centrosTrabajo.filter(t => !t.eliminado).length === 0 || this.centrosTrabajo.filter(t => !t.eliminado).length > 3) {
            this.dataService.Message().msgWarning('"REGISTRE COMO MÍNIMO 1 DESTINO Y COMO MÁXIMO 3 DESTINOS"', () => { });
            return;
        }

        if (!this.formExpediente.valid) {
            this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN DATOS DE LA INSCRIPCIÓN"', () => { });
            return;
        }
        const model = {
            idPostulacion: idPostulacion,
            idDesarrolloProceso: idDesarrolloProceso,
            idEtapaProceso: idEtapaProceso,
            idPersona: this.spublico.idPersona,
            idServidorPublico: this.spublico.idServidorPublico,
            numeroExpediente: formExpediente.numeroExpediente,
            fechaExpediente: formExpediente.fechaExpediente,
            numeroIE: this.informe.numeroInformeEscalafonario,
            fechaIE: this.informe.fechaInformeEscalafonario,
            documentoIE: this.informe.documentoInformeEscalafonario,
            usuarioCreacion: passport.numeroDocumento,
            destinos: this.centrosTrabajo,
            informe: this.informe
        }
        this.workingRegistro = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .modificarPostulacion(model)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingRegistro = false; })
            ).subscribe((response: any) => {
                if (response) {
                    this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
                        this.matDialogRef.close({ registrado: true });
                    });
                } else {
                    this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA OPERACIÓN "', () => { });
                }
            });

    };

    handleRegistrar = () => {
        const { idEtapaProceso } = this.data;
        const { idDesarrolloProceso } = this.data;
        const formDocumento = this.form.value;
        const form = this.formInforme.value;
        const formExpediente = this.formExpediente.value;
        const passport = this.dataService.Storage().getInformacionUsuario();
        if (this.centrosTrabajo.filter(t => !t.eliminado).length === 0 || this.centrosTrabajo.filter(t => !t.eliminado).length > 3) {
            this.dataService.Message().msgWarning('"REGISTRE COMO MÍNIMO 1 DESTINO Y COMO MÁXIMO 3 DESTINOS"', () => { });
            return;
        }

        if (!this.formExpediente.valid) {
            this.dataService.Message().msgWarning('"INGRESE DATOS EN LA SECCIÓN DATOS DE LA INSCRIPCIÓN"', () => { });
            return;
        }

        const model = {
            idEtapaProceso: idEtapaProceso,
            idDesarrolloProceso: idDesarrolloProceso,
            idPersona: this.spublico.idPersona,
            idServidorPublico: this.spublico.idServidorPublico,
            numeroExpediente: formExpediente.numeroExpediente,
            fechaExpediente: formExpediente.fechaExpediente,
            numeroIE: this.informe.numeroInformeEscalafonario,
            fechaIE: this.informe.fechaInformeEscalafonario,
            documentoIE: this.informe.documentoInformeEscalafonario,
            usuarioCreacion: passport.numeroDocumento,
            destinos: this.centrosTrabajo,
            informe: this.informe,
        }
        this.workingRegistro = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .crearPostulacion(model)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingRegistro = false; })
            ).subscribe((response: any) => {
                if (response) {

                    //this.dataService.Message().msgSuccess('Operación realizada de manera existosa ', () => { });
                    // this.dataService.Util().msgAutoCloseSuccess(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                    this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
                        this.matDialogRef.close({ registrado: true });
                    });
                } else {
                    this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA OPERACIÓN "', () => { });
                }
            });
    };

    handleBuscarInformeEscalafonario = () => {
        const form = this.formInforme.value;
        const formDocumento = this.form.value;

        if (!formDocumento.idTipoDocumentoIdentidad || !formDocumento.numeroDocumentoIdentidad) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR UN EL TIPO DE DOCUMENTO DE IDENTIDAD Y EL NÚMERO DE DOCUMENTO DE IDENTIDAD PARA REALIZAR LA BÚSQUEDA DE INFORME ESCALAFONARIO."', () => {
            });
            return;
        }
        this.workingInforme = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .getInformeEscalafonario(formDocumento.idTipoDocumentoIdentidad, formDocumento.numeroDocumentoIdentidad, form.numeroInformeEscalafonario)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); this.workingInforme = false; })
            ).subscribe((response: any) => {
                console.log("getInformeEscalafonario..", response);
                if (response) {
                    this.informe = response;
                    this.estudios = response.estudios;
                    this.meritos = response.meritos;
                    this.sanciones = response.sanciones;
                    this.dataSourceEstudios = new MatTableDataSource(response.estudios);
                    this.dataSourceMerito = new MatTableDataSource(response.meritos);
                    this.dataSourceSancion = new MatTableDataSource(response.sanciones);
                } else {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORME ESCALAFONARIO."', () => { });
                }
            });
    }; 

    busquedaCentroTrabajo = ($event) => {
        $event.preventDefault();
        const codigoCentroTrabajo = this.formCentroTrabajo.get('codigoModular').value;
        if (!codigoCentroTrabajo) {
            this.dataService.Message().msgWarning('"DEBE INGRESAR UN CÓDIGO MODULAR PARA REALIZAR LA BÚSQUEDA."', () => {
            });
            return;
        }
        if (codigoCentroTrabajo.length < 6 || codigoCentroTrabajo.length > 7) {
            this.dataService.Message().msgWarning('"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON (6 a 7) DÍGITOS."', () => {
            });
            return;
        }
        if (!this.plaza || !this.plaza.codigoModular) {
            this.dataService.Message().msgWarning('"DEBE BUSCAR EL SERVIDOR PÚBLICO ANTES DE REALIZAR ÉSTA OPERACIÓN."', () => { });
            return;
        }        
        const data = {
            codigoCentroTrabajo: codigoCentroTrabajo.trim(),
            codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia),
            codigoModularAmbito: this.plaza.codigoModular,
            idCategoriaRemunerativa: this.plaza.idCategoriaRemunerativa,
            idGrupoOcupacional: this.plaza.idGrupoOcupacional,
            codigoPlaza: this.plaza.codigoPlaza
        };
        this.workingCentroTrabajo = true;
        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
            catchError((e) => { return this.configCatch(e); }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
                this.workingCentroTrabajo = false;
            })
        ).subscribe((response: any) => {
            if (response) {
                const data: any[] = response;
                if (data.length === 1) {
                    this.setCentroTrabajo(data[0]);
                } else if (data.length > 1) {
                    this.handleCentroTrabajoDialog(data);
                    this.dataService.Message().msgAutoInfo('"SE ENCONTRÓ MÁS DE UN REGISTRO PARA EL CÓDIGO MODULAR INGRESADO, SELECCIONE UN REGISTRO"', 3000, () => {
                    });
                } else {
                    this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS"', () => {
                    });
                }
            } else {
                this.dataService.Message().msgError('"OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => {
                });
            }
        });
    }

    buscarCentroTrabajoDialog = ($event) => {
        console.log("evento", $event);
        if (!this.plaza || !this.plaza.codigoModular) {
            this.dataService.Message().msgWarning('"DEBE BUSCAR EL SERVIDOR PÚBLICO ANTES DE REALIZAR ÉSTA OPERACIÓN."', () => { });
            return;
        }
        const codigoCentroTrabajo = this.formCentroTrabajo.get('codigoModular').value;
        if (codigoCentroTrabajo) {
            this.busquedaCentroTrabajo($event);
            return;
        }
        this.handleCentroTrabajoDialog([]);
    }

    private handleCentroTrabajoDialog(registros: any[]) {
        this.dialogRef = this.materialDialog.open(
            BusquedaCentroTrabajoComponent,
            {
                panelClass: 'buscar-centro-trabajo-form',
                width: '1300px',
                disableClose: true,
                data: {
                    registrado: false,
                    codigoModular: this.plaza.codigoModular,
                    centrosTrabajo: registros,
                    permiteBuscar: registros.length === 0
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
            this.setCentroTrabajo(response);
        });
    }

    private setCentroTrabajo = (data) => {
        this.centroTrabajo = data;
        this.formCentroTrabajo.patchValue({ idCentroTrabajo: data.idCentroTrabajo, centroTrabajo: data.centroTrabajo, codigoModular: data.codigoCentroTrabajo, tienePlazaDisponible: data.tienePlazaDisponible });
    };

    handleBuscarCentroTrabajo = ($event) => this.busquedaCentroTrabajo($event);    

    handleAgregar = () => {
        if (!this.centroTrabajo) {
            this.dataService.Message().msgWarning('"REALICE LA BÚSQUEDA DE CENTRO DE TRABAJO."', () => {
            });
            return;
        }
        if (!this.formCentroTrabajo.valid) {
            this.dataService.Message().msgWarning('"INGRESE LOS CAMPOS OBLIGATORIOS."', () => {
            });
            return;
        }
        if (this.centrosTrabajo.filter(t => !t.eliminado).length > 3) {
            this.dataService.Message().msgWarning('"UD. SUPERÓ EL LIMITE DE CENTROS DE TRABAJO DESTINO (MÁXIMO 3) ."', () => {
            });
            return;
        }
        
        if (!this.formCentroTrabajo.get('tienePlazaDisponible').value) {
            this.dataService.Message().msgWarning('"NO EXISTEN PLAZAS PARA EL CENTRO DE TRABAJO CON LA MISMA CATEGORIA REMUNERATIVA Y GRUPO OCUPACIONAL DEL POSTULANTE."', () => {
            });
            return;
        }
        
        //regla codigo modular interno
        const tRotacion = this.combo.tiposRotacion.find(d => d.idCatalogoItem === this.formCentroTrabajo.get('idTipoRotacion').value);
        if (this.formCentroTrabajo.get('codigoModular').value == this.plaza.codigoModular && tRotacion.codigoCatalogoItem == TablaTipoRotacion.Externa) {
            this.dataService.Message().msgWarning('"NO SE PUEDE USAR UN CODIGO MODULAR INTERNO EN UN TIPO DE ROTACION EXTERNA."', () => {
            });
            return;
        }
        // --*
        //regla de negocio interna y externa
        let existeTipoRotacionDiferente = false;
        console.log('centrosTrabajo', this.centrosTrabajo);
        this.centrosTrabajo.forEach(item => {
            console.log('item', item);
            if (item.idTipoRotacion != this.formCentroTrabajo.get('idTipoRotacion').value && !item.eliminado) {
                existeTipoRotacionDiferente = true;
                console.log('entre');
            }
        });

        console.log('existeTipoRotacionDiferente', existeTipoRotacionDiferente)
        if (existeTipoRotacionDiferente) {
            this.dataService.Message().msgWarning('"NO SE PUEDE REGISTRAR UN CENTRO DE TRABAJO DESTINO CON TIPO DE ROTACION INTERNA Y EXTERNA A LA VEZ."', () => {
            });
            return;
        }
        // --*

        const form = this.formCentroTrabajo.getRawValue();
        const datosUsuario = this.dataService.Storage().getInformacionUsuario();

        const tipoRotacion = this.combo.tiposRotacion.find(d => d.idCatalogoItem === form.idTipoRotacion);
        form.tipoRotacion = tipoRotacion.descripcionCatalogoItem;
        form.usuarioCreacion = datosUsuario.numeroDocumento;
        form.eliminado = false;

        let primeraUsado = false, segundaUsado = false, terceraUsado = false;

        const existeTipoRotacion = this.centrosTrabajo.find(x => x.codigoModular == form.codigoModular && x.eliminado != true);
        if (existeTipoRotacion != undefined && existeTipoRotacion != null) {
            return;
        }

        this.centrosTrabajo.forEach(item => {
            if (item.codigoAlternativa === TablaAlternativaPostulacion.Primera && !item.eliminado) {
                primeraUsado = true;
            }
            if (item.codigoAlternativa === TablaAlternativaPostulacion.Segunda && !item.eliminado) {
                segundaUsado = true;
            }
            if (item.codigoAlternativa === TablaAlternativaPostulacion.Tercera && !item.eliminado) {
                terceraUsado = true;
            }
        });

        if (!primeraUsado) {
            form.codigoAlternativa = TablaAlternativaPostulacion.Primera;
            form.alternativa = "PRIMERA";
        } else
            if (!segundaUsado) {
                form.codigoAlternativa = TablaAlternativaPostulacion.Segunda;
                form.alternativa = "SEGUNDA";
            } else
                if (!terceraUsado) {
                    form.codigoAlternativa = TablaAlternativaPostulacion.Tercera;
                    form.alternativa = "TERCERA";
                }


        this.centrosTrabajo.push(form);
        this.centrosTrabajo.sort(function (a, b) { return a.codigoAlternativa - b.codigoAlternativa; });
        this.dataSource = new MatTableDataSource(this.centrosTrabajo.filter(t => !t.eliminado));

        if (TablaTipoRotacion.Externa === tipoRotacion.codigoCatalogoItem) {
            this.formCentroTrabajo.controls["codigoModular"].reset();
            this.centroTrabajo = null;
        }
    }

    handleEliminar = (row, index) => {
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO DE ELIMINAR EL REGISTRO?', () => {

            const centrosTrabajo = this.centrosTrabajo.map(item => {
                if (row.idCentroTrabajo === item.idCentroTrabajo &&
                    row.codigoModular === item.codigoModular &&
                    row.idTipoRotacion === item.idTipoRotacion &&
                    row.centroTrabajo === item.centroTrabajo &&
                    row.codigoAlternativa === item.codigoAlternativa &&
                    !item.eliminado
                ) {
                    item.eliminado = true;
                }
                return item;
            });

            this.centrosTrabajo = centrosTrabajo.sort(function (a, b) { return a.codigoAlternativa - b.codigoAlternativa; });
            this.dataSource = new MatTableDataSource(this.centrosTrabajo.filter(t => !t.eliminado));
        }, () => {
        });
    }

    handleVerDocumentoSustento = () => {
        const codigoAdjunto = this.informe.documentoInformeEscalafonario;
        if (!codigoAdjunto) {
            this.dataService.Message().msgWarning('"EL REGISTRO NO TIENE INFORME ESCALAFONARIO."', () => {
            });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService.Documento().descargar(codigoAdjunto)
            .pipe(
                catchError((e) => { return this.configCatch(e); }),
                finalize(() => this.dataService.Spinner().hide('sp6'))
            ).subscribe(response => {
                if (response) {
                    this.handlePreview(response, codigoAdjunto);
                } else {
                    this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO."', () => {
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
    private configCatch(e: any) {
        if (e && e.status === 400 && isArray(e.messages)) {
            this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if (isArray(e.messages)) {
            if ((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD") != -1)
                this.dataService.Util().msgError(e.messages[0], () => { });
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { });

        } else {
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e)
    }
}
