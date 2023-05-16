import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { OpcionFiltro } from '../../models/reasignacion.model';
import { MENSAJES, ResultadoOperacionEnum, TablaRolPassport } from '../../_utils/constants';
import { MatDialog } from '@angular/material/dialog';
import { MotivoCancelacionComponent } from '../../components/motivo-cancelacion/motivo-cancelacion.component';
import { descargarExcel } from 'app/core/utility/functions';
import { CodigoDescripcionMaestroProceso, CodigoEstadoDesarrollo, TablaRegimenLaboral } from 'app/core/model/types-reasignacion';
import { isArray } from 'lodash';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { PassportAutorizacionModel } from 'app/core/model/security/passport-autorizacion.model';
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
    selector: 'minedu-bandeja-reasignacion',
    templateUrl: './bandeja-principal.component.html',
    styleUrls: ['./bandeja-principal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class BandejaPrincipalComponent implements OnInit, OnDestroy, AfterViewInit {
    form: FormGroup;
    lading: false;
    now = new Date();

    codigoEstadoDesarrollo = CodigoEstadoDesarrollo;

    opcionFiltro: OpcionFiltro = new OpcionFiltro();
    comboLists = {
        listAnio: [],
        listRegimenLaboral: [],
        listProceso: [],
        listEstadoEtapaProceso: [],
    };

    dataSource: ReasignacionDataSource | null;
    selection = new SelectionModel<any>(true, []);
    paginatorPageIndex = 0;
    paginatorPageSize = 10;
    @ViewChild('paginator', { static: true }) paginator: MatPaginator;
    displayedColumns: string[] = [
        'registro',
        'codigo',
        'regimen_laboral',
        'proceso',
        'numero_convocatoria',
        'etapa',
        'fecha_creacion',
        'estado',
        'acciones'
    ];

    dialogRef: any;

    request = {
        anio: null,
        idRegimenLaboral: null,
        idProceso: null,
        idEstado: null,
        codigoRolPassport: null,
        codigoSede:null,
        codigoTipoSede:null,
        pageIndex: 0,
        pageSize: 10
    };

    currentSession: SecurityModel = new SecurityModel();
    permisos = {
        accionPrePublicarPlazas: false,
        accionPublicarPlazas: false,
        accionPostulantes: false,
        accionCalificaciones: false,
        accionAdjudicaciones: false
    };

    isMobile = false;

    reExport: any = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog,
        private sharedService: SharedService,
    ) { }

    ngOnInit(): void {
        setTimeout(_ => this.buildShared());
        this.buildForm();
        this.handleResponsive();
        this.buildSeguridad();
        this.loadCombosFiltro();
        this.configurarGrid();
        this.buscarProcesosReasignacion(true);
    }

    ngAfterViewInit(): void {
        this.paginator.page.subscribe(() =>
            this.loadData(this.paginator.pageIndex + 1, this.paginator.pageSize)
        );
    }

    ngOnDestroy(): void { }

    buildShared() {
        this.sharedService.setSharedBreadcrumb("Reasignación / Desarrollo de procesos de reasignación");
        this.sharedService.setSharedTitle("Desarrollo de procesos de reasignación");
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            anio: [null, Validators.required],
            idRegimenLaboral: [null, Validators.required],
            idProceso: [null],
            idEstado: [null]
        });

        this.resetForm();
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        return w < breakpoint;
    }

    buildSeguridad = () => {
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
        // console.log(this.currentSession);
    }

    loadCombosFiltro = () => {
        this.loadRegimenLaboral();
        this.loadProceso();
        this.loadEstado();
    }

    loadRegimenLaboral = () => {
        this.dataService.Reasignaciones()
            .getRegimenesLaborales(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idRegimen,
                        label: `${x.abreviaturaRegimen}`,
                    }));
                    this.comboLists.listRegimenLaboral = data;
                    this.comboLists.listRegimenLaboral.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    loadProceso = () => {
        this.dataService.Reasignaciones()
            .getDescripcionMaestroProceso(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listProceso = data;
                    this.comboLists.listProceso.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    loadEstado = () => {
        this.dataService.Reasignaciones()
            .getEstadoDesarrollo(true)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listEstadoEtapaProceso = data;
                    this.comboLists.listEstadoEtapaProceso.unshift({ value: this.opcionFiltro.item.value, label: this.opcionFiltro.item.label });
                }
            });
    }

    configurarGrid = () => {
        this.dataSource = new ReasignacionDataSource(this.dataService);
        this.paginator.showFirstLastButtons = true;
        this.paginator._intl.itemsPerPageLabel = 'Registros por página';
        this.paginator._intl.nextPageLabel = 'Siguiente página';
        this.paginator._intl.previousPageLabel = 'Página anterior';
        this.paginator._intl.firstPageLabel = 'Primera página';
        this.paginator._intl.lastPageLabel = 'Última página';
        this.paginator._intl.getRangeLabel = dutchRangeLabel;
    }

    loadData(pageIndex, pageSize): void {
        this.setRequest();
        this.dataSource.load(
            this.request,
            this.paginator.pageIndex + 1,
            this.paginator.pageSize
        );
    }

    handleBuscar(): void {
        this.buscarProcesosReasignacion(false);
    }

    handleLimpiar(): void {
        this.resetForm();
        this.buscarProcesosReasignacion(true);
    }

    resetForm = () => {
        this.form.reset();
        this.form.patchValue({
            anio: new Date(),
            idRegimenLaboral: TablaRegimenLaboral.Ley29944LRM,
            idProceso: -1,
            idEstado: -1
        });
    }

    buscarProcesosReasignacion = (fistTime: boolean = false) => {
        const codigoRol = this.dataService.Storage().getPassportRolSelected().CODIGO_ROL;
        if(codigoRol == TablaRolPassport.ESPECIALISTA_DITEN || codigoRol == TablaRolPassport.MONITOR || codigoRol == TablaRolPassport.PRESIDENTE_COMITE_REASIGNACION_UGEL || codigoRol == TablaRolPassport.RESPONSABLE_PERSONAL_UGEL){
            this.setRequest();
            if (fistTime) {
                this.dataSource.load(this.request, 1, 10, true);
            } else {
                this.dataSource.load(
                    this.request,
                    this.paginator.pageIndex + 1,
                    this.paginator.pageSize
                );
                this.dataService.Spinner().hide('sp6');
            }
        }
        else{
            this.dataService.Message().msgWarning('"EL USUARIO NO TIENE PERMISO PARA ENTRAR AL MÓDULO DE REASIGNACIÓN DE PLAZAS."', () => {
                this.router.navigate(['ayni', 'personal', 'inicio']);
            });
            return;
        }
    }

    setRequest = () => {
        const anio = this.form.get('anio').value.getFullYear();
        this.request = {
            anio: anio > -1 ? anio : null,
            idRegimenLaboral: this.form.get('idRegimenLaboral').value,
            idProceso: this.form.get('idProceso').value,
            idEstado: this.form.get('idEstado').value,
            codigoRolPassport: this.currentSession.codigoRol,
            codigoSede: this.currentSession.codigoSede,
            codigoTipoSede: this.currentSession.codigoTipoSede,
            pageIndex: 1,
            pageSize: 10
        };
    }

    mostrarAccionMotivoCancelacion(fila: any) {
        return fila.codigoEstado == CodigoEstadoDesarrollo.Cancelado;
    }

    dialogMotivoCancelacion = (row) => {
        this.dialogRef = this.materialDialog.open(MotivoCancelacionComponent, {
            panelClass: 'minedu-motivo-cancelacion-dialog',
            width: '50%',
            disableClose: true,
            data: {
                action: 'busqueda',
                id: row.idep
            },
        });
    }

    mostrarAccionPrePublicacion(fila: any) {
        // return fila.codigo_proceso === CodigoDescripcionMaestroProceso.PrePublicacionPlazasReasignacion && this.permisos.accionPrePublicarPlazas;
        // return fila.codigoProceso === CodigoDescripcionMaestroProceso.PrePublicacionPlazasReasignacion && fila.accesoPlaza && fila.codigoEstado !== CodigoEstadoDesarrollo.Cancelado;
        return fila.codigoProceso === CodigoDescripcionMaestroProceso.PorInteresPersonalPorUnidadFamiliar && fila.accesoPlaza && fila.codigoEstado !== CodigoEstadoDesarrollo.Cancelado && TablaRolPassport.ESPECIALISTA_DITEN === this.currentSession.codigoRol;
    }

    handlePrePublicacion = (row) => {
        this.router.navigate(['./pre-publicacion/' + row.idEtapaProceso+'/'+ row.idAlcanceProceso], { relativeTo: this.route });
    }

    mostrarAccionPublicacion(fila: any) {
        // return fila.codigo_proceso === CodigoDescripcionMaestroProceso.PorInteresPersonalPorUnidadFamiliar && this.permisos.accionPublicarPlazas;
        return fila.codigoProceso === CodigoDescripcionMaestroProceso.PorInteresPersonalPorUnidadFamiliar && fila.accesoPlaza && TablaRolPassport.ESPECIALISTA_DITEN !== this.currentSession.codigoRol;
    }

    handlePublicacion = (row) => {
        this.router.navigate(['./plazas/' + row.idEtapaProceso+'/'+ row.idAlcanceProceso], { relativeTo: this.route });
    }

    mostrarAccionPostulantes(fila: any) {
        // return fila.codigo_proceso !== CodigoDescripcionMaestroProceso.PrePublicacionPlazasReasignacion && this.permisos.accionPostulantes;
        return fila.codigoProceso === CodigoDescripcionMaestroProceso.PorInteresPersonalPorUnidadFamiliar && fila.accesoPostulante;
    }

    handlePostulantes = (row) => {
        this.router.navigate(['./postulante/' + row.idEtapaProceso+'/'+ row.idAlcanceProceso], { relativeTo: this.route });
    }

    mostrarAccionCalificaciones(fila: any) {
        // return fila.codigo_proceso !== CodigoDescripcionMaestroProceso.PrePublicacionPlazasReasignacion && this.permisos.accionCalificaciones;
        return fila.codigoProceso === CodigoDescripcionMaestroProceso.PorInteresPersonalPorUnidadFamiliar && fila.accesoCalificacion;
    }

    handleCalificaciones = (row) => {
        this.router.navigate(['./calificacion/' + row.idEtapaProceso+'/'+ row.idAlcanceProceso], { relativeTo: this.route });
    }

    mostrarAccionAdjudicaciones(fila: any) {
        // return fila.codigo_proceso !== CodigoDescripcionMaestroProceso.PrePublicacionPlazasReasignacion && this.permisos.accionAdjudicaciones;
        return fila.codigoProceso === CodigoDescripcionMaestroProceso.PorInteresPersonalPorUnidadFamiliar && fila.accesoAdjudicacion;
    }

    handleAdjudicaciones = (row) => {
        this.router.navigate(['./adjudicacion/' + row.idEtapaProceso+'/'+ row.idAlcanceProceso], { relativeTo: this.route });
    }

    handleExportar = () => {
        if (this.dataSource.data.length === 0) {
            this.dataService
                .Message()
                .msgWarning(MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_PARA_EXPORTAR, () => { });
            return;
        }
        this.dataService.Spinner().show('sp6');
        this.setRequest();
        this.dataService
            .Reasignaciones()
            .exportarDesarrolloProcesos(this.request)
            .pipe(
                catchError((e) => {
                    this.dataService.Message().msgWarning(e.error.messages[0]);
                    return of(null);
                }),
                finalize(() => {
                    this.dataService.Spinner().hide('sp6');
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    descargarExcel(response, 'Reasignación ' + this.request.anio + '.xlsx');
                }
            });
    }

    claseSegunEstado = (codigoEstado: number) => {
        let clase = '';

        switch (codigoEstado) {
            case CodigoEstadoDesarrollo.Pendiente:
                clase = 'badge-warning';
                break;

            case CodigoEstadoDesarrollo.Iniciado:
                clase = 'badge-info';
                break;

            case CodigoEstadoDesarrollo.Finalizado:
                clase = 'badge-success';
                break;

            case CodigoEstadoDesarrollo.Cancelado:
                clase = 'badge-danger';
                break;

            default:
                clase = 'badge-default';
                break;
        }

        return clase;
    }
}

