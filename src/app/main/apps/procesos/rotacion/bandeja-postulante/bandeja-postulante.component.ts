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
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { BandejaPostulanteRegistrarComponent } from './bandeja-postulante-registrar/bandeja-postulante-registrar.component';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';
import { descargarExcel } from 'app/core/utility/functions';
import { BusquedaDocumentoIdentidadComponent } from '../components/busqueda-documento-identidad/busqueda-documento-identidad.component';
import { MENSAJES, TablaEstadosDesarrolloProceso, TablaTipoDocumentoIdentidad, EstadoPostulacion } from '../_utils/constants';
import { BandejaPostulanteAccionesComponent } from './bandeja-postulante-acciones/bandeja-postulante-acciones.component';
import { MaestroPermisoPostulacionModel } from '../models/rotacion.model';
import { isArray } from 'lodash';

@Component({
    selector: 'minedu-bandeja-postulante',
    templateUrl: './bandeja-postulante.component.html',
    styleUrls: ['./bandeja-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations, 
})
export class BandejaPostulanteComponent implements OnInit, OnDestroy, AfterViewInit {

    form: FormGroup;
    proceso: RotacionModel;
    aprobado: boolean = false;
    estadoIniciado: boolean = false;

    dialogRef: any;
    working = false;
    maximo: number = 8;

    combo = {
        tiposDocumentoIdentidad: [],
        tiposRegistro: [],
        estadosPostulante: [],
    };

    request = {
        idEtapaProceso: null,
        idDesarrolloProceso: null,
        idTipoDocumentoIdentidad: null,
        numeroDocumentoIdentidad: null,
        numeroExpediente: null,
        idTipoRegistro: null,
        idEstadoPostulacion: null,
    };
    permisoPostulacion: MaestroPermisoPostulacionModel = {
        idMaestroPermisoPostulacion: null,
        idMaestroEtapaProceso: null,
        idRolPassport: null,
        idTipoSede: null,
        nuevoPostulante: null,
        aprobarPostulante: null,
        editarPostulante: null,
        eliminarPostulante: null,
        solicitarInformeEscalafonario: null,
    };
    estadoPostulacion = EstadoPostulacion;
    
    /*
      *-------------------------------------------------------------------------------------------------------------
      * VARIABLES GRID POSTULANTES
      *-------------------------------------------------------------------------------------------------------------
      */

    displayedColumns: string[] = [
        'registro',
        'numeroDocumento',
        'nombresCompletos',
        'numeroExpediente',
        'codigoPlazaActual',
        'cargo',
        'categoriaRemunerativa',
        'centroTrabajo',
        'tipoRotacion',
        'estado',
        'acciones',
    ];
    paginatorPageSize = 10;
    paginatorPageIndex = 0;

    dataSource: PostulantesDataSource | null;
    selection = new SelectionModel<any>(true, []);
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;


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
                this.validarPublicacion();
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
        this.buildGrid();
        this.getMaestroPermisoPostulacion();
    }


    private buildGrid() {
        this.dataSource = new PostulantesDataSource(this.dataService, this.sharedService);
        this.buildPaginators(this.paginator);
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
        this.paginator.page.subscribe(() => this.getDataGridPostulantes());
        setTimeout(() => { this.getDataGridPostulantes(); }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    buildForm = () => {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            numeroExpediente: [null],
            idTipoRegistro: [null],
            idEstadoPostulante: [null],
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

    private getDataGridPostulantes = () => {
        this.dataService.Spinner().show('sp6');
        this.working = true;
        this.setRequest();
        this.dataSource.load(this.request, this.paginator.pageIndex + 1, this.paginator.pageSize);
    };


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
                this.dataService.Rotacion().getTiposRegistro(),
                this.dataService.Rotacion().getEstadosPostulacion()
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

            const tiposRegistro = response[1];
            if (tiposRegistro) {
                tiposRegistro.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.combo.tiposRegistro = tiposRegistro;
            }

            const estadosPostulacion = response[2];
            if (estadosPostulacion) {
                estadosPostulacion.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.combo.estadosPostulante = estadosPostulacion;
            }
        });
    }


    handleNuevoPostulante = () => {
        this.dialogRef = this.materialDialog.open(BandejaPostulanteRegistrarComponent,
            {
                panelClass: 'registrar-postulante-form',
                disableClose: true,
                data: {
                    permiteBuscar: true,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idPostulacion: null,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridPostulantes();
        });
    };

    private validarPublicacion = () => {
        const idEtapaProceso = this.proceso.idEtapaProceso;
        const idDesarrolloProceso = this.proceso.idDesarrolloProceso;
        this.dataService
            .Rotacion()
            .getValidarPublicacion(idEtapaProceso, idDesarrolloProceso)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).subscribe((response: any) => {
                this.aprobado = response;
            });
    }

    handleAprobarPostulantes = () => {
        const data = { 
            idEtapaProceso: this.proceso.idEtapaProceso, 
            idDesarrolloProceso: this.proceso.idDesarrolloProceso
        };
        this.dataService.Message().msgConfirm("<b>¿ESTÁ SEGURO QUE DESEA APROBAR EL LISTADO DE POSTULANTES?</b><br/> Al aprobar el Listado de Postulantes no podra agregar, modificar y/o eliminar postulantes de este proceso.", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Rotacion()
                .aprobarPostulacion(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, 3000, () => { 
                            this.getDataGridPostulantes();
                            this.validarPublicacion();
                        });
                    } else {
                        this.dataService.Message().msgWarning('"ERROR AL PROCESAR LA INFORMACIÓN "', () => { });
                    }
                });

        }, () => { });

    };

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
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
            .exportarPostulacion(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'postulaciones.xlsx');
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

    handleModificar = (row) => {
        this.dialogRef = this.materialDialog.open(BandejaPostulanteRegistrarComponent,
            {
                panelClass: 'registrar-postulante-form',
                disableClose: true,
                data: {
                    permiteBuscar: false,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idPostulacion: row.idPostulacion,
                    idDesarrolloProceso: this.proceso.idDesarrolloProceso
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridPostulantes();
        });
    }

    handleEliminar = (row) => {
        this.dialogRef = this.materialDialog.open(BandejaPostulanteAccionesComponent,
            {
                panelClass: 'acciones-postulante-form',
                disableClose: true,
                data: {
                    permiteEliminar: true,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idPostulacion: row.idPostulacion,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridPostulantes();
        });
    }

    handleInformacionPostulacion = (row) => {
        this.dialogRef = this.materialDialog.open(BandejaPostulanteAccionesComponent,
            {
                panelClass: 'acciones-postulante-form',
                disableClose: true,
                data: {
                    permiteEliminar: false,
                    idEtapaProceso: this.proceso.idEtapaProceso,
                    idPostulacion: row.idPostulacion,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (!resp) {
                return;
            }
            this.getDataGridPostulantes();
        });
    };

    /*
    *-------------------------------------------------------------------------------------------------------------
    * OPERACIONES ADICIONALES
    *-------------------------------------------------------------------------------------------------------------
    */

    handleRetornar = () => {
        this.router.navigate(['../../../'], { relativeTo: this.activeRoute });
    };

    handleLimpiar = (): void => this.resetForm();


    handleBuscar = (): void => this.getDataGridPostulantes();


    resetForm = () => {
        this.form.reset();
    };

    private setRequest = () => {
        this.request = {
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value == 0 ? null : this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            numeroExpediente: this.form.get('numeroExpediente').value,
            idTipoRegistro: this.form.get('idTipoRegistro').value == 0 ? null : this.form.get('idTipoRegistro').value,
            idEstadoPostulacion: this.form.get('idEstadoPostulante').value == 0 ? null : this.form.get('idEstadoPostulante').value,
        };
    };

    getMaestroPermisoPostulacion = () => {
        const codigoRol = this.dataService.Storage().getPassportRolSelected().CODIGO_ROL;
        const data = {
            codigoRolPassport: codigoRol,
            idEtapaProceso: this.proceso.idEtapaProceso,
            idDesarrolloProceso: this.proceso.idDesarrolloProceso,
            idTipoSede: 1 // TODO: reemplazar
        };
        this.dataService
            .Rotacion()
            .getMaestroPermisoPostulacion(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                this.permisoPostulacion = response;
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


export class PostulantesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(true);
        this.dataService.Rotacion()
            .getGridPostulacion(data, pageIndex, pageSize)
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
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_RESULTADO, () => {
            });
        } else {
            this.dataService.Message().msgWarning('"OCURRIERON PROBLEMAS AL PROCESAR LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
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

