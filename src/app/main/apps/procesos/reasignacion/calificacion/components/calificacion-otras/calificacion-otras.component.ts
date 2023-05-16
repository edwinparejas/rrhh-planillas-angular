import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ResultadoOperacionEnum, TablaConfiguracionSistema } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { EtapaResponseModel } from '../../../models/reasignacion.model';
import { EstadoCalificacionEnum, EtapaFaseEnum } from '../../../_utils/constants';
import { saveAs } from 'file-saver';
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
    selector: 'minedu-calificacion-otras',
    templateUrl: './calificacion-otras.component.html',
    styleUrls: ['./calificacion-otras.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class CalificacionFinalComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() selectedTabIndex: number;

    paginatorPageSize = 10;
    paginatorPageIndex = 0;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    selection = new SelectionModel<any>(true, []);
    @Input() etapaResponse: EtapaResponseModel;
    dataSource: CalificacionDataSource | null;
    estadoCalificacion = EstadoCalificacionEnum;
    etapaFase = EtapaFaseEnum;
    datos = {
        idRequerimiento: null
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
    dialogRef: any;

    request: any;
    displayedColumns: string[] = [
        'registro',
        'causal',
        'numeroDocumentoIdentidad',
        'nombreCompleto',
        'codigoPlaza',
        'descripcionCargo',
        'centroTrabajo',
        'descripcionModalidad',
        'descripcionNivelEducativo',
        // 'descripcionAreaCurricular',
        'puntajeTotal',
        'descripcionEstado',
        'conReclamo',
        'acciones',
    ];
    export = false;
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private sharedService: SharedService,
        private materialDialog: MatDialog,
    ) { }


    ngOnInit(): void {
        this.dataSource = new CalificacionDataSource(this.dataService);
        this.buildSeguridad();
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.paginator._intl.getRangeLabel = dutchRangeLabel;
        this.handleResponsive();
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(
                (this.paginator.pageIndex + 1).toString(),
                this.paginator.pageSize.toString()
            )
        );
    }

    ngOnDestroy(): void { }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    loadData(pageIndex, pageSize): void {
        // this.setRequest();        
        console.log("this.setRequest()", this.request());
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    actualizarLista = (request: any) => {
        this.request = request;
        this.handleBuscar(false);
        console.log(this.selectedTabIndex)
    }

    handleBuscar = (fistTime: boolean = false) => {
        //this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize);
    }

    handleCargaMasiva = () => {
        if (0 == 0) { // this.totalCalificacionesProcesoEtapa TODO
            this.datos.idRequerimiento = 0;
            console.log("this.route", this.route);
            const param = this.routeGenerator(this.datos);
            this.router.navigate([param, 'cargamasiva'], { relativeTo: this.route });
        } else {
            this.dataService.Message().msgWarning('No se puede cargar calificaciones. Ya existen calificaciones para el proceso y etapa ', () => { });
        }
    }


    private routeGenerator = (data: any): string => {
        let formatoFiltrar = 0;
        let codigoFuncionalidad = 9;
        const param =
            (TablaConfiguracionSistema.PERSONAL + "").padStart(3, "0") +
            (codigoFuncionalidad + "").padStart(4, "0") +
            String(this.etapaResponse.codigoProceso).padStart(10, "0") +
            String(this.etapaResponse.codigoEtapa).padStart(10, "0") +
            String(formatoFiltrar).padStart(10, "0");
        console.log("param", param);
        return param;
    };


    handleEliminarMasivo = () => {
        let message = '<strong>¿Eliminar todos los registros cargados de forma masiva?</strong><br>';
        message = message + ' Al eliminar todos los registros cargados de forma masiva no podran recuperarse';
        Swal.fire({
            title: '',
            html: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d84d2a',
            cancelButtonColor: '#333333',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.value) {
                this.eliminarCalificaciones();
            }
        });
    }

    handleCafilicarAutomatica = () => {
        const request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgConfirm('¿Está seguro de que desea calificar automáticamente?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Reasignaciones().calificarAutomatica(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                })
            ).subscribe(response => {
                if (response && response.result) {
                    this.dataService.Message().msgInfo(resultMessage, () => { });
                    this.handleBuscar();
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al calcular automáticamente.', () => { });
                }
            });
        }, (error) => { });
    }

    eliminarCalificaciones() {
        var data = {
            idProceso: Number(this.etapaResponse.idProceso),
            idEtapa: Number(this.etapaResponse.idEtapa),
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        let message = 'Eliminado';
        message = message + 'Se eliminó satisfactoriamente.';
        this.dataService.Spinner().show('sp6'); //  TODO
        this.dataService.Reasignaciones()
            .eliminarMasivo(data)
            .pipe(
                catchError((e) => of(e)),
                finalize(() => { this.dataService.Spinner().hide('sp6'); })
            ).subscribe((response: any) => {

                if (response && response.result) {
                    this.dataService.Message().msgSuccess('Se eliminó satisfactoriamente.', () => { });
                    this.handleBuscar();
                    // this.geTotalCalificaciones();
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                }
                else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { });
                }
            });        
    }

    handlePublicarCalificacion = () => {
        const request = {
            idProceso: this.etapaResponse.idProceso,
            idEtapa: this.etapaResponse.idEtapa,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgConfirm('¿Está seguro de que desea publicar la lista?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Reasignaciones().publicarCalificacion(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                })
            ).subscribe(response => {
                if (response && response.result) {
                    this.dataService.Message().msgInfo(resultMessage, () => { });
                    this.handleBuscar();
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al publicar calificaciones.', () => { });
                }
            });
        }, (error) => { });
    }

    handleRegistrar = (row) => {
        /*  this.dialogRef = this.materialDialog.open(RegistrarCalificacionComponent, {
             panelClass: 'registra-calificacion-dialog',
             width: '1080px',
             disableClose: true,
             data: {
                 action: 'registrar',
                 idOperacion: TipoOperacionEnum.Registrar,
                 etapaResponse: this.etapaResponse,
                 idEtapa: this.etapaResponse.idEtapa,
                 calificacionesRow: row,
                 currentSession: this.currentSession,
             },
   
         });
         this.dialogRef.afterClosed().subscribe((resp) => {
             if (resp?.grabado === true) {
                 this.handleBuscar();
             }
         }); */
    }

    handleRegistrarReclamo = (row) => {
        /*     this.dialogRef = this.materialDialog.open(RegistrarReclamoComponent, {
                panelClass: 'minedu-registrar-reclamo',
                width: '700px',
                disableClose: true,
                data: {
                    action: 'registrar',
                    idOperacion: TipoOperacionEnum.Registrar,
                    idCalificacion: row.idCalificacion,
                    calificacion: row,
                    currentSession: this.currentSession
                },
            });
            this.dialogRef.afterClosed().subscribe((resp) => {
                if (resp?.grabado === true) {
                    this.handleBuscar();
                }
            }); */
    }

    handleDetalle = (row) => {
        /*       this.dialogRef = this.materialDialog.open(InformacionCalificacionComponent, {
                  panelClass: 'informacion-calificacion-dialog',
                  width: '1080px',
                  disableClose: true,
                  data: {
                      action: 'registrar',
                      etapaResponse: this.etapaResponse,
                      calificacionesRow: row,
                      currentSession: this.currentSession,
        
                  },
              });
              this.dialogRef.afterClosed().subscribe((resp) => {
                  if (resp?.grabado === true) {
                      this.handleBuscar();
                  }
              }); */
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning('No se encontró información para para exportar.', () => { });
            return;
        }

        this.export = true;
        this.dataService.Spinner().show('sp6');
        this.dataService
            .Reasignaciones()
            .exportarExcelCalificacion(
                this.request,
                1,
                this.dataSource.dataTotal
            )
            .pipe(
                catchError((e) => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                    this.export = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    saveAs(response, 'calificaciones.xlsx');
                } else {
                    this.dataService
                        .Message()
                        .msgWarning(
                            'No se encontró información para los criterios de búsqueda ingresados.',
                            () => { }
                        );
                }
            });
    }

}


export class CalificacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize): void {
        this._loadingChange.next(false);

        if (data.anio === null && data.idServidorPublico === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
        } else {
            this.dataService
                .Reasignaciones()
                .getListaCalificacion(data, pageIndex, pageSize)
                .pipe(
                    catchError(() => of([])),
                    finalize(() => this._loadingChange.next(false))
                )
                .subscribe((response: any) => {
                    this._dataChange.next(response.data || []);
                    this.totalregistro =
                        (response.data || []).length === 0
                            ? 0
                            : response.data[0].totalRegistro;
                    if ((response.data || []).length === 0) {
                        this.dataService
                            .Message()
                            .msgWarning(
                                'No se encontró información de lo(s) postulante(s) para los criterios de búsqueda ingresados.',
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