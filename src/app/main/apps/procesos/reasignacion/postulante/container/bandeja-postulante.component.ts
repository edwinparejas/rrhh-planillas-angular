import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaPermisos, TipoOperacionEnum } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EtapaProcesoResponseModel, EtapaResponseModel, OpcionFiltro } from '../../models/reasignacion.model';
import { RegimenLaboralEnum, EstadoPostulacionEnum, TipoFormatoPlazaEnum } from '../../_utils/constants';
import { AgregarPostulanteComponent } from '../components/agregar-postulante/agregar-postulante.component';
import { isArray } from 'lodash';
import { descargarExcel } from 'app/core/utility/functions';
import { MENSAJES, TablaTipoDocumentoIdentidad } from '../../_utils/constants';
import { BuscarServidorPublicoComponent} from '../../components/buscar-servidor-publico/buscar-servidor-publico.component';
import { BuscarPlazaComponent} from '../../components/buscar-plaza/buscar-plaza.component';
import { ReasignacionesModel } from "../../models/reasignaciones.model";
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
    selector: 'minedu-bandeja-postulante',
    templateUrl: './bandeja-postulante.component.html',
    styleUrls: ['./bandeja-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPostulanteComponent implements OnInit, OnDestroy, AfterViewInit {

    proceso: ReasignacionesModel; 
    working = false;
    form: FormGroup;
    export = false;
    editable: boolean;
    aprobado: boolean = false;
    idep: number;
    idEtapaProceso: number;
    idAlcanceProceso: number;
    idServidorPublicoSelected: number;
    regimenLaboral = RegimenLaboralEnum;
    comboLists = {
        listTipoDocumento: [],
        listCausal: [],
        listEtapaPostulante: [],
        listEstadoPostulacion: [],
    };
    desactivarDocumentoIdentidad:boolean = true;

    displayedColumns: string[] = [
        'registro',
        'documento',
        'apellido_nombre',
        'numero_expediente',
        'causal',
        'etapa',
        'codigo_plaza',
        'centro_trabajo',
        'nivel_educativo',
        'area_curricular',
        'estado_postulante',
        'tipo_registro',
        'acciones',
    ];
    estadoPostulacion = EstadoPostulacionEnum;
    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    dataSource: PostulantesDataSource | null;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    private _unsubscribeAll: Subject<any>;
    selection = new SelectionModel<any>(true, []);
    dialogRef: any;
    opcionFiltro: OpcionFiltro = new OpcionFiltro();

    request = {
        idEtapaProceso: null,
        idAlcanceProceso: null,
        numeroDocumentoIdentidad: null,
        idTipoDocumentoIdentidad: null,
        codigoPlaza: null,
        numeroExpediente: null,
        idTipoRegistro: null,
        idCausal: null,
        idEtapaPostulacion: null,
        idEstadoPostulacion: null,
        codigoSede: null
    };
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false
    };
    currentSession: SecurityModel = new SecurityModel();
    isMobile = false;
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
    ) { 
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        this.idEtapaProceso = parseInt(this.route.snapshot.params.paramIdEtapaProceso);
        this.idAlcanceProceso = parseInt(this.route.snapshot.params.paramIdAlcanceProceso);
        setTimeout(_ => this.buildShared());

        this.route.data.subscribe((data) => {
            if (data) {
                this.validarPublicacion();
                this.buildGrid();
            }
        });
        this.buildForm();
        this.handleResponsive();
        this.buildSeguridad();
        this.loadTipodocumento();
        this.loadCausal();
        this.loadEtapaPostulante();
        this.loadEstadosPostulacion();
        this.obtenerCabeceraProcesoEtapa();
        this.lengthDocumento("");
        this.resetForm();
        this.form.controls['numeroDocumentoIdentidad'].disable();
        this.desactivarDocumentoIdentidad = true;
    }

    private buildGrid() {
        this.dataSource = new PostulantesDataSource(this.dataService);
        this.buildPaginators(this.paginator);
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

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Reasignación / Postulantes");
        this.sharedService.setSharedTitle("Desarrollo de Reasignación");
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() => this.buscarListPostulantes());
        setTimeout(() => { this.dataService.Spinner().show('sp6'); this.buscarListPostulantes(); }, 0);
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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
                this.proceso.idAlcanceProceso = this.idAlcanceProceso;
                this.obtenerEstadoDesarrolloEtapa();
                this.handleBuscar();
                // this.obtenerEstadovalidacionPlaza();            
            });
    };

    loadData(pageIndex, pageSize): void {
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idTipoDocumentoIdentidad: [null],
            numeroDocumentoIdentidad: [null],
            codigoPlaza: [null],
            numeroExpediente: [null],
            idCausal: [null],
            idEtapaPostulacion: [null],
            idEstadoPostulacion: [null],
        });
    }

    resetForm = () => {
        this.form.reset();
        this.form.get('idTipoDocumentoIdentidad').setValue(null);
        this.form.get('idCausal').setValue(null);
        this.form.get('idEtapaPostulacion').setValue(null);
        this.form.get('idEstadoPostulacion').setValue(null);
    }

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
                    // this.desarrolloProceso = response;
                    this.proceso.estadoProceso = response.estadoDesarrollo;
                    this.proceso.idDesarrolloProceso = response.idDesarrolloProceso;
                }
            });
    };

    private validarPublicacion = () => {
        const data = {
            idEtapaProceso : +this.idEtapaProceso,
            idAlcanceProceso : +this.idAlcanceProceso
            // codigoSede : this.currentSession.codigoSede
        }
        this.dataService
            .Reasignaciones()
            .getValidarPublicacion(data)
            .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).subscribe((response: any) => {
                this.aprobado = response;
            });
    }

    handleLimpiar(): void {
        this.resetForm();
        this.form.controls['numeroDocumentoIdentidad'].disable();
        this.desactivarDocumentoIdentidad = true;
        this.buscarListPostulantes();
    }

    setRequest = () => {
        this.request = {
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso,
            numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
            idTipoDocumentoIdentidad: this.form.get('idTipoDocumentoIdentidad').value,
            codigoPlaza: this.form.get('codigoPlaza').value,
            numeroExpediente: this.form.get('numeroExpediente').value,
            idTipoRegistro: null,
            idCausal: this.form.get('idCausal').value,
            idEtapaPostulacion:  this.form.get('idEtapaPostulacion').value,
            idEstadoPostulacion: this.form.get('idEstadoPostulacion').value,
            codigoSede:this.currentSession.codigoSede
        }
    }

    // buscarListPostulantes = (fistTime: boolean = false) => {
    //     this.setRequest();
    //     if (fistTime) {
    //         this.dataSource.load(this.request, 1, 10, true);
    //     } else {
    //         this.dataSource.load(
    //             this.request,
    //             this.paginator.pageIndex + 1,
    //             this.paginator.pageSize);
    //     }
    // }

    private buscarListPostulantes = () => {
        this.dataService.Spinner().show('sp6');
        this.working = true;
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    };

    handleBuscar = (): void => this.buscarListPostulantes();

    // handleBuscar(): void {
    //     this.buscarListPostulantes(true);
    // }

    handleAprobarPostulantesOld = () => {
        const aprobar = {
            operacion: 'APROBAR',
            idpr: Number(this.idep),
            usuario: this.currentSession.nombreUsuario
            // ip_modi: this.ipAddress
        }
        this.dataService.Message().msgConfirm('<b>¿Esta seguro que desea aprobar el Listado de Postulantes?</b><br/>' +
            'Al aprobar el Listado de Postulantes no podra agregar postulantes para este proceso.', () => {
                this.dataService.Reasignaciones()
                    .getAprobarPostulantes(aprobar)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            this.buscarListPostulantes();
                            this.dataService.Spinner().hide('sp6');
                            // this.buscarListPostulantes(true);
                        })
                    ).subscribe(response => {
                        if (response.messages) {
                            this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                        } else if ([]) {
                            this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.', 3000, () => { });
                        }
                    });
            })
    }

    handleAprobarPostulantes = () => {
        const data = {
            idEtapaProceso: +this.idEtapaProceso,
            idAlcanceProceso: +this.idAlcanceProceso
            // codigoSede: this.currentSession.codigoSede
        }
        this.dataService.Message().msgConfirm("<b>¿ESTÁ SEGURO QUE DESEA APROBAR EL LISTADO DE POSTULANTES?</b><br/> Al aprobar el Listado de Postulantes no podra agregar, modificar y/o eliminar postulantes de este proceso.", () => {
            this.dataService.Spinner().show('sp6');
            this.dataService
                .Reasignaciones()
                .aprobarPostulacion(data)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => { this.dataService.Spinner().hide('sp6'); })
                ).subscribe((response: any) => {
                    if (response) {
                        // this.buscarListPostulantes(true);
                        this.buscarListPostulantes();
                        this.validarPublicacion();
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});
                    } else {
                        this.dataService.Message().msgError(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
                    }
                });

        }, () => { });

    };

    handleExportarOld = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning('No se encontró información para para exportar.', () => { });
            return;
        }

        const reExport = {
            id: Number(this.idep)
        };
        console.log(reExport);
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .exportarPostulantes(reExport)
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    // this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'Postulantes de Plaza Reasignacion N° ' + this.idep + '.xlsx');
                    this.dataService.Message().msgAutoSuccess('Se procedio a realizar la descarga de <b>Reasignacion</b>', 3000, () => { });
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresado',
                            () => { }
                        );
                }
            });
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(
                    MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR,
                    () => {}
                );
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.setRequest();
        this.dataService
            .Reasignaciones()
            .exportarPostulacion(this.request)
            .pipe(
                catchError((e) => { return  this.configCatch(e); }),
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
                            MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                            () => {
                            }
                        );
                }
            });
    };

    handleRetornar = () => {
        this.router.navigate(['../../../'], { relativeTo: this.route });
    }

    busquedaServidorPublicoDialog = () =>{
        const form = this.form.value;
        if(form.idTipoDocumentoIdentidad != null){
            const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.id === form.idTipoDocumentoIdentidad);
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
        }
    }

    buscarPlazas = () => {
        this.handleBuscar();
    }

    busquedaPlazaDialog = ($event) => {
        this.dialogRef = this.materialDialog.open(BuscarPlazaComponent,
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

    loadTipodocumento = () => {
        this.dataService.Reasignaciones()
            .getComboTipodocumento()
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
                    this.comboLists.listTipoDocumento = data;
                    this.comboLists.listTipoDocumento.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    lengthDocumento(event): void {
        const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
        const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.value === idTipoDocumentoIdentidad);
    
        switch (tipoDocumentoIdentidad?.codigo) {
    
        case TablaTipoDocumentoIdentidad.DNI:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("minlength", "8");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "8");
            this.form.controls['numeroDocumentoIdentidad'].enable();
            this.desactivarDocumentoIdentidad = false;
            break;
    
        case TablaTipoDocumentoIdentidad.PASAPORTE:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("minlength", "12");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "12");
            this.form.controls['numeroDocumentoIdentidad'].enable();
            this.desactivarDocumentoIdentidad = false;
            break;
    
        case TablaTipoDocumentoIdentidad.CARNET_DE_EXTRANJERIA:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("minlength", "15");
            document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "15");
            this.form.controls['numeroDocumentoIdentidad'].enable();
            this.desactivarDocumentoIdentidad = false;
            break;
            
          default:
            this.form.get('numeroDocumentoIdentidad').setValue("");
            // document.getElementById('numeroDocumentoIdentidad').setAttribute("maxlength", "8");
            this.form.controls['numeroDocumentoIdentidad'].disable();
            this.desactivarDocumentoIdentidad = true;
            break;
        }
    }
    
    onKeyOnlyNumbers(e) {
        const idTipoDocumentoIdentidad = this.form.get("idTipoDocumentoIdentidad").value;
        let permiteIngreso = true;
        const tipoDocumentoIdentidad = this.comboLists.listTipoDocumento.find(pred => pred.value === idTipoDocumentoIdentidad);

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

    loadEstadosPostulacion = () => {
        this.dataService.Reasignaciones()
            .getComboEstadosPostulacion()
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
                    this.comboLists.listEstadoPostulacion = data;
                    this.comboLists.listEstadoPostulacion.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    handleNuevo(): void {
        this.dialogRef = this.materialDialog.open(AgregarPostulanteComponent, {
            panelClass: 'agregar-postulante-dialog',
            width: '70%',
            disableClose: true,
            data: {
                action: 'registrar',
                idOperacion: TipoOperacionEnum.Registrar,
                idPostulacion: 0,
                idEtapaProceso:this.proceso.idEtapaProceso,
                idProceso: this.proceso.idProceso,
                idDesarrolloProceso: this.proceso.idDesarrolloProceso,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((response) => {
            this.dataService.Spinner().hide('sp6');
            if (response?.registrado) {
                this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION,() => {});
                this.handleBuscar();
            }
        });
    }

    handleEditar = (row) => {
        this.dialogRef = this.materialDialog.open(AgregarPostulanteComponent, {
            panelClass: 'agregar-postulante-dialog',
            width: '70%',
            disableClose: true,
            data: {
                action: 'editar',
                idOperacion: TipoOperacionEnum.Modificar,
                idPostulacion: row.idps,
                idEtapaProceso:this.proceso.idEtapaProceso,
                tipoDocumento: row.id_tipo_documento,
                numeroDocumento: row.numero_documento,
                idProceso: this.proceso.idProceso,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.registrado) {
                this.handleBuscar();
            }
        });
    }

    handleEliminarOld = (row) => {
        let aprobar = {
            operacion: 'ELIMINAR',
            idpr: Number(row.idps),
            usuario: '',
            ip_modi: ''
        }
        this.dataService.Message().msgConfirm('¿Esta seguro que desea ELIMINAR al Postulante<br/>' +
            '<b>' + row.apellido_nombre + '</b>?', () => {
                this.dataService.Reasignaciones()
                    .getAprobarPostulantes(aprobar)
                    .pipe(
                        catchError((e) => of(e)),
                        finalize(() => {
                            // this.dataService.Spinner().hide('sp6');
                            // this.buscarListPostulantes(true);
                            this.buscarListPostulantes();
                        })
                    ).subscribe(response => {
                        if (response.messages) {
                            this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                        } else if ([]) {
                            this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.', 3000, () => { });
                        }
                    });
            })
    }

    handleEliminar = (row) => {

        const passport = this.dataService.Storage().getInformacionUsuario();
    
        const model = {
            idPostulacion: row.idps,
            idEtapaProceso:this.proceso.idEtapaProceso,
            usuarioCreacion: passport.numeroDocumento
        }
    
        this.dataService.Message().msgConfirm("<b>¿ESTA SEGURO QUE DESEA ELIMINAR EL REGISTRO?</b>.", () => {
          this.working = true;
          this.dataService.Spinner().show('sp6');
          this.dataService
            .Reasignaciones()
            .eliminarPostulacion(model)
            .pipe(
              catchError((e) => { return  this.configCatch(e);        }),
              finalize(() => { 
                this.buscarListPostulantes();
                this.dataService.Spinner().hide('sp6'); 
                this.working = false; 
                })
            ).subscribe((response: any) => {
              if (response) {
                if(response.type == undefined || response.type != "error"){
                this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});

                }else{
                    this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
                }
              } else {
                this.dataService.Message().msgWarning(MENSAJES.MENSAJE_ERROR_AL_PROCESAR_OPERACION, () => { });
              }
            });
    
        }, () => { });
    
    };

    handleInformacion = (row: any, i) => {
        this.dialogRef = this.materialDialog.open(AgregarPostulanteComponent, {
            panelClass: 'agregar-postulante-dialog',
            width: '70%',
            disableClose: true,
            data: {
                action: 'ver',
                idOperacion: TipoOperacionEnum.Ver,
                idPostulacion: row.idps,
                idEtapaProceso:this.proceso.idEtapaProceso,
                tipoDocumento: row.id_tipo_documento,
                numeroDocumento: row.numero_documento,
                idProceso: this.proceso.idProceso,
                currentSession: this.currentSession
            },
        });
        this.dialogRef.afterClosed().subscribe((resp) => {
            if (resp?.registrado) {
                this.handleBuscar();
            }
        });
    }

    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    private configCatch(e: any) { 
        if (e && e.status === 400 && isArray(e.messages)) {
          this.dataService.Util().msgWarning(e.messages[0], () => { });
        } else if(isArray(e.messages)) {
                if((e.messages[0]).indexOf(MENSAJES.MENSAJE_PROBLEMA_SOLICITUD)!=-1)
                    this.dataService.Util().msgError(e.messages[0], () => { }); 
                else
                    this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                    
        }else{
            this.dataService.Util().msgError(MENSAJES.MENSAJE_ERROR_SERVIDOR, () => { });
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
    public aprobados = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firsTime = false): void {
        this._loadingChange.next(false);
        // if (!firsTime) this.dataService.Spinner().show('sp6');
        if (data.anio === null && data.idServidorPublico === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Reasignaciones()
                .getListPostulantes(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this._loadingChange.next(false);
                        if (!firsTime) this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response);
                    this.totalregistro =
                        response.length === 0
                            ? 0
                            : response[0].total_rows;
                    this.aprobados = 0;
                    for (let i = 0; i < response.length; i++) {
                        if (response[i].estado_postulacion === "Aprobado") {
                            this.aprobados++;
                        }
                    }
                    if (response.length === 0) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                '"NO SE ENCONTRÓ INFORMACIÓN DE LO(S) POSTULANTE(S) PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
                                () => { }
                            );
                    }
                });
        }

        /* this._dataChange.next(data);
        this.totalregistro = 0; */
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
