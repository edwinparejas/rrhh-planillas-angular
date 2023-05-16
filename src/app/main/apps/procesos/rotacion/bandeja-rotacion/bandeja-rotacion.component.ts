import {
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    ViewChild,
    AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { DataService } from 'app/core/data/data.service';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { PassportTipoSede, TablaAccionesPassport, TablaEstadosDesarrolloProceso, TablaEtapaFase, TablaMetodosRotacion, TablaRotacionNivelInstancia, TablaRolPassport } from '../_utils/constants';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from 'app/core/shared/shared.service';
import { IRotacionGridModel } from '../models/rotacion.model';
import { mineduAnimations } from '@minedu/animations/animations';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { PassportAutorizacionModel } from 'app/core/model/security/passport-autorizacion.model';
import { descargarExcel } from 'app/core/utility/functions';
import { MotivoCancelacionProcesoComponent } from '../components/motivo-cancelacion-proceso/motivo-cancelacion-proceso.component';
import { isArray } from 'lodash';

@Component({
    selector: 'minedu-bandeja-rotacion',
    templateUrl: './bandeja-rotacion.component.html',
    styleUrls: ['./bandeja-rotacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaRotacionComponent
    implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    now = new Date();

    working = false;
    exporting = false;

    sede = {
        instancia: '',
        subInstancia: '',
        esRolMonitor: false
    };

    comboLists = {
        listAnio: [],
        listRegimenlaboral: [],
        listEstadoProceso: [],
        listDescripcionMaestroProceso: [],
    };

    displayedColumns: string[] = [
        'numeroRegistro',
        'codigoProceso',
        'regimenLaboral',
        'maestroProceso',
        'numeroConvocatoria',
        'etapaFase',
        'fechaCreacionProceso',
        'estadoProceso',
        'acciones'
    ];

    dataSource: RotacionDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    dialogRef: any;

    private _unsubscribeAll: Subject<any>;

    estadoProcesoRotacion = TablaEstadosDesarrolloProceso;
    private request = {
        anio: null,
        idRegimenLaboral: null,
        idEstadoDesarrolloProceso: null,
        idDescripcionMaestroProceso: null,
        paginaActual: 1,
        tamanioPagina: 10,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog,       
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        setTimeout((_) => {
            this.buildShared();
            this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.GET_FILTROS_PROCESO);
        });
        this.buildForm();
        this.dataSource = new RotacionDataSource(this.dataService, this.sharedService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.resetForm(false);

        this.sharedService.onWorking
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(working => this.working = working);
        
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.GRID_PROCESOS_ETAPAS));
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            anio: [null, Validators.required],
            idRegimenLaboral: [null],
            idDescripcionMaestroProceso: null,
            idEstadoDesarrolloProceso: null,
        });
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de rotación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de rotación');
    }

    handleLimpiar(): void {
        this.resetForm();
    }

    handleBuscar(): void {
        this.working = true;
        this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.GRID_PROCESOS_ETAPAS);
    }

    handlePublicarPlaza = (row) => {
        this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.PROCESO_POSTULACION_PLAZAS, row);
    };

    private handleProcesoPostulacionPlaza = (row: any) => {
        this.dataService.Rotacion().validarProceso(row.idEtapaProceso, row.idDesarrolloProceso).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response) {
                this.router.navigate(['./plazas/' + row.idEtapaProceso +'/'+ row.idDesarrolloProceso], { relativeTo: this.route });
            } else {
                this.dataService.Message().msgWarning('"EL ESTADO DEL REGISTRO DEL PROCESO / ETAPA NO PERMITE REALIZAR ESTA OPERACIÓN"', () => {
                });
            }
        });
    };

    handlePustulante = (row) => {
        this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.PROCESO_POSTULANTES, row);
    };

    private handleProcesoPustulante = (row) => {
        this.dataService.Rotacion().validarProceso(row.idEtapaProceso, row.idDesarrolloProceso).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response) {
                this.router.navigate(['./postulante/' + row.idEtapaProceso +'/'+ row.idDesarrolloProceso], { relativeTo: this.route });
            } else {
                this.dataService.Message().msgWarning('"EL ESTADO DEL REGISTRO DEL PROCESO / ETAPA NO PERMITE REALIZAR ESTA OPERACIÓN"', () => {
                });
            }
        });

    };

    handleCalificacion = (row) => {
        this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.PROCESO_CALIFICACIONES, row);
    };

    private handleProcesoCalificacion = (row) => {
        this.dataService.Rotacion().validarProceso(row.idEtapaProceso, row.idDesarrolloProceso).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response) {
                this.router.navigate(['./calificacion/' + row.idEtapaProceso + '/' + row.idDesarrolloProceso], { relativeTo: this.route });
            } else {
                this.dataService.Message().msgWarning('"EL ESTADO DEL REGISTRO DEL PROCESO / ETAPA NO PERMITE REALIZAR ESTA OPERACIÓN"', () => {
                });
            }
        });

    };

    handleAdjudicar = (row) => {
        this.obtenerClavePublica(TablaAccionesPassport.Consultar, true, TablaMetodosRotacion.PROCESO_ADJUDICACIONES, row);
    };

    private handleProcesoAdjudicar = (row) => {
        this.dataService.Rotacion().validarProceso(row.idEtapaProceso, row.idDesarrolloProceso).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
            })
        ).subscribe(response => {
            if (response) {
                this.router.navigate(['./adjudicacion/' + row.idEtapaProceso + '/' + row.idDesarrolloProceso], { relativeTo: this.route });
            } else {
                this.dataService.Message().msgWarning('"EL ESTADO DEL REGISTRO DEL PROCESO / ETAPA NO PERMITE REALIZAR ESTA OPERACIÓN"', () => {
                });
            }
        });
    };

    componenteBandejaRotacion() {
        // console.log("bandeja de rotacion");
    } 

    private handleBuscarProcesosRotacion = () => {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    handleCancelacion(row) {
        this.dialogRef = this.materialDialog.open(MotivoCancelacionProcesoComponent,
            {
                panelClass: 'minedu-motivo-cancelacion-dialog',
                disableClose: true,
                data: row,
            }
        );
    }

    private resetForm = (limpiar = true) => {
        this.form.reset();
        this.form.get('anio').setValue(new Date());
        this.form.controls['idRegimenLaboral'].setValue(5);
        this.form.controls['idEstadoDesarrolloProceso'].setValue(0);
        if (limpiar) {
            const initValue = this.comboLists.listDescripcionMaestroProceso.find(t => t.codigoCatalogoItem === TablaEtapaFase.UNICA);
            this.form.controls['idDescripcionMaestroProceso'].setValue(0);
        } else {
            this.form.controls['idDescripcionMaestroProceso'].setValue(0);
        }
    };

    private handleComboFiltro = () => {
        forkJoin(
            [
                this.dataService.Rotacion().getComboRegimenLaboral(),
                this.dataService.Rotacion().getComboDescripcionMaestroProceso(),
                this.dataService.Rotacion().getComboEstadoDesarrolloProceso(),
                this.dataService.Rotacion().getCentroTrabajoUsuario(),
                this.dataService.Rotacion().getCodigoDreUgelFromServiceInit()
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
            const regimenLaboral = response[0];
            if (regimenLaboral) {
                var index = 0;
                regimenLaboral.splice(index, 0, {
                    idRegimenLaboral: 0,
                    codigoRegimenLaboral: 0,
                    abreviaturaRegimenLaboral: 'TODOS',
                    descripcionRegimenLaboral: 'TODOS',
                });
                this.comboLists.listRegimenlaboral = regimenLaboral.map((x) => ({
                    ...x,
                    value: x.idRegimenLaboral,
                    label: `${x.descripcionRegimenLaboral}`,
                }));

                this.form.controls['idRegimenLaboral'].setValue(this.comboLists.listRegimenlaboral[1].idRegimenLaboral);
            }

            const etapaFase = response[1];
            if (etapaFase) {
                var index = 0;
                etapaFase.splice(index, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.comboLists.listDescripcionMaestroProceso = etapaFase.map((x) => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`,
                }));
                // this.form.controls['idDescripcionMaestroProceso'].setValue(this.comboLists.listDescripcionMaestroProceso[1].idCatalogoItem);
            }

            const estadoProceso = response[2];
            if (estadoProceso) {
                var index = 0;
                estadoProceso.splice(index, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.comboLists.listEstadoProceso = estadoProceso.map((x) => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`,
                }));
            }
            const centroTrabajoResponse = response[3];
            
            if (centroTrabajoResponse) {
                const rolSelected = this.dataService.Storage().getPassportRolSelected();
               
                const {
                    codigoNivelInstancia,
                    descripcionDre,
                    descripcionUgel,
                    idEntidadSede,
                    idOtraInstancia,
                    idDre,
                    idUgel
                } = centroTrabajoResponse;

                this.dataService.Storage().setCurrentUser({
                    idNivelInstancia: codigoNivelInstancia,
                    codigoNivelInstancia: codigoNivelInstancia,
                    idEntidadSede: idEntidadSede,
                    idOtraInstancia: idOtraInstancia,
                    idDre: idDre,
                    idUgel: idUgel,
                    codigoRolPassport: rolSelected.CODIGO_ROL,
                    descripcionRolPassport: rolSelected.NOMBRE_ROL
                });                
                var ugelDre = response[4];
                this.sede = {
                    instancia: ugelDre.descripcionDre,
                    subInstancia: ugelDre.descripcionUgel,
                    esRolMonitor: rolSelected.CODIGO_ROL === TablaRolPassport.MONITOR
                };
            }else{
                this.dataService.Message().msgWarning('"EL USUARIO NO TIENE PERMISO PARA ENTRAR AL MODULO DE ROTACIÓN DE PLAZAS."', () => {
                    this.router.navigate(['ayni', 'personal', 'inicio']);
                });
                return;
            }
            this.working = true;
            this.handleBuscarProcesosRotacion();
        });
    };

    private setRequest = () => {
        this.request = {
            anio: this.form.get('anio').value.getFullYear(),
            idRegimenLaboral: this.form.get('idRegimenLaboral').value === 0 ? null : this.form.get('idRegimenLaboral').value,
            idDescripcionMaestroProceso: this.form.get('idDescripcionMaestroProceso').value === 0 ? null : this.form.get('idDescripcionMaestroProceso').value,
            idEstadoDesarrolloProceso: this.form.get('idEstadoDesarrolloProceso').value === 0 ? null : this.form.get('idEstadoDesarrolloProceso').value,
            paginaActual: 1,
            tamanioPagina: 10,
        };
    };

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    'No se encontró información para para exportar.',
                    () => {
                    }
                );
            return;
        }
        this.exporting = true;
        this.obtenerClavePublica(TablaAccionesPassport.Exportar, true, TablaMetodosRotacion.EXPORTAR_PROCESOS_ETAPAS);
    };

    private handleExportarProcesosRotacion() {
        this.dataService
            .Rotacion()
            .exportarExcelRotacion(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.exporting = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'procesos-etapas.xlsx');
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
    };

    private obtenerClavePublica(operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosRotacion, param?: any) {
        this.dataService.Spinner().show('sp6');
        this.dataService.Passport().boot().pipe(
            catchError((e) => { return  this.configCatch(e);        }),
        ).subscribe((response: any) => {
            if (response) {
                const { IsSecure, Token } = response;
                this.confirmarOperacion(Token, operacion, requiredLogin, method, param);
            } else {
                this.dataService.Spinner().hide('sp6');
                this.working = false;
                this.exporting = false;
                if (!requiredLogin) {
                    this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
                    });
                } else {
                    this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                        this.dataService.Storage().passportUILogin();
                    });
                }
                return;
            }
        });
    }

    private confirmarOperacion(token: any, operacion: TablaAccionesPassport, requiredLogin: boolean, method: TablaMetodosRotacion, parametro?: any) {
        const parametroPermiso = this.dataService.Storage().getParamAccion(operacion);
        if (!parametroPermiso) {
            this.dataService.Spinner().hide('sp6');
            this.working = false;
            this.exporting = false;
            this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
            });
            return;
        }
        const param = this.dataService.Cifrado().PassportEncode(token, parametroPermiso);
        this.dataService.Passport().getAutorizacion(param).pipe(
            catchError((e) => { return  this.configCatch(e);        }),
            finalize(() => {
            })
        ).subscribe((response: PassportAutorizacionModel) => {
            if (response && !response.HasErrors) {
                const data = response.Data[0];
                if (data.ESTA_AUTORIZADO) {
                    switch (method) {
                        case TablaMetodosRotacion.GET_FILTROS_PROCESO: {
                            this.handleComboFiltro();
                            break;
                        }
                        case TablaMetodosRotacion.GRID_PROCESOS_ETAPAS: {
                            this.handleBuscarProcesosRotacion();
                            break;
                        }
                        case TablaMetodosRotacion.EXPORTAR_PROCESOS_ETAPAS: {
                            this.handleExportarProcesosRotacion();
                            break;
                        }
                        case TablaMetodosRotacion.PROCESO_POSTULACION_PLAZAS: {
                            this.handleProcesoPostulacionPlaza(parametro);
                            break;
                        }
                        case TablaMetodosRotacion.PROCESO_POSTULANTES: {
                            this.handleProcesoPustulante(parametro);
                            break;
                        }
                        case TablaMetodosRotacion.PROCESO_CALIFICACIONES: {
                            this.handleProcesoCalificacion(parametro);
                            break;
                        }
                        case TablaMetodosRotacion.PROCESO_ADJUDICACIONES: {
                            this.handleProcesoAdjudicar(parametro);
                            break;
                        }
                    }
                } else {
                    this.dataService.Spinner().hide('sp6');
                    this.working = false;
                    this.exporting = false;
                    if (!requiredLogin) {
                        this.dataService.Message().msgWarning(PASSPORT_MESSAGE.PERMISO_NOT_FOUND, () => {
                        });
                    } else {
                        this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                    }
                    return;
                }
            } else {
                this.working = false;
                this.exporting = false;
                this.dataService.Spinner().hide('sp6');
                this.dataService.Message().msgInfo(PASSPORT_MESSAGE.BUTTON_UNAUTHORIZED, () => {
                    this.dataService.Storage().passportUILogin();
                });
            }
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

export class RotacionDataSource extends DataSource<IRotacionGridModel> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(true);
        if (!data.anio) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.loadData(data, pageIndex, pageSize);
        }
    }

    private loadData(data: any, pageIndex, pageSize) {
        const rolSelected = this.dataService.Storage().getPassportRolSelected();
        this.dataService
            .Rotacion()
            .getListaEtapasProceso(data, pageIndex, pageSize)
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
                        this.totalregistro = 0;
                        this._dataChange.next([]);
                        this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PROCESOS / ETAPAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
                        });
                    } else if (response[0].codigoCentroTrabajo === rolSelected.CODIGO_SEDE) {
                        this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistros;
                        this._dataChange.next(response || []);
                    } else {
                        this.totalregistro = 0;
                        this._dataChange.next([]);
                        this.dataService.Message().msgAutoCloseWarning('"LA BÚSQUEDA FUE ALTERADO, POR SU SEGURIDAD SE CERRARÁ SU SESIÓN."', 3000, () => {
                            this.dataService.Storage().passportUILogin();
                        });
                    }
                } else {
                    this.totalregistro = 0;
                    this._dataChange.next([]);
                    this.dataService.Message().msgWarning('"OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR PROCESOS / ETAPAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
                    });
                }
            });
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
