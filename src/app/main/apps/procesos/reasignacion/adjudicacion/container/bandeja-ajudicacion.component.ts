import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';   
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { BehaviorSubject, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, takeUntil, map } from 'rxjs/operators';
import { BuscarPlazaComponent } from '../../components/buscar-plaza/buscar-plaza.component';
import { TablaTipoDocumentoIdentidad, OpcionFiltro} from '../../models/reasignacion.model';
import { CodigoCentroTrabajoMaestroEnum, EstadoAdjudicacionEnum } from '../../_utils/constants';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ReasignacionesModel } from '../../models/reasignaciones.model';
import { validacionServidorPublicoComponent } from '../components/validacion-servidor-publico/validacion-servidor-publico.component';
import { NoAdjudicarPlazaComponent } from '../components/no-adjudicar-plaza/no-adjudicar-plaza.component';
import { VerObservacionComponent } from '../components/ver-observacion/ver-observacion.component';
import { SubsanarObservacionComponent } from '../components/subsanar-observacion/subsanar-observacion.component';
import { InformacionAdjudicacionComponent } from "../components/informacion-adjudicacion/informacion-adjudicacion.component";
import { DocumentViewerComponent } from '../../../../components/document-viewer/document-viewer.component';
import { BuscarCentroTrabajoComponent } from "../../components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { isArray } from 'lodash';
import { MENSAJES} from '../../_utils/constants';
import { CodigoEstadoAdjudicacion } from 'app/core/model/types-reasignacion';
import { BuscarServidorPublicoComponent} from '../../components/buscar-servidor-publico/buscar-servidor-publico.component';

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
    selector: 'minedu-bandeja-ajudicacion',
    templateUrl: './bandeja-ajudicacion.component.html',
    styleUrls: ['./bandeja-ajudicacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class BandejaAjudicacionComponent implements  OnInit, OnDestroy, AfterViewInit {

  
    form: FormGroup;
    proceso: ReasignacionesModel;
    idEtapaProceso: number;
    idAlcanceProceso: number;
    codSedeCabecera:string; 
    currentSession: SecurityModel = new SecurityModel();
    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    dialogRef: any;
    working = false;
    maximo: number = 8;
    estadoAdjudicacion = EstadoAdjudicacionEnum;
    desactivarDocumentoIdentidad:boolean = true;
    comboLists = {
        listTipoDocumentoIdentidad: [],
        listCausal: [],
        listEtapaPostulante: [],
        listEstadoAdjudicacion: [],
        listModalidadesEducativas: [],
        listNivelesEducativos: []
    };

    request = {
        idEtapaProceso: null,
        idAlcanceProceso: null,
        numeroDocumentoIdentidad: null,
        idTipoDocumentoIdentidad: null,
        codigoPlaza: null,
        codigoModular: null,
        anexoCentroTrabajo: null,
        idCausal: null,
        idEtapaPostulacion: null,
        idModalidadEducativa:null,
        idNivelEducativo:null,
        idEstadoAdjudicacion: null,
    };

    /*
      *-------------------------------------------------------------------------------------------------------------
      * VARIABLES GRID ADJUDICACIONES
      *-------------------------------------------------------------------------------------------------------------
      */
    displayedColumns: string[] = [
        'registro',
        'causal',
        // 'modalidad',
        'nivel',
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

    estadoDesarrollo:any;
    
    permiso:any = {};
    resumen:any = {};

    private _unsubscribeAll: Subject<any>;
    constructor(
        private activeRoute: ActivatedRoute,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.buildSeguridad();
        this.idEtapaProceso = parseInt(this.route.snapshot.params.paramIdEtapaProceso);
        this.idAlcanceProceso = parseInt(this.route.snapshot.params.paramIdAlcanceProceso);
        this.codSedeCabecera = CodigoCentroTrabajoMaestroEnum.MINEDU; 
        this.obtenerCabeceraProcesoEtapa();
        setTimeout((_) => { this.buildShared(); this.getCombos(); });
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
        ).subscribe(informacionAdjudicacion => {
               this.resumen = informacionAdjudicacion.resumen;
               this.permiso = informacionAdjudicacion.permiso;
        });
        
        this.sharedService.onWorking
            .pipe(
                filter(value => {
                    return value !== null;
                }),
                takeUntil(this._unsubscribeAll)
            ).subscribe(working => this.working = working);

        this.buildForm();
        this.form.controls['numeroDocumentoIdentidad'].disable();
        this.desactivarDocumentoIdentidad = true;
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    obtenerCabeceraProcesoEtapa = () => {
        this.dataService
            .Reasignaciones()
            .getDatosProcesoEtapaById(this.idEtapaProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                this.proceso = response;   
                this.obtenerEstadoDesarrolloEtapa();            
            });
    };

    obtenerEstadoDesarrolloEtapa = () => {
        this.dataService
            .Reasignaciones()
            .obtenerEstadoDesarrolloEtapaProceso(this.idEtapaProceso, this.idAlcanceProceso)
            .pipe(
                catchError(() => of([])),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                if (response) {
                    this.proceso.estadoProceso = response.estadoDesarrollo;
                    this.proceso.idDesarrolloProceso = response.idDesarrolloProceso;
                    // this.getMaestroPermisoCalificacion();  
                }
            });
    };

    private buildGrid() {
        this.dataSourceAdjudicacion = new AdjudicacionesDataSource(this.dataService, this.sharedService);
        this.buildPaginators(this.paginatorAdjudicacion);
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
            idCausal: [null],
            idEtapaPostulacion: [null],
            idModalidadEducativa: [null],
            idNivelEducativo: [null],
            idEstadoAdjudicacion: [null],
        });

        this.form.get("idTipoDocumentoIdentidad").valueChanges.subscribe((value) => {
            if (value) {
                this.validarTipoDocumentoIdentidad(value);
            }
        });

        this.form.get("idModalidadEducativa").valueChanges.subscribe((value) => {
            if (!value || value == "-1") return false;
            this.loadNivelesEducativos(value);
        });
    };

    buildShared() {
        this.sharedService.setSharedBreadcrumb('Procesos de reasignación');
        this.sharedService.setSharedTitle('Desarrollo de procesos de reasignación');
    }

    claseSegunEstado = (codigoEstado: number) => {
        let clase = '';

        switch (codigoEstado) {
            case CodigoEstadoAdjudicacion.Pendiente:
                clase = 'badge-warning';
                break;

            case CodigoEstadoAdjudicacion.Adjudicado:
                clase = 'badge-success';
                break;

            case CodigoEstadoAdjudicacion.NoAdjudicado:
                clase = 'badge-danger';
                break;

            case CodigoEstadoAdjudicacion.Observado:
                clase = 'badge-danger';
                break;

            default:
                clase = 'badge-default';
                break;
        }

        return clase;
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
        const tipoDocumentoIdentidad = this.comboLists.listTipoDocumentoIdentidad.find(pred => pred.id === value);
        let validatorNumeroDocumento = null;
        switch (tipoDocumentoIdentidad?.codigo) {
            case TablaTipoDocumentoIdentidad.DNI:
                this.maximo = 8;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[0-9]*$"),
                ]);
                this.form.controls['numeroDocumentoIdentidad'].enable();
                this.desactivarDocumentoIdentidad = false;
                break;
            case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
                this.maximo = 12;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[a-zA-Z0-9]*$"),
                ]);
                this.form.controls['numeroDocumentoIdentidad'].enable();
                this.desactivarDocumentoIdentidad = false;
                break;
            case TablaTipoDocumentoIdentidad.PASAPORTE:
                this.maximo = 12;
                validatorNumeroDocumento = Validators.compose([
                    Validators.minLength(this.maximo),
                    Validators.maxLength(this.maximo),
                    Validators.pattern("^[a-zA-Z0-9]*$"),
                ]);
                this.form.controls['numeroDocumentoIdentidad'].enable();
                this.desactivarDocumentoIdentidad = false;
                break;
            default:
                this.maximo = 8;
                this.form.controls['numeroDocumentoIdentidad'].disable();
                this.desactivarDocumentoIdentidad = true;
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
        const tipoDocumentoIdentidad = this.comboLists.listTipoDocumentoIdentidad.find(pred => pred.id === idTipoDocumentoIdentidad);
        switch (tipoDocumentoIdentidad?.codigo) {
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
        const tipoDocumentoIdentidad = this.comboLists.listTipoDocumentoIdentidad.find(pred => pred.id === form.idTipoDocumentoIdentidad);
        const idTipoDocumentoIdentidad = tipoDocumentoIdentidad.codigo;
        const numeroDocumentoIdentidad = form.numeroDocumentoIdentidad;

        this.dialogRef = this.materialDialog.open(BuscarServidorPublicoComponent,
            {
                panelClass: 'buscar-servidor-publico',
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
            this.form.patchValue({ idTipoDocumentoIdentidad: resp.idTipoDocumentoIdentidad });
            this.form.patchValue({ numeroDocumentoIdentidad: resp.numeroDocumentoIdentidad });
        });
        // this.dialogRef = this.materialDialog.open(BusquedaDocumentoIdentidadComponent,
        //     {
        //         panelClass: 'buscar-documento-identidad',
        //         disableClose: true,
        //         data: {
        //             idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
        //             numeroDocumentoIdentidad: numeroDocumentoIdentidad,
        //         },
        //     }
        // );
        // this.dialogRef.afterClosed().subscribe((resp) => {
        //     if (!resp) {
        //         return;
        //     }
        //     this.form.patchValue({ numeroDocumentoIdentidad: resp.numeroDocumentoIdentidad });
        // });
    };


    private getCombos = () => {
        this.loadCausal();
        this.loadModalidadesEducativas();
        forkJoin(
            [
                this.dataService.Reasignaciones().getComboTipodocumento(),
                this.dataService.Reasignaciones().getComboEstadosAdjudicacion(),
            ]
        ).pipe(
            catchError((e) => {
                const { developerMessage } = e;
                this.dataService.Message().msgWarning(developerMessage, () => { });
                return of([]);
            }),
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
                    id: 0,
                    codigo: 0,
                    descripcion: 'TODOS',
                });
                this.comboLists.listTipoDocumentoIdentidad = tiposDocumentoIdentidad;
                this.form.controls['idTipoDocumentoIdentidad'].setValue(this.comboLists.listTipoDocumentoIdentidad[1].idCatalogoItem);
            }


            const estadosAdjudicacion = response[1];
            if (estadosAdjudicacion) {
                estadosAdjudicacion.splice(0, 0, {
                    idCatalogoItem: 0,
                    codigoCatalogoItem: 0,
                    abreviaturaCatalogoItem: 'TODOS',
                    descripcionCatalogoItem: 'TODOS',
                });
                this.comboLists.listEstadoAdjudicacion = estadosAdjudicacion;
            }
        });
    }

    loadCausal = () => {
        this.dataService.Reasignaciones()
            .getComboCausal()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.id,
                        label: `${x.descripcion}`,
                    }));
                    this.comboLists.listCausal = data;
                    this.comboLists.listCausal.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    loadModalidadesEducativas = () => {
        let request = {idModalidadEducativa:null};
            this.dataService
                .Reasignaciones()
                .getModalidadEducativa()
                .pipe(
                    catchError(() => of([])),
                    map((response: any) => response)
                )
                .subscribe((response) => {
                    if (response) {
                        this.comboLists.listModalidadesEducativas = response;
                        this.form.controls["idModalidadEducativa"].setValue("-1");
                        this.form.controls["idNivelEducativo"].setValue("-1");
                    }
                });
    };

    loadNivelesEducativos = (idModalidadEducativa:number) => {
    let request = {idModalidadEducativa:idModalidadEducativa};
        this.dataService
            .Reasignaciones()
            .getComboNivelEducativa(idModalidadEducativa)
            .pipe(
                catchError(() => of([])),
                map((response: any) => response)
            )
            .subscribe((response) => {
                if (response) {
                    this.comboLists.listNivelesEducativos = response;
                    this.form.controls["idNivelEducativo"].setValue("-1");
                }
            });
    };

    loadEtapaPostulante = () => {
        this.dataService.Reasignaciones()
          .getComboEtapaPostulante()
          .pipe(
            catchError(() => of([])),
            finalize(() => { })
          )
          .subscribe((response: any) => {
            if (response) {
              const data = response.map((x) => ({
                ...x,
                value: x.id,
                label: `${x.descripcion}`,
              }));
              this.comboLists.listEtapaPostulante = data;
              this.comboLists.listEtapaPostulante.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
            }
          });
    }

    busquedaPlazas = () => {

    };

    busquedaPlazasDialog = ($event) => {
        this.dialogRef = this.materialDialog.open(
            BuscarPlazaComponent,
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
            this.dataService.Message().msgWarning('DEBE INGRESAR UN CÓDIGO MODULAR PARA REALIZAR LA BÚSQUEDA.', () => {
            });
            return;
        }
        if (codigoCentroTrabajo.length < 6 || codigoCentroTrabajo.length > 7) {
            this.dataService.Message().msgWarning('CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON (6 a 7) DÍGITOS.', () => {
            });
            return;
        }

        const data = {
            codigoCentroTrabajo: codigoCentroTrabajo.trim(),
            codigoNivelInstancia: parseInt(this.dataService.Storage().getCurrentUser().codigoNivelInstancia)
        };

        this.dataService.Spinner().show('sp6');
        this.dataService.Rotacion().getListCentroTrabajo(data, 1, 10).pipe(
            catchError((e) => {
                const { developerMessage } = e;
                this.dataService.Message().msgWarning(developerMessage, () => { });
                return of(null);
            }),
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
                    this.dataService.Message().msgAutoInfo('SE ENCONTRÓ MÁS DE UN REGISTRO PARA EL CÓDIGO MODULAR INGRESADO, SELECCIONE UN REGISTRO', 3000, () => {
                    });
                } else {
                    this.dataService.Message().msgWarning('NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS', () => {
                    });
                }
            } else {
                this.dataService.Message().msgError('OCURRIERON ALGUNOS PROBLEMAS AL BUSCAR EL CENTRO DE TRABAJO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS.', () => {
                });
            }
        });
    }

    private handleCentroTrabajoDialog(registros: any[]) {
        // this.dialogRef = this.materialDialog.open(
        //     BusquedaCentroTrabajoComponent,
        //     {
        //         panelClass: 'buscar-centro-trabajo-form',
        //         width: '1300px',
        //         disableClose: true,
        //         data: {
        //             registrado: false,
        //             centrosTrabajo: registros,
        //             permiteBuscar: registros.length === 0
        //         },
        //     }
        // );

        // this.dialogRef.afterClosed().subscribe((response) => {
        //     if (!response) {
        //         return;
        //     }
        //     this.setCentroTrabajo(response);
        // });
    }

    busquedaCentroTrabajoPersonalizada = () => {
        this.dialogRef = this.materialDialog.open(
            BuscarCentroTrabajoComponent,
            {
                panelClass: "buscar-centro-trabajo-dialog",
                width: "1200px",
                disableClose: true,
                data: {
                    action: "requerimiento",
                    tipoSede: this.currentSession.codigoTipoSede,
                    codigoSede: this.currentSession.codigoSede
                },
            }
        );

        this.dialogRef.afterClosed().subscribe((result) => {
            if (result != null) {
                this.form.get("codigoModular").setValue(result.centroTrabajo.codigo_centro_trabajo);
            }
        });
    };

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
                .Reasignaciones()
                .finalizarAdjudicacion(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        if(response > 0){
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                            this.getDataGridAdjudicacion();
                        }
                    } else {
                        this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
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
                .Reasignaciones()
                .finalizarEtapaProceso(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        if(response > 0){
                            this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => { });
                            this.getDataGridAdjudicacion();
                        }
                    } else {
                        this.dataService.Message().msgWarning('Error al procesar la operación ', () => { });
                    }
                });
        }, () => { });
    }

    handleExportarAdjudicacion = () => {
        if (this.dataSourceAdjudicacion.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR,
                    () => {
                    }
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .exportarAdjudicaciones(this.request)
            .pipe(
                catchError((e) => of(null)),
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
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                            () => {
                            }
                        );
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
            this.dataService.Util().msgError(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
        }
        this.dataService.Spinner().hide("sp6");
        return of(e) 
      }
    /*
     *-------------------------------------------------------------------------------------------------------------
     * OPERACIONES GRID ADJUDICACION
     *-------------------------------------------------------------------------------------------------------------
     */


    handleGoAdjudicarPlaza = (row) => {
        this.dataService.Spinner().show('sp6');
        // this.dataService
        //     .Reasignaciones()
        //     .getValidarAdjudicacionPorOrden({ idEtapaProceso: this.proceso.idEtapaProceso })
        //     .pipe(
        //         catchError((e) => { 
        //             const { developerMessage } = e;
        //             this.dataService.Message().msgWarning(developerMessage, () => { });
        //             return of(null);
        //         }),
        //         finalize(() => { this.dataService.Spinner().hide('sp6'); })
        //     ).subscribe((response: any) => {
        //         if(row.idAdjudicacion != response.idAdjudicacion){
        //             var mesaje = 'La siguiente persona adjudicar debe ser la persona '+ response.nombreCompleto + ' con ' + response.documentoIdentidad;
        //             this.dataService.Message().msgWarning(mesaje, () => { });
        //         }
        //         else{
                    this.dataService
                        .Reasignaciones()
                        .getValidarActualizacionServidorPublico({ idPostulacion: row.idPostulacion, idEtapaProceso: this.proceso.idEtapaProceso })
                        .pipe(
                            catchError((e) => { 
                                const { developerMessage } = e;
                                this.dataService.Message().msgWarning(developerMessage, () => { });
                                return of(null);
                            }),
                            finalize(() => { this.dataService.Spinner().hide('sp6'); })
                        ).subscribe((response: any) => {
                            var tieneDiferencias = (response.listaDiferencia.filter(f=>f.esDiferente==true).length > 0);
                            if(tieneDiferencias === true){
                                this.handleValidarServidorPublico(row, response);
                            }
                            else {
                                this.router.navigate(
                                    [
                                        "../../../adjudicarplaza/" +
                                            row.idCalificacion +
                                            "/" +
                                            row.idAdjudicacion,
                                    ],
                                    { relativeTo: this.route }
                                );
                            }
                        });
                    // }
            // });
        
    };

    handleValidarServidorPublico = (row, response) => {
        this.dialogRef = this.materialDialog.open(
            validacionServidorPublicoComponent,
            {
                panelClass: 'minedu-validacion-servidor-publico',
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
            //this.getDataGridAdjudicacion();
            this.router.navigate(
                [
                    "../../adjudicarplaza/" +
                        row.idCalificacion +
                        "/" +
                        row.idAdjudicacion,
                ],
                { relativeTo: this.route }
            );
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

    handleVerObservacion = (row) => {
        let _tipo = 1;
        let observacion = row.observacionNoAdjudicacion;
        if(row.detalleSubsanacion != '' && row.detalleSubsanacion != null){
            if(row.codigoEstadoAdjudicacion == EstadoAdjudicacionEnum.ADJUDICADO || row.codigoEstadoAdjudicacion == EstadoAdjudicacionEnum.NO_ADJUDICADO) {
                _tipo = 2;
                observacion = row.detalleSubsanacion;
            }
        }
        this.dialogRef = this.materialDialog.open(
            VerObservacionComponent,
            {
                panelClass: 'minedu-ver-observacion',
                disableClose: true,
                data: {
                    tipo:_tipo,
                    observacion: observacion
                }
            }
        );
    }
    
    handleVerRowObservacion = (row) => {
        if(row.permiteVerObservacion == true) {
            return true;
        }
        if(row.detalleSubsanacion !== null && row.detalleSubsanacion !== undefined) {
            if(row.codigoEstadoAdjudicacion == EstadoAdjudicacionEnum.ADJUDICADO || row.codigoEstadoAdjudicacion == EstadoAdjudicacionEnum.NO_ADJUDICADO) {
                return true;
            }
        }
        return false;
    }
    handleVerTitleRowObservacion= (row) => {
        if(row.detalleSubsanacion !== null && row.detalleSubsanacion !== undefined) {
            if(row.codigoEstadoAdjudicacion == EstadoAdjudicacionEnum.ADJUDICADO || row.codigoEstadoAdjudicacion == EstadoAdjudicacionEnum.NO_ADJUDICADO) {
                return 'Ver Subsanación';
            }
        }
        return 'Ver Obsevación';
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
                    idPlaza: row.idPlaza,
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

    handleInformacion = (row) => {
        // console.log("data", row);

        this.dialogRef = this.materialDialog.open(
            InformacionAdjudicacionComponent,
            {
                panelClass: "informacion-adjudicacion-dialog",
                width: "1080px",
                disableClose: true,
                data: {
                    idAdjudicacion: row.idAdjudicacion,
                    AdjuncacionRow: row,
                },
            }
        );
        this.dialogRef.afterClosed().subscribe((resp) => {});
    };

    handleVerAdjunto(row) {
        if (!row.codigoDocumento) {
            this.dataService
                .Message()
                .msgWarning(
                    "EL REGISTRO NO TIENE DOCUMENTO DE SUSTENTO ADJUNTADO.",
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
                            "NO SE PUDO OBTENER EL DOCUMENTO DE SUSTENTO.",
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
        this.form.controls['numeroDocumentoIdentidad'].disable();
        this.desactivarDocumentoIdentidad = true;
    };

    private setRequest = () => {
        this.request = {
            idEtapaProceso: this.idEtapaProceso,
            idAlcanceProceso: this.idAlcanceProceso,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value == 0 ? null : this.form.get('idTipoDocumentoIdentidad').value,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            codigoPlaza: this.form.get('codigoPlaza').value,
            codigoModular: this.form.get('codigoModular').value,
            anexoCentroTrabajo: this.form.get('anexoCentroTrabajo').value,
            idCausal: this.form.get('idCausal').value,
            idEtapaPostulacion:  this.form.get('idEtapaPostulacion').value,
            idModalidadEducativa: this.form.get('idModalidadEducativa').value == "-1" ? null : this.form.get('idModalidadEducativa').value,
            idNivelEducativo: this.form.get('idNivelEducativo').value == "-1" ? null : this.form.get('idNivelEducativo').value,
            idEstadoAdjudicacion: this.form.get('idEstadoAdjudicacion').value == 0 ? null : this.form.get('idEstadoAdjudicacion').value,
        };
    };

}



export class AdjudicacionesDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService, private sharedService: SharedService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this.dataService.Spinner().hide('sp6');
        this.dataService.Reasignaciones()
            .getAdjudicacionesGrid(data, pageIndex, pageSize)
            .pipe(
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
                    const { adjudicaciones, resumen, permiso } = response;
                    const informacion ={resumen,permiso};
                    if (adjudicaciones.length == 0) {
                        this.sharedService.sendRotacionCalificacionPermiso(informacion);
                        this.gridResultMessage();
                    } else {
                        this.sharedService.sendRotacionCalificacionPermiso(informacion);
                        this.totalregistro = (adjudicaciones || []).length === 0 ? 0 : adjudicaciones[0].totalRegistros;
                        this._dataChange.next(adjudicaciones || []);
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
            this.dataService.Message().msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA, () => {
            });
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
}
