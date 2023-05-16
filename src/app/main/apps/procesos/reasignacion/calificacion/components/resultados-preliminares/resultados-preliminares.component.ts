import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { TablaPermisos, TipoOperacionEnum } from 'app/core/model/types';
import { ReasignacionesModel, MaestroPermisoCalificacionModel } from "../../../models/reasignaciones.model";
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray } from 'lodash';
import { Observable, Subscription, Subject, of, BehaviorSubject } from 'rxjs';
import { takeUntil, catchError, finalize, filter } from 'rxjs/operators';
import { MENSAJES } from '../../../_utils/constants';
import { saveAs } from 'file-saver';
import { ObservarPostulanteVerComponent } from '../../components/observar-postulante-ver/observar-postulante-ver.component';
import { ObservarPostulanteComponent } from '../../components/observar-postulante/observar-postulante.component';
import { RegistrarReclamoVerComponent } from '../../components/registrar-reclamo-ver/registrar-reclamo-ver.component';
import { RegistrarReclamoComponent } from '../../components/registrar-reclamo/registrar-reclamo.component';
import { RegistroCalificacionesComponent } from '../../components/registro-calificaciones/registro-calificaciones.component';
import { CodigoEstadoCalificacion } from 'app/core/model/types-reasignacion';
const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length == 0 || pageSize == 0) { return `0 de ${length}`; }   
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
  
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
        Math.min(startIndex + pageSize, length) :
        startIndex + pageSize;
  
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

