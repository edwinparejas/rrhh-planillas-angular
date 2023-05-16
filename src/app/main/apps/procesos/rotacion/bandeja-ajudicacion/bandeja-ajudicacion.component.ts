import { DataSource, CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { RotacionModel } from 'app/core/model/rotacion.model';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray } from 'lodash';
import { Subject, forkJoin, of, BehaviorSubject, Observable } from 'rxjs';
import { takeUntil, catchError, finalize, filter } from 'rxjs/operators';
import { BusquedaCentroTrabajoComponent } from '../components/busqueda-centro-trabajo/busqueda-centro-trabajo.component';
import { BusquedaDocumentoIdentidadComponent } from '../components/busqueda-documento-identidad/busqueda-documento-identidad.component';
import { BusquedaPlazaComponent } from '../components/busqueda-plaza/busqueda-plaza.component';
import { MaestroPermisoAdjudicacionModel } from '../models/rotacion.model';
import { MENSAJES, TablaEstadosDesarrolloProceso, TablaTipoDocumentoIdentidad, EstadoAdjudicacion } from '../_utils/constants';
import { ActualizarDatosServidorPublicoComponent } from './actualizar-datos-servidor-publico/actualizar-datos-servidor-publico.component';
import { AdjudicarPlazaComponent } from './adjudicar-plaza/adjudicar-plaza.component';
import { NoAdjudicarPlazaComponent } from './no-adjudicar-plaza/no-adjudicar-plaza.component';
import { SubsanarObservacionComponent } from './subsanar-observacion/subsanar-observacion.component';
import { VerInformacionCompletaComponent } from './ver-informacion-completa/ver-informacion-completa.component';
import { VerObservacionComponent } from './ver-observacion/ver-observacion.component';
import { VerSubsanacionObservacionComponent } from './ver-subsanacion-observacion/ver-subsanacion-observacion.component';
import { DocumentViewerComponent } from '../../../components/document-viewer/document-viewer.component';