export class ReasignacionDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(private dataService: DataService) {
        super();
    }

    load(data: any, pageIndex, pageSize, firsTime = false): void {
        this._loadingChange.next(false);
        if (data.anio === null) {
            this._loadingChange.next(false);
            this._dataChange.next([]);
            this.dataService.Spinner().show('sp6');
        } else {
            this.dataService
                .Reasignaciones()
                .getDesarrolloProcesoPaginado(data, pageIndex, pageSize)
                .pipe(
                    catchError((e) => { return  this.configCatch(e);        }),
                    finalize(() => {
                        this._loadingChange.next(false);
                        this.dataService.Spinner().hide('sp6');
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        if ((response || []).length === 0) {
                            this.dataService
                                .Message()
                                .msgWarning(
                                    MENSAJES.MENSAJE_NO_ENCONTRO_INFORMACION_CRITERIOS_BUSQUEDA,
                                    () => { }
                                );
                        }else{
                            this._dataChange.next(response || []);
                            this.totalregistro = (response || []).length === 0 ? 0 : response[0].total_rows;
                        }
                    }
                    else if (response === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError(MENSAJES.MENSAJE_PROBLEMAS_INFORMACION_CRITERIOS_BUSQUEDA, () => { });
                    }
                });
        }

        // this._dataChange.next(data);
        // this.totalregistro = 0;
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