@Component({
    selector: 'minedu-resultados-preliminares',
    templateUrl: './resultados-preliminares.component.html',
    styleUrls: ['./resultados-preliminares.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ResultadosPreliminaresComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    @Input() idEtapaProceso:any;
    @Input() idAlcanceProceso:any;
    @Input() permisoCalificacion: MaestroPermisoCalificacionModel;
    @Input() selectedTabIndex: any; 
    @Output() onBuscar: EventEmitter<boolean>;

    existeCalificacionPendiente: boolean = false;

    private btnBuscarSubscription: Subscription;
    permisos: any;
    proceso: ReasignacionesModel;
    dialogRef: any;
    working = false;

    displayedColumnsPlazas: string[] = [
        'registro',
        'causal',
        'etapa',
        'documento',
        'nombresApellidos',
        'codigoPlaza',
        'cargoActual',
        'centroTrabajo',
        'nivelEducativo',
        'puntajeTotal',
        'estado',
        'conReclamo',
        'acciones',
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    request = {
        idEtapaProceso: null,
        idAlcanceProceso: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        codigoPlaza: null,
        idCausal: null,
        idEtapaPostulacion: null,
        idEstadoCalificacion: null,
    };


    dataSourceCalificacionPreliminar: CalificacionPreliminarDataSource | null;
    selectionCalificacionPreliminar = new SelectionModel<any>(true, []);
    @ViewChild('paginatorCalificacionPreliminar', { static: true }) paginatorCalificacionPreliminar: MatPaginator;

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
        this.onBuscar = new EventEmitter<boolean>();
    }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.activeRoute.data.subscribe((data) => {
            if (data) {
                this.proceso = data.ProcesoEtapa;
                this.buildGrid();
            }       
        });
        
        this.sharedService.onDataSharedRotacionPermisoCalificacion
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(permisoCalificacion => this.permisos = permisoCalificacion);
            
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridPreliminar());
    }

    private buildGrid() {
        this.dataSourceCalificacionPreliminar = new CalificacionPreliminarDataSource(this.dataService, this.sharedService);

        this.buildPaginators(this.paginatorCalificacionPreliminar);
    }

    private buildPaginators(paginator: MatPaginator): void {
        paginator.showFirstLastButtons = true;
        paginator._intl.itemsPerPageLabel = 'Registros por página';
        paginator._intl.nextPageLabel = 'Siguiente página';
        paginator._intl.previousPageLabel = 'Página anterior';
        paginator._intl.firstPageLabel = 'Primera página';
        paginator._intl.lastPageLabel = 'Última página';
        paginator._intl.getRangeLabel = dutchRangeLabel;
    }

    ngAfterViewInit(): void {
        this.paginatorCalificacionPreliminar.page.subscribe(() => this.getDataGridPreliminar());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridPreliminar(); }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.btnBuscarSubscription.unsubscribe();
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de reasignación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de reasignación');
    }


    private getDataGridPreliminar = () => {
        this.setRequest();
        this.dataSourceCalificacionPreliminar.load(
            this.request,
            this.paginatorCalificacionPreliminar.pageIndex + 1,
            this.paginatorCalificacionPreliminar.pageSize,
            this.selectedTabIndex
        );

        this.getValidarCalificacionesPendientes();
    };

    claseSegunEstado = (codigoEstado: number) => {
        let clase = '';

        switch (codigoEstado) {
            case CodigoEstadoCalificacion.Pendiente:
                clase = 'badge-warning';
                break;

            case CodigoEstadoCalificacion.Apto:
                clase = 'badge-success';
                break;

            case CodigoEstadoCalificacion.NoApto:
                clase = 'badge-danger';
                break;

            case CodigoEstadoCalificacion.Observado:
                clase = 'badge-danger';
                break;

            default:
                clase = 'badge-default';
                break;
        }

        return clase;
    }

    handleGenerarOrdenMeritoPreliminar = () => {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            usuarioCreacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento,
            codigoRolPassport: this.dataService.Storage().getPassportRolSelected().CODIGO_ROL
        };
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA GENERAR EL ORDEN DE MÉRITO DE LA CALIFICACIÓN DE LOS POSTULANTES?", () => {

            this.dataService.Spinner().show('sp6');
            this.dataService.Rotacion()
                .generarOrdenMeritoCalificacionPostulante(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => {
                        this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        this.getDataGridPreliminar();
                    }
                });


        }, () => { });
    };

    handlePublicarResultadoPreliminar = () => {
        if(this.existeCalificacionPendiente == true){
            this.dataService.Message()
            .msgWarning('"EXISTEN CALIFICACIONES PENDIENTES."', () => {});
            return;
        }
        const data = {
            idEtapaProceso: Number(this.idEtapaProceso),
            idAlcanceProceso: +this.idAlcanceProceso,
            usuarioModificacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento
            // codigoSede: this.dataService.Storage().getInformacionUsuario().codigoSede
        };
        this.dataService.Message().msgConfirm(MENSAJES.MENSAJE_CONFIRMACION_PUBLICACION_PRELIMINAR, () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .publicarCalificacionPostulantePreliminar(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response > 0) {
                        //this.getDataGridPreliminar();
                        this.onBuscar.emit(true);
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION, () => {});
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD, () => { });
                    }
                });
        }, () => { });
    }

    handleVerResultadoPreliminar = () => {
        this.dataService.Spinner().show('sp6');
        const data = {
            idEtapaProceso: Number(this.idEtapaProceso)
        }
        this.dataService
            .Reasignaciones()
            .getBuscarDocumentoPublicadoCalificacionPreliminar(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);}),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.handleDescargarAdjunto(response);
                } else {
                    this.dataService
                    .Message()
                    .msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,() => {});
                }
            });
    }

    handleDescargarAdjunto(row) {
        if (!row.codigo) {
            this.dataService
                .Message()
                .msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_DOCUMENTO_ADJUNTO,() => {});
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService
            .Documento()
            .descargar(row.codigo)
            .pipe(
                catchError((e) => {
                    return of(e);
                }),
                finalize(() => this.dataService.Spinner().hide("sp6"))
            )
            .subscribe((response) => {
                if (response) {
                     saveAs(response, 'calificaciones preliminares.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            MENSAJES.MENSAJE_PROBLEMA_DOCUMENTO_ADJUNTO,
                            () => {}
                        );
                }
            });
    }

    handleExportarCalificacionesPreliminares = () => {
        if (this.dataSourceCalificacionPreliminar.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR,
                    () => {}
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .exportarCalificacionesPreliminares(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'resultados_preliminares.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                           MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                            () => {}
                        );
                }
            });
    };

    handleGoRegistrarCalificacion = (row) => {
        this.router.navigate(
            [
                "../../../registrarcalificacion/" +
                    row.idCalificacion +
                    "/" +
                    TipoOperacionEnum.Registrar,
            ],
            { relativeTo: this.activeRoute }
        );       
    };

    handleRegistrarCalificacion = (row) => {
        this.dialogRef = this.materialDialog.open(RegistroCalificacionesComponent,
            {
                panelClass: 'minedu-registro-calificaciones',
                disableClose: true,
                data: {
                    idOperacion: TipoOperacionEnum.Registrar,
                    idEtapaProceso: Number(this.idEtapaProceso),
                    idPostulacion: row.idPostulacion,
                    idCalificacion: row.idCalificacion,
                    idCalificacionDetalle: row.idCalificacionDetalle
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridPreliminar();
        });
    }

    handleGoVerCalificacion = (row) => {
        this.router.navigate(
            [
                "../../../registrarcalificacion/" +
                    row.idCalificacion +
                    "/" +
                    TipoOperacionEnum.Ver,
            ],
            { relativeTo: this.activeRoute }
        );       
    };

    handleVerCalificacion = (row) => {
        this.dialogRef = this.materialDialog.open(RegistroCalificacionesComponent,
            {
                panelClass: 'minedu-registro-calificaciones',
                disableClose: true,
                data: {
                    idOperacion: TipoOperacionEnum.Ver,
                    idEtapaProceso: Number(this.idEtapaProceso),
                    idPostulacion: row.idPostulacion,
                    idCalificacion: row.idCalificacion,
                    idCalificacionDetalle: row.idCalificacionDetalle,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridPreliminar();
        });
    }

    handleObservar = (row) => {
        this.dialogRef = this.materialDialog.open(ObservarPostulanteComponent,
            {
                panelClass: 'minedu-observar-postulante',
                disableClose: true,
                data: {
                    idEtapaProceso: Number(this.idEtapaProceso),
                    idPostulacion: row.idPostulacion,
                    idCalificacion: row.idCalificacion,
                    idCalificacionDetalle: row.idCalificacionDetalle
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridPreliminar();
        });
    }

    handleVerObservacion = (row) => {
        this.dialogRef = this.materialDialog.open(ObservarPostulanteVerComponent,
            {
                panelClass: 'minedu-observar-postulante-ver',
                disableClose: true,
                data: row,
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
        });
    }

    handleVerReclamo = (row) => {
        this.dialogRef = this.materialDialog.open(RegistrarReclamoVerComponent,
            {
                panelClass: 'minedu-registrar-reclamo-ver',
                disableClose: true,
                data: row,
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
        });
    }

    handleRegistrarReclamo = (row) => {
        this.dialogRef = this.materialDialog.open(RegistrarReclamoComponent,
            {
                panelClass: 'minedu-registrar-reclamo',
                disableClose: true,
                data: {
                    idEtapaProceso: Number(this.idEtapaProceso),
                    idPostulacion: row.idPostulacion,
                    idCalificacion: row.idCalificacion,
                    idCalificacionDetalle: row.idCalificacionDetalle
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            //this.getDataGridPreliminar();
            this.onBuscar.emit(true);
        });
    }

    getValidarCalificacionesPendientes = () => {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idAlcanceProceso: this.idAlcanceProceso
        };

        this.dataService.Reasignaciones()
            .getValidarCalificacionesPendientes(request)
            .pipe(
                catchError((e) => { return  this.configCatch(e); }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                this.existeCalificacionPendiente = (response > 0) ? true : false;
            });
    }

    private setRequest = () => {
        this.request = {
            idEtapaProceso: Number(this.idEtapaProceso),
            idAlcanceProceso: +this.idAlcanceProceso,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value == 0 ? null : this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            codigoPlaza: this.form.get('codigoPlaza').value,
            idCausal: this.form.get('idCausal').value,
            idEtapaPostulacion:  this.form.get('idEtapaPostulacion').value,
            idEstadoCalificacion: this.form.get('idEstadoCalificacion').value == 0 ? null : this.form.get('idEstadoCalificacion').value,
        };
    };

    configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}


export class CalificacionPreliminarDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize, selectedTabIndex: number): void {
        this.dataService.Spinner().hide('sp6');
        this.dataService.Reasignaciones()
            .getCalificacionesPreliminaresGrid(data, pageIndex, pageSize)
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
                    const { calificaciones, permiso } = response;
                    if (calificaciones.length == 0) {
                        this.sharedService.sendRotacionCalificacionPermiso(permiso);
                        this.gridResultMessage(selectedTabIndex);
                    } else {
                        this.sharedService.sendRotacionCalificacionPermiso(permiso);
                        this.totalregistro = (calificaciones || []).length === 0 ? 0 : calificaciones[0].totalRegistros;
                        this._dataChange.next(calificaciones || []);
                    }
                } else {
                    this.gridResultMessage(selectedTabIndex, false);
                }
            });
    }

    private gridResultMessage = (selectedTabIndex: number, emptyResult: boolean = true) => {
        this.totalregistro = 0;
        this._dataChange.next([]);
        if (emptyResult) {
            if(selectedTabIndex == 0){
                this.dataService
                .Message()
                .msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, () => {});
            }
        } else {
            this.dataService
            .Message()
            .msgWarning(MENSAJES.MENSAJE_PROBLEMAS_INFORMACION_CRITERIOS_BUSQUEDA, () => {                 
            });
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
    configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}