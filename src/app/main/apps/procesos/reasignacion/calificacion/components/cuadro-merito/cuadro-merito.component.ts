import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter  } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { TablaPermisos, TipoOperacionEnum } from 'app/core/model/types';
import { saveAs } from 'file-saver';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray } from 'lodash';
import { Observable, Subscription, Subject, of, BehaviorSubject } from 'rxjs';
import { takeUntil, catchError, finalize, filter } from 'rxjs/operators';
import { ReasignacionesModel, MaestroPermisoCalificacionModel } from "../../../models/reasignaciones.model";
import { MENSAJES, EtapaFaseEnum } from '../../../_utils/constants';
import { RegistrarReclamoVerComponent } from '../../components/registrar-reclamo-ver/registrar-reclamo-ver.component';
import { RegistroCalificacionesComponent } from '../registro-calificaciones/registro-calificaciones.component';
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
    selector: 'minedu-cuadro-merito',
    templateUrl: './cuadro-merito.component.html',
    styleUrls: ['./cuadro-merito.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CuadroMeritoComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    @Input() idEtapaProceso:any;
    @Input() idAlcanceProceso:any;
    @Input() selectedTabIndex: any; 
    @Input() permisoCalificacion: MaestroPermisoCalificacionModel;   
    @Input() proceso: ReasignacionesModel; 
    // @Output() onBuscar: EventEmitter<boolean>;  

    permisos: any;
    private btnBuscarSubscription: Subscription;
    // proceso: ReasignacionesModel;
    etapaFase = EtapaFaseEnum;
    dialogRef: any;
    working = false;

    displayedColumnsPlazas: string[] = [
        'registro',
        'causal',
        'etapa',
        'nivelEducativo',
        'ordenMerito',
        'documento',
        'nombresApellidos',
        'codigoPlaza',
        'cargoActual',
        'centroTrabajo',
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
        codigoEtapa: null
    };

    /*
    *-------------------------------------------------------------------------------------------------------------
    * VARIABLES CUADRO DE MÉRITO
    *-------------------------------------------------------------------------------------------------------------
    */
    dataSourceCuadroMerito: CuadroMeritoDataSource | null;
    selectionConvocadas = new SelectionModel<any>(true, []);
    @ViewChild('paginatorConvocadas', { static: true }) paginatorConvocadas: MatPaginator;

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
        // this.onBuscar = new EventEmitter<boolean>();
    }

    ngOnInit(): void {
        setTimeout((_) => this.buildShared());
        this.activeRoute.data.subscribe((data) => {
            if (data) {
                // this.proceso = data.ProcesoEtapa;
                this.buildGrid();
            }
        });

        this.sharedService.onDataSharedRotacionPermisoCalificacion
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(permisoCalificacion => {
                   this.permisos = permisoCalificacion;
            });
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridCuadroMerito());
    }

    private buildGrid() {
        this.dataSourceCuadroMerito = new CuadroMeritoDataSource(this.dataService, this.sharedService);

        this.buildPaginators(this.paginatorConvocadas);
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
        this.paginatorConvocadas.page.subscribe(() => this.getDataGridCuadroMerito());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridCuadroMerito(); }, 0);
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

    /*
       *-------------------------------------------------------------------------------------------------------------
       * OPERACIONES CUADRO DE MÉRITOS
       *-------------------------------------------------------------------------------------------------------------
       */

    private getDataGridCuadroMerito = () => {
        this.setRequest();
        this.dataSourceCuadroMerito.load(
            this.request,
            this.paginatorConvocadas.pageIndex + 1,
            this.paginatorConvocadas.pageSize,
            this.selectedTabIndex
        );
    };

    handleMigrarInformacionEtapaAnterior = () => {
        const data = {
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            // codigoSede: this.dataService.Storage().getInformacionUsuario().codigoSede,
            usuarioCreacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento,
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA MIGRAR LOS POSTULANTES DE LA ETAPA ANTERIOR? </b>", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .migrarInformacionEtapaAnterior(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.getDataGridCuadroMerito();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD, () => { });
                    }
                });
        }, () => { });
    }

    handleMigrarPostulantesEtapaAnterior = () => {
        const data = {
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            // codigoSede: this.dataService.Storage().getInformacionUsuario().codigoSede,
            usuarioCreacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento,
            codigoEtapa : this.proceso?.codigoEtapaFase
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA MIGRAR LOS POSTULANTES DE LA ETAPA ANTERIOR? </b>", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .migrarPostulantesEtapaAnterior(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.getDataGridCuadroMerito();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD, () => { });
                    }
                });
        }, () => { });
    }

    handleGenerarOrdenMerito = () => {
        const data = {
            idEtapaProceso:  +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            usuarioModificacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento
            // codigoSede: this.dataService.Storage().getPassportRolSelected().CODIGO_SEDE
        };
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA GENERAR EL ORDEN DE MÉRITO DE LA CALIFICACIÓN DE LOS POSTULANTES?", () => {

            this.dataService.Spinner().show('sp6');
            this.dataService.Reasignaciones()
                .generarOrdenMeritoCalificacionPostulante(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => {
                        this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        if(response > 0){
                            this.getDataGridCuadroMerito();
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                        }
                    }else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD, () => { });
                    }
                });


        }, () => { });
    };

    handlePublicarCuadroMerito = () => {
        const data = {
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            usuarioModificacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento
            // codigoSede: this.dataService.Storage().getInformacionUsuario().codigoSede
        };
        this.dataService.Message().msgConfirm(MENSAJES.MENSAJE_CONFIRMACION_PUBLICACION_CUADRO_MERITO, () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .publicarCalificacionPostulanteCuadroMerito(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        if(response >0){
                            this.getDataGridCuadroMerito();
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO,MENSAJES.DURACION, () => {});
                        }
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD, () => {});
                    }
                });
        }, () => { });
    }

    handleVerCuadroMerito = () => {
        this.dataService.Spinner().show('sp6');
        const data = {
            idEtapaProceso: +this.idEtapaProceso
        }
        this.dataService
            .Reasignaciones()
            .getBuscarDocumentoPublicadoCalificacionCuadroMerito(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e); }),
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
                        .msgWarning(
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                            () => {}
                        );
                }
            });
    }

    handleDescargarAdjunto(row) {
        if (!row.codigo) {
            this.dataService
                .Message()
                .msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_DOCUMENTO_ADJUNTO, () => {}
                );
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
                     saveAs(response, 'cuadro_merito.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            MENSAJES.MENSAJE_PROBLEMA_DOCUMENTO_ADJUNTO,() => {}
                        );
                }
            });
    }

    handleExportarCuadroMerito = () => {
        if (this.dataSourceCuadroMerito.data.length === 0) {
            this.dataService
                .Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR,() => {});
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .exportarCalificacionesCuadroMerito(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'cuadro_meritos.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,() => {});
                }
            });
    };

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
            this.getDataGridCuadroMerito();
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
            codigoEtapa : this.proceso?.codigoEtapaFase
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
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}


export class CuadroMeritoDataSource extends DataSource<any> {
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
            .getCalificacionesCuadroMeritoGrid(data, pageIndex, pageSize)
            .pipe(
                // catchError((e) => { return  this.configCatch(e);        }),
                catchError((e) => {
                    const { developerMessage } = e;
                    this.dataService.Message().msgWarning(developerMessage, () => { });
                    return of(null);
                }),
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
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, () => {});
            }
        } else {
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_PROBLEMAS_INFORMACION_CRITERIOS_BUSQUEDA, () => { });
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
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}