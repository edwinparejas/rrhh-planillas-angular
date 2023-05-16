import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { RotacionModel } from 'app/core/model/rotacion.model';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray } from 'lodash';
import { MENSAJES } from '../../_utils/constants';
import { Observable, Subscription, Subject, of, BehaviorSubject } from 'rxjs';
import { takeUntil, catchError, finalize, filter } from 'rxjs/operators';
import { MaestroPermisoCalificacionModel } from '../../models/rotacion.model';
import { ObservarPostulanteVerComponent } from '../components/observar-postulante-ver/observar-postulante-ver.component';
import { ObservarPostulanteComponent } from '../components/observar-postulante/observar-postulante.component';
import { RegistrarReclamoVerComponent } from '../components/registrar-reclamo-ver/registrar-reclamo-ver.component';
import { RegistrarReclamoComponent } from '../components/registrar-reclamo/registrar-reclamo.component';
import { RegistroCalificacionesComponent } from '../registro-calificaciones/registro-calificaciones.component';
import { EstadoCuadroMeritoFinal } from '../../_utils/constants';
import { DocumentViewerComponent } from 'app/main/apps/components/document-viewer/document-viewer.component';

@Component({
    selector: 'minedu-cuadro-merito-final',
    templateUrl: './cuadro-merito-final.component.html',
    styleUrls: ['./cuadro-merito-final.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CuadroMeritoFinalComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input()
    form: FormGroup;
    @Input() btnBuscar: Observable<void>;
    private btnBuscarSubscription: Subscription;
    proceso: RotacionModel;
    @Input() permisoCalificacion: MaestroPermisoCalificacionModel;    
    dialogRef: any;
    working = false;

    //Constantes Modal Dinamico
    _TIPO_MODAL_REGISTRAR = 1;
    _TIPO_MODAL_EDITAR = 2;
    _TIPO_MODAL_VERINFO = 3;

    displayedColumnsPlazas: string[] = [
        'registro',
        'tipoRotacion',
        'ordenMerito',
        'documento',
        'nombresApellidos',
        'cargoActual',
        'centroProcedencia',
        'primerAlternativa',
        'segundaAlternativa',
        'terceraAlternativa',
        'puntajeTotal',
        'estado',
        'conReclamo',
        'acciones',
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    request = {
        idEtapaProceso: null,
        idDesarrolloProceso: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        idTipoRotacion: null,
        idEstadoCalificacion: null,
    };
    estadoCuadroMeritFinal = EstadoCuadroMeritoFinal;
    nombreDocumento: string="";

    /*
    *-------------------------------------------------------------------------------------------------------------
    * VARIABLES PLAZAS A CONVOCAR
    *-------------------------------------------------------------------------------------------------------------
    */
    dataSourceConvocadas: ConvocadasDataSource | null;
    selectionConvocadas = new SelectionModel<any>(true, []);
    @ViewChild('paginatorConvocadas', { static: true }) paginatorConvocadas: MatPaginator;
    paramIdProceso: any;
    paramIdDesarrolloProceso: any;
    tieneCalificacionFinal: any;

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
                ).subscribe(permisoCalificacion => {
                    this.permisoCalificacion.publicadoPreliminar = permisoCalificacion.publicadoPreliminar
                    this.permisoCalificacion.publicadoFinal = permisoCalificacion.publicadoFinal,
                    this.tieneCalificacionFinal = permisoCalificacion.tieneCalificacionFinal
                });
            
        this.btnBuscarSubscription = this.btnBuscar.subscribe(() => this.getDataGridFinal());
        this.paramIdProceso = +this.activeRoute.snapshot.params.paramIdProceso;
        this.paramIdDesarrolloProceso = +this.activeRoute.snapshot.params.paramIdDesarrolloProceso;
    }

    private buildGrid() {
        this.dataSourceConvocadas = new ConvocadasDataSource(this.dataService, this.sharedService);

        this.buildPaginators(this.paginatorConvocadas);
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
        this.paginatorConvocadas.page.subscribe(() => this.getDataGridFinal());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.getDataGridFinal(); }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this.btnBuscarSubscription.unsubscribe();
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de rotación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de rotación');
    }

    /*
       *-------------------------------------------------------------------------------------------------------------
       * OPERACIONES PLAZAS A CONVOCAR
       *-------------------------------------------------------------------------------------------------------------
       */

    private getDataGridFinal = () => {
        this.setRequest();
        this.dataSourceConvocadas.load(
            this.request,
            this.paginatorConvocadas.pageIndex + 1,
            this.paginatorConvocadas.pageSize
        );
    };

    handleGenerarOrdenMeritoFinal = () => {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            usuarioCreacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento,
            codigoRolPassport: this.dataService.Storage().getPassportRolSelected().CODIGO_ROL
        };
        this.dataService.Message().msgConfirm("¿ESTÁ SEGURO QUE DESEA GENERAR EL ORDEN DE MÉRITO DE LA CALIFICACIÓN DE LOS POSTULANTES?", () => {

            this.dataService.Spinner().show('sp6');
            this.dataService.Rotacion()
                .generarOrdenMeritoCalificacionPostulanteFinal(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => {
                        this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
                            this.getDataGridFinal();
                        });
                    }
                });


        }, () => { });
    };

    handlePublicarCuadroMeritoFinal = () => {
        const data = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            usuarioCreacion: this.dataService.Storage().getInformacionUsuario().numeroDocumento,
        };
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA PUBLICAR EL CUADRO DE MÉRITO FINAL? </b><br/>  Al publicar, se generara el listado de las postulantes en formato EXCEL", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .publicarCalificacionPostulanteFinal(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
                            this.getDataGridFinal();
                        });
                    } else {
                        this.dataService.Message().msgWarning('"ERROR AL PUBLICAR EL CUADRO DE MÉRITO PRELIMINAR "', () => { });
                    }
                });
        }, () => { });
    }

    handleVerCuadroMeritoFinal = () => {
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .excelCalificacionPostulanteFinal(this.proceso.idEtapaProceso, this.proceso.idDesarrolloProceso)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'cuadro de merito final.xlsx');
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

    handleExportarPlazasConvocadas = () => {
        if (this.dataSourceConvocadas.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    '"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."',
                    () => {
                    }
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Rotacion()
            .exportarCalificacionesFinales(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'calificaciones_finales.xlsx');
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

    handleRegistrarCalificacion = (row) => {
        this.dialogRef = this.materialDialog.open(RegistroCalificacionesComponent,
            {
                panelClass: 'minedu-registro-calificaciones',
                disableClose: true,
                data: {
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                    idPostulacion: row.idPostulacion,
                    idCalificacion: row.idCalificacion,
                    idCalificacionDetalle: row.idCalificacionDetalle,
                    tipoModal: this._TIPO_MODAL_REGISTRAR
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridFinal();
        });
    }

    handleEditarCalificacion = (row) => {
        this.dialogRef = this.materialDialog.open(RegistroCalificacionesComponent,
            {
                panelClass: 'minedu-registro-calificaciones',
                disableClose: true,
                data: {
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                    idPostulacion: row.idPostulacion,
                    idCalificacion: row.idCalificacion,
                    idCalificacionDetalle: row.idCalificacionDetalle,
                    tipoModal: this._TIPO_MODAL_EDITAR
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridFinal();
        });
    }

    handleGoRegistrarCalificacion = (row) => {
        this.router.navigate(
            [
                "../../../registrarcalificacion/" +
                    row.idCalificacion +
                    "/" +
                    this._TIPO_MODAL_REGISTRAR + 
                    "/" + 
                    row.idCalificacionDetalle + 
                    "/" + 
                    row.idPostulacion + 
                    "/" + 
                    this.proceso.idEtapaProceso +
                    "/" +
                    this.paramIdProceso +
                    "/" +
                    this.paramIdDesarrolloProceso,
            ],
            { relativeTo: this.activeRoute }
        );       
    }

    handleGoEditarCalificacion = (row) => {
        this.router.navigate(
            [
                "../../../registrarcalificacion/" +
                    row.idCalificacion +
                    "/" +
                    this._TIPO_MODAL_EDITAR + 
                    "/" + 
                    row.idCalificacionDetalle + 
                    "/" + 
                    row.idPostulacion + 
                    "/" + 
                    this.proceso.idEtapaProceso +
                    "/" +
                    this.paramIdProceso +
                    "/" +
                    this.paramIdDesarrolloProceso,
            ],
            { relativeTo: this.activeRoute }
        );       
    }

    handleGoVerCalificacion = (row) => {
        this.router.navigate(
            [
                "../../../registrarcalificacion/" +
                    row.idCalificacion +
                    "/" +
                    this._TIPO_MODAL_VERINFO + 
                    "/" + 
                    row.idCalificacionDetalle + 
                    "/" + 
                    row.idPostulacion + 
                    "/" + 
                    this.proceso.idEtapaProceso +
                    "/" +
                    this.paramIdProceso +
                    "/" +
                    this.paramIdDesarrolloProceso,
            ],
            { relativeTo: this.activeRoute }
        );       
    }

    handleVerCalificacion = (row) => {
        this.dialogRef = this.materialDialog.open(RegistroCalificacionesComponent,
            {
                panelClass: 'minedu-registro-calificaciones',
                disableClose: true,
                data: {
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                    idPostulacion: row.idPostulacion,
                    idCalificacion: row.idCalificacion,
                    idCalificacionDetalle: row.idCalificacionDetalle,
                    tipoModal: this._TIPO_MODAL_VERINFO
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridFinal();
        });
    }

    handleObservar = (row) => {
        this.dialogRef = this.materialDialog.open(ObservarPostulanteComponent,
            {
                panelClass: 'minedu-observar-postulante',
                disableClose: true,
                data: {
                    idEtapaProceso: this.proceso.idEtapaProceso,
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
            this.getDataGridFinal();
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
                    idEtapaProceso: this.proceso.idEtapaProceso,
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
            this.getDataGridFinal();
        });
    }

    private setRequest = () => {
        this.request = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value == 0 ? null : this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idTipoRotacion: this.form.get('idTipoRotacion').value == 0 ? null : this.form.get('idTipoRotacion').value,
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
            this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }

      handleVerCuadroMeritoFinalPDF(file: string) {
        file = this.dataSourceConvocadas.codigoDocumento;
        if (!file) {
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ EL DOCUMENTO SOLICITADO."', () => { });
            return;
        }
        this.dataService.Spinner().show("sp6");
        this.dataService.Documento().descargar(file).pipe(
            catchError((e) => { this.dataService.SnackBar().msgError('Error, no se pudo acceder al servicio.', 'Cerrar'); return of(e); }),
            finalize(() => this.dataService.Spinner().hide("sp6"))
            ).subscribe(response => {
                if (response) {
                this.handlePreview(response, this.nombreDocumento);
            } else {
                this.dataService.Message().msgWarning('"NO SE PUDO OBTENER EL DOCUMENTO SOLICITADO."', () => { });
            }
        });
    }

    handlePreview(file: any, nameFile: string) {
        this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
            panelClass: 'modal-viewer-form-dialog',
            disableClose: true,
            data: {
                modal: {
                    icon: "remove_red_eye",
                    title: "Proceso Rotación - Plazas Publicadas",
                    file: file
                }
            }
        });
    
        this.dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (!response) {
                    return;
                }
                if (response.download) {
                    saveAs(file, nameFile + ".pdf");
                }
            }
        );
    }
}


export class ConvocadasDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;
    public codigoDocumento = '';

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().hide('sp6');
        this.dataService.Rotacion()
            .getCalificacionesFinalesGrid(data, pageIndex, pageSize)
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
                        const { calificaciones, permiso } = response;
                        this.sharedService.sendRotacionCalificacionPermiso(permiso);
                        this.codigoDocumento = calificaciones[0]?.codigoDocumento;
                        this.totalregistro = (calificaciones || []).length === 0 ? 0 : calificaciones[0].totalRegistros;
                        this._dataChange.next(calificaciones || []);
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
            this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE PLAZAS CONVOCADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => {
            });
        } else {
            this.dataService.Message().msgWarning('"OCURRIERON PROBLEMAS AL MOMENTO DE BUSCAR PLAZAS CONVOCADAS PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
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
            this.dataService.Util().msgError('"ERROR RECUPERANDO DATOS DEL SERVIDOR, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."', () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
}

function saveAs(file: any, arg1: string) {
    throw new Error('Function not implemented.');
}