@Component({
    selector: 'minedu-bandeja-ajudicacion',
    templateUrl: './bandeja-ajudicacion.component.html',
    styleUrls: ['./bandeja-ajudicacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BandejaAjudicacionComponent implements OnInit, OnDestroy, AfterViewInit {

    form: FormGroup;
    proceso: RotacionModel;
    estadoIniciado: boolean = false;
    permisoAdjudicacion: MaestroPermisoAdjudicacionModel;

    dialogRef: any;
    working = false;
    maximo: number = 8;

    adjudicacionfinalizada: boolean = false;
    etapafinalizada: boolean = false;

    combo = {
        tiposDocumentoIdentidad: [],
        estadosAdjudicacion: [],
    };

    request = {
        idEtapaProceso: null,
        idDesarrolloProceso: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        codigoPlaza: null,
        codigoModular: null,
        anexoCentroTrabajo: null,
        idEstadoAdjudicacion: null,
    };

    estadoAdjudicacion = EstadoAdjudicacion;
    mostrarFinalizarAdjudicacion = true;
    /*
      *-------------------------------------------------------------------------------------------------------------
      * VARIABLES GRID ADJUDICACIONES
      *-------------------------------------------------------------------------------------------------------------
      */
    displayedColumns: string[] = [
        'registro',
        'tipoRotacion',
        'ordenMerito',
        'documento',
        'nombresApellidos',
        'puntajeTotal',
        'codigoPlaza',
        'cargo',
        'centroTrabajo',
        'estado',
        'acciones',
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    dataSourceAdjudicacion: AdjudicacionesDataSource | null;
    selectionAdjudicacion = new SelectionModel<any>(false, []);
    @ViewChild('paginatorAdjudicacion', { static: true }) paginatorAdjudicacion: MatPaginator;

    private _unsubscribeAll: Subject<any>;
    constructor(
        private activeRoute: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        setTimeout((_) => { this.buildShared(); this.getCombos(); });
        
        this.activeRoute.data.subscribe((data) => {
            if (data) {
                this.proceso = data.ProcesoEtapa;
                this.estadoIniciado = TablaEstadosDesarrolloProceso.INICIADO === this.proceso.codigoEstadoProceso;
                this.buildGrid();
            }
        });
        this.sharedService.onWorking
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(working => this.working = working);

        this.buildForm();
        this.getMaestroPermisoAdjudicacion();
    }

    private buildGrid() {
        this.dataSourceAdjudicacion = new AdjudicacionesDataSource(this.dataService, this.sharedService);
        this.mostrarFinalizarAdjudicacion = this.dataSourceAdjudicacion.adjudicacionFinalizada;
        this.buildPaginators(this.paginatorAdjudicacion);
    }

    private buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = 'Registros por Página';
        paginator._intl.nextPageLabel = 'Siguiente página';
        paginator._intl.previousPageLabel = 'Página anterior';
        paginator._intl.firstPageLabel = 'Primera página';
        paginator._intl.lastPageLabel = 'Última página';
    }


    ngAfterViewInit(): void {
        this.paginatorAdjudicacion.page.subscribe(() => this.getDataGridAdjudicacion());
        setTimeout(() => { this.getDataGridAdjudicacion(); }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            codigoPlaza: [null],
            codigoModular: [null],
            anexoCentroTrabajo: [null],
            idEstadoAdjudicacion: [null],
        });

        this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe((value) => {
            if (value) {
                this.validarTipoDocumentoIdentidad(value);
            }
        });
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de rotación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de rotación');
    }

    private getDataGridAdjudicacion = () => {
        this.dataService.Spinner().show('sp6');
        this.working = true;
        this.setRequest();
        this.dataSourceAdjudicacion.load(
            this.request,        
            this.paginatorAdjudicacion.pageIndex + 1,
            this.paginatorAdjudicacion.pageSize
        );
    };


    /*
     *-------------------------------------------------------------------------------------------------------------
     * OPERACIONES GLOBALES
     *-------------------------------------------------------------------------------------------------------------
     */


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


    private getCombos = () => {
        forkJoin(
            [
                this.dataService.Rotacion().getTiposDocumentoIdentidad(),
                this.dataService.Rotacion().getEstadosAdjudicacion()
            ]
        ).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response && response.length === 0) {
                return;
            }
            const tiposDocumentoIdentidad = response[0];
            if (tiposDocumentoIdentidad) {
                tiposDocumentoIdentidad.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.combo.tiposDocumentoIdentidad = tiposDocumentoIdentidad;
                this.form.controls['idTipoDocumentoIdentidad'].setValue(this.combo.tiposDocumentoIdentidad[1].idCatalogoItem);
            }


            const estadosAdjudicacion = response[1];
            if (estadosAdjudicacion) {
                estadosAdjudicacion.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.combo.estadosAdjudicacion = estadosAdjudicacion;
            }
        });
    }


    busquedaPlazas = () => {

    };

    busquedaPlazasDialog = ($event) => {
        this.dialogRef = this.materialDialog.open(
            BusquedaPlazaComponent,
            {
                panelClass: 'buscar-plaza-form',
                disableClose: true,
                data: {
                    action: 'busqueda',
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp != null) {
                this.form.get('codigoPlaza').setValue(resp.codigoPlaza);
            }
        });
    };

    buscarCentroTrabajoDialog(event) {
        const codigoCentroTrabajo = this.form.get('codigoModular').value;
        if (codigoCentroTrabajo) {
            this.busquedaCentroTrabajo(event);
            return;
        }
        this.handleCentroTrabajoDialog([]);
    }

    busquedaCentroTrabajo(event) {
        event.preventDefault();
        const codigoCentroTrabajo = this.form.get('codigoModular').value;

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

        const data = {
            codigoCentroTrabajo: codigoCentroTrabajo.trim(),
            codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia)
        };

        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe((response: any) => {
            if (response) {
                const data: any[] = response;
                if (data.length === 1) {
                    this.setCentroTrabajo(data[0]);
                    ;
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

    private handleCentroTrabajoDialog(registros: any[]) {
        this.dialogRef = this.materialDialog.open(
            BusquedaCentroTrabajoComponent,
            {
                panelClass: 'buscar-centro-trabajo-form',
                width: '1300px',
                disableClose: true,
                data: {
                    registrado: false,
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
        this.form.patchValue({ codigoModular: data.codigoCentroTrabajo, anexoCentroTrabajo: data.anexoCentroTrabajo });
    };

    /*
     *-------------------------------------------------------------------------------------------------------------
     * OPERACIONES ADJUDICACION
     *-------------------------------------------------------------------------------------------------------------
     */

    handleFinalizarAdjudicacion = () => {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso
        }
        this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA FINALIZAR EL PROCESO DE ADJUDICACIÓN?", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .finalizarAdjudicacion(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    
                    if (response) {   
                        if(response > 0) {
                            this.adjudicacionfinalizada = true;                               
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { });
                        } else if (!response.ok) {
                            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
                        }
                    } else {
                        this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA OPERACIÓN" ', () => { });
                    }
                });
        }, () => { });
    }

    handleFinalizarEtapa = () => {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso
        }
        this.dataService.Message().msgConfirm("¿ESTA SEGURO QUE DESEA FINALIZAR LA ETAPA O PROCESO?", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .finalizarEtapaProceso(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {                    
                    if (response) {    
                        if (response > 0) {              
                            this.etapafinalizada = true;                                 
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { });
                        } else if (!response.ok) {
                            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
                        }
                    }                     
                    else {
                        this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA OPERACIÓN"', () => { });
                    }
                });
        }, () => { });
    }

    handleExportarAdjudicacion = () => {
        if (this.dataSourceAdjudicacion.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    'No se encontró información para exportar.',
                    () => {
                    }
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .exportarAdjudicaciones(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'adjudicaciones.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADO"',
                            () => {
                            }
                        );
                }
            });
    }    

    /*
     *-------------------------------------------------------------------------------------------------------------
     * OPERACIONES GRID ADJUDICACION
     *-------------------------------------------------------------------------------------------------------------
     */

    handleRegistrarAdjudicacion = (row) => {
        const data = {
            idPostulacion: row.idPostulacion,
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso
        }

        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .getValidarServidorPublico(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {

                var tieneDiferencias = (response.listaDiferencia.filter(f=>f.esDiferente==true).length > 0);

                if(tieneDiferencias === true){
                    this.handleValidarServidorPublico(row, response);
                } else {
                    this.dialogRef = this.materialDialog.open(
                        AdjudicarPlazaComponent,
                        {
                            panelClass: 'minedu-adjudicar-plaza',
                            width: '1400px',
                            disableClose: true,
                            data: {
                                idAdjudicacion: row.idAdjudicacion,
                                codigoAdjudicacion: row.codigoAdjudicacion,
                                idEtapaProceso: this.proceso.idEtapaProceso,
                                idCalificacion: row.idCalificacion,
                                idPostulacion: row.idPostulacion,
                                idDesarrolloProceso: this.proceso.idDesarrolloProceso
                            },
                        }
                    );
            
                    this.dialogRef.afterClosed().subscribe((response) => {
                        if (!response) {
                            return;
                        }
                        this.getDataGridAdjudicacion();
                    });
                }
            });
        
    }

    handleValidarServidorPublico = (row, response) => {
        this.dialogRef = this.materialDialog.open(
            ActualizarDatosServidorPublicoComponent,
            {
                panelClass: 'minedu-actualizar-datos-servidor-publico',
                width: '1100px',
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idCalificacion: row.idCalificacion,
                    idPostulacion: row.idPostulacion,
                    response: response
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
            this.getDataGridAdjudicacion();
        });
    }

    handleNoAdjudicar = (row) => {
        this.dialogRef = this.materialDialog.open(
            NoAdjudicarPlazaComponent,
            {
                panelClass: 'minedu-no-adjudicar-plaza',
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idCalificacion: row.idCalificacion,
                    idPostulacion: row.idPostulacion,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
            this.getDataGridAdjudicacion();
        });
    }
    handleSubsanarObservacion = (row) => {
        this.dialogRef = this.materialDialog.open(
            SubsanarObservacionComponent,
            {
                panelClass: 'minedu-subsanar-observacion',
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idCalificacion: row.idCalificacion,
                    idPostulacion: row.idPostulacion,
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((response) => {
            if (!response) {
                return;
            }
            this.getDataGridAdjudicacion();
        });
    }

    handleVerObservacion = (row) => {
        this.dialogRef = this.materialDialog.open(
            VerObservacionComponent,
            {
                panelClass: 'minedu-ver-observacion',
                disableClose: true,
                data: row
            }
        );
    }

    handleVerInformacion = (row) => {
        this.dialogRef = this.materialDialog.open(
            VerInformacionCompletaComponent,
            {
                panelClass: 'minedu-ver-informacion-completa',
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    codigoAdjudicacion: row.codigoAdjudicacion,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idCalificacion: row.idCalificacion,
                    idPostulacion: row.idPostulacion,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso
                },
            }
        );
    }

    handleVerAdjunto(row) {
        if (!row.codigoDocumento) {
            this.dataService
                .Message()
                .msgWarning(
                    '"EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO ADJUNTADO."',
                    () => {}
                );
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(row.codigoDocumento)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                if (response) {
                    this.handlePreview(response, row.codigoDocumento);
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            '"NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO."',
                            () => {}
                        );
                }
            });
    }

    handlePreview(file: any, codigoAdjuntoSustento: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: "modal-viewer-form-dialog",
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Documento de sustento",
                    file: file,
                    fileName: codigoAdjuntoSustento,
                },
            },
        });

        this.dialogRef.afterClosed().subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
    }

    handleActualizarServidor = (row) => {
        this.dialogRef = this.materialDialog.open(
            ActualizarDatosServidorPublicoComponent,
            {
                panelClass: 'minedu-actualizar-datos-servidor-publico',
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    codigoAdjudicacion: row.codigoAdjudicacion,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idCalificacion: row.idCalificacion,
                    idPostulacion: row.idPostulacion,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso
                },
            }
        );
    }

    handleVerSubsanacionObservacion = (row) => {
        this.dialogRef = this.materialDialog.open(
            VerSubsanacionObservacionComponent,
            {
                panelClass: 'minedu-ver-subsanacion-observacion',
                disableClose: true,
                data: row
            }
        );
    }


    /*
    *-------------------------------------------------------------------------------------------------------------
    * OPERACIONES ADICIONALES
    *-------------------------------------------------------------------------------------------------------------
    */

    handleRetornar = () => {
        this.router.navigate(['../../../'], { relativeTo: this.activeRoute });
    };

    handleLimpiar = (): void => this.resetForm();


    handleBuscar = (): void => this.getDataGridAdjudicacion();


    resetForm = () => {
        this.form.reset();
    };

    private setRequest = () => {
        this.request = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value == 0 ? null : this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoModular: this.form.get('codigoModular').value,
            anexoCentroTrabajo: this.form.get('anexoCentroTrabajo').value,
            idEstadoAdjudicacion: this.form.get('idEstadoAdjudicacion').value == 0 ? null : this.form.get('idEstadoAdjudicacion').value,
        };
    };

    getMaestroPermisoAdjudicacion = () => {
        const codigoRol = this.dataService.Storage().getPassportRolSelected().CODIGO_ROL;
        const data = {
            codigoRolPassport: codigoRol,
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idTipoSede: 1 // TODO: reemplazar
        };
        this.dataService
            .Rotacion()
            .getMaestroPermisoAdjudicacion(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                this.permisoAdjudicacion = response;
            });
    }    
    private configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}



export class AdjudicacionesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    public adjudicacionFinalizada = true;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().hide('sp6');
        this.dataService.Rotacion()
            .getAdjudicacionesGrid(data, pageIndex, pageSize)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this._loadingChange.next(false);
                    this.dataService.Spinner().hide('sp6');
                    this.sharedService.sendWorking(false);
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    if (response.length == 0) {
                        this.gridResultMessage();
                    } else {
                        this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistros;
                        this._dataChange.next(response || []);     
                        this.adjudicacionFinalizada  = response.find(x => x.adjudicacionFinalizada).adjudicacionFinalizada
                    }
                } else {
                    this.gridResultMessage(false);
                }
            });
    }
    private gridResultMessage = (emptyResult: boolean = true) => {
        this.totalregistro = 0;
        this._dataChange.next([]);
        if (emptyResult) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
            });
        } else {
            this.dataService.Message().msgWarning('"OCURRIERON PROBLEMAS AL MOMENTO DE PROCESAR LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
        }
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get data(): any {
        return this._dataChange.value || [];
    }
    private configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}
