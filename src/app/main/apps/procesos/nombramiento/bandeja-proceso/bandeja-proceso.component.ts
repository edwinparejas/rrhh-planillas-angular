import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TablaEquivalenciaNombramiento, TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { CatalogoEstadoDesarrolloEnum, CatalogoItemEnumNombramiento, ResultadoOperacionEnum } from '../../nombramiento/_utils/constants';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'minedu-bandeja-proceso',
  templateUrl: './bandeja-proceso.component.html',
  styleUrls: ['./bandeja-proceso.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaProcesoComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  loading: false;
  export = false;
  now = new Date();

  selectedRegimen = 0;
  selectedProceso = 0;
  selectedEstado = 0;

  esSedeDreUgel = false;
  codigoDre: string = null;
  codigoUgel: string = null;
  codigoRol:string = null;
  comboLists = {
    listRegimenlaboral: [],
    listProceso: [],
    listEstadoDesarrollo: [],
  };
  displayedColumns: string[] = [
    'registro',
    'codigoProceso',
    'descripcionRegimenLaboral',
    'descripcionProceso',
    'numeroConvocatoria',
    'descripcionEtapa',
    'fechaCreacionProceso',
    'estadoDesarrollo',
    'acciones'
  ];

  /*variables responsive*/
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

  /*variables responsive*/
  dataSource: ProcesoDataSource | null;
  selection = new SelectionModel<any>(true, []);
  paginatorPageSize = 10;
  paginatorPageIndex = 0;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  eliminando = false;
  dialogRef: any;
  currentSession: SecurityModel = new SecurityModel();
  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false,
    autorizadoConsultar: false
  };
  hasAccessPage: boolean;
  estadoDesarrollo = CatalogoEstadoDesarrolloEnum;

  request = {
    anio: null,
    idRegimenLaboral: null,
    idProceso: null,
    idEstadoDesarrollo: null,
    esSedeDreUgel: null,
    codigoDre: null,
    codigoUgel: null,
    codigoRol:null,
    paginaActual: 1,
    tamanioPagina: 10
  };

  constructor(private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    private sharedService: SharedService) { }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    this.buildSeguridad();
    this.handleResponsive();
    this.buildForm();
    this.passport();

    this.dataSource = new ProcesoDataSource(this.dataService);

    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.resetForm();

    if (this.hasAccessPage) {
      this.loadRegimenLaboral();
      this.loadEstadoDesarrollo();
      this.buscarEtapaProceso(true);
    }
    else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => this.loadData((this.paginator.pageIndex + 1).toString(), this.paginator.pageSize.toString()));
  }

  ngOnDestroy(): void { }

  buildSeguridad = () => {
    this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
    this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
    this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();

    if (!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar && !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar && !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar) {
      this.hasAccessPage = false;
    }
    else {
      this.hasAccessPage = true;
    }
  }

  passport() {
    const rol = this.dataService.Storage().getPassportRolSelected();
    console.log("rol",rol)
    let esUgel = rol.CODIGO_TIPO_SEDE === TablaEquivalenciaNombramiento.CODIGO_TIPO_SEDE_UGEL;
    let esDre = rol.CODIGO_TIPO_SEDE === TablaEquivalenciaNombramiento.CODIGO_TIPO_SEDE_DRE;
    this.esSedeDreUgel = esUgel || esDre;
    if (esDre)
      this.codigoDre = rol.CODIGO_SEDE;
    if (esUgel)
      this.codigoUgel = rol.CODIGO_SEDE;
    this.codigoRol = rol.CODIGO_ROL;
  }


  buildForm(): void {
    this.form = this.formBuilder.group({
      anio: [null],
      idRegimenLaboral: [null],
      idProceso: null,
      idEstadoDesarrollo: null,
      descripcion: [null],
    });
  }

  selectRegimenLaboral(idRegimenLaboral: number): void {
    var dataRegimenLaboral = {
      anio: this.form.get('anio').value.getFullYear(),
      idRegimenLaboral: idRegimenLaboral
    }
    this.loadProceso(dataRegimenLaboral);
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  buildShared() {
    this.sharedService.setSharedBreadcrumb("Procesos de Nombramiento");
    this.sharedService.setSharedTitle("Desarrollo de procesos de nombramiento");
  }

  handleLimpiar(): void { this.resetForm(); }
  handleBuscar(): void { this.buscarEtapaProceso(); }

  // handleGoPlazas = (row) => { this.router.navigate(['./plaza/' + row.idEtapaProceso], { relativeTo: this.route }); }
  // handleGoCalificaciones = (row) => { this.router.navigate(['./calificacion/' + row.idEtapaProceso], { relativeTo: this.route }); }
  // handleGoAdjudicaciones = (row) => { this.router.navigate(['./adjudicacion/' + row.idEtapaProceso], { relativeTo: this.route }); }
  // handleGoConsolidadoPlazas = (row) => { this.router.navigate(['./consolidado/' + row.idEtapaProceso], { relativeTo: this.route }); }

  buscarEtapaProceso = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSource.load(this.request, 1, 10,fistTime);
    }
    else {
      this.dataSource.load(
        this.request,
        this.paginator.pageIndex + 1,
        this.paginator.pageSize,
        fistTime
      );
    }
  }

  handleGoPlazas(row) {
    this.router.navigate(['./plaza/' + row.idEtapaProceso], { relativeTo: this.route });
  }
  handleGoCalificaciones(row) {
    this.router.navigate(['./calificacion/' + row.idEtapaProceso + '/' + row.idEtapaProceso], { relativeTo: this.route });
  }
  handleGoAdjudicaciones(row) {
    this.router.navigate(['./adjudicacion/' + row.idEtapaProceso + '/' + row.idEtapaProceso], { relativeTo: this.route });
  }
  handleGoConsolidadoPlazas(row) {
    this.router.navigate(['./consolidado/' + row.idEtapaProceso + '/' + row.idEtapaProceso], { relativeTo: this.route });
  }

  loadData(pageIndex, pageSize): void {
    this.setRequest();
    this.dataSource.load(
      this.request,
      this.paginator.pageIndex + 1,
      this.paginator.pageSize
    );
  }

  resetForm = () => {
    this.form.reset();
    this.form.get('anio').setValue(new Date());
    this.form.controls['idRegimenLaboral'].setValue(0);
    this.form.controls['idProceso'].setValue(0);
    this.form.controls['idEstadoDesarrollo'].setValue(0);
    this.comboLists.listProceso = [];
  }

  loadRegimenLaboral = () => {
    this.dataService.Nombramiento()
      .getComboRegimenLaboral(true)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          var index = 0;
          response.splice(index, 0,
            {
              idRegimenLaboral: 0,
              codigoRegimenLaboral: 0,
              abreviaturaRegimenLaboral: "TODOS",
              descripcionRegimenLaboral:"TODOS"
            });
          const data = response.map((x) => ({
            ...x,
            value: x.idRegimenLaboral,
            label: `${x.descripcionRegimenLaboral}`,
          })
          );
          this.comboLists.listRegimenlaboral = data;
        }
      });
  }

  loadProceso = (dataSubInstancia: any) => {
    this.setRequest();
    this.dataService
      .Nombramiento()
      .getComboProceso(dataSubInstancia)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          var index = 0;
          response.splice(index, 0,
            {
              idProceso: 0,
              codigoProceso: 0,
              descripcionProceso: "TODOS"
            });
          const data = response.map((x) => ({
            ...x,
            value: x.idProceso,
            label: `${x.descripcionProceso}`,
          })
          );
          this.comboLists.listProceso = data;
        }
      });
  }

  loadEstadoDesarrollo = () => {
    this.dataService
      .Nombramiento()
      // .getComboCatalogoItem(CatalogoItemEnumNombramiento.ESTADO_DESARROLLO)
      .getComboCatalogoItem(CatalogoItemEnumNombramiento.ESTADO_DESARROLLO_PROCESO)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          var index = 0;
          response.splice(index, 0,
            {
              idCatalogoItem: 0,
              idCatalogo: 0,
              descripcionCatalogoItem: "TODOS"
            });
          const data = response.map((x) => ({
            ...x,
            value: x.idCatalogoItem,
            label: `${x.descripcionCatalogoItem}`,
          }));
          this.comboLists.listEstadoDesarrollo = data;
        }
      });
  }

  setRequest = () => {
    this.request = {
      anio: this.form.get('anio').value.getFullYear(),
      idRegimenLaboral: this.form.get('idRegimenLaboral').value,
      idProceso: this.form.get('idProceso').value,
      idEstadoDesarrollo: this.form.get('idEstadoDesarrollo').value,
      esSedeDreUgel: this.esSedeDreUgel,
      codigoDre: this.codigoDre,
      codigoUgel: this.codigoUgel,
      codigoRol:this.codigoRol,
      paginaActual: 1,
      tamanioPagina: 10
    };
  }

  handleExportar = () => {
    if (this.dataSource.data.length === 0) {
      this.dataService.Message().msgWarning('No se encontró información para exportar.', () => { });
      return;
    }

    this.export = true;
    this.setRequest();
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Nombramiento()
      .getExportEtapaProceso(this.request, 1, this.dataSource.dataTotal)
      .pipe(catchError((e) => of(null)), finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.export = false;
      }))
      .subscribe((response: any) => {
        if (response) {
          var datePipe = new DatePipe('es-Pe');
          console.log('datePipe',datePipe);
          var date = datePipe.transform(new Date(), 'yyyy-MM-dd')
          descargarExcel(response, 'desarrollo-etapa-nombramiento-'+date+'.xlsx');
        }
        else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
  }

}

export class ProcesoDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex, pageSize,fistTime: boolean = false): void {
    this._loadingChange.next(false);
    // if (dacta.anio === null || !data.esSedeDreUgel) {
    if (data.anio === null) {
      this._loadingChange.next(false);
      this._dataChange.next([]);
    }
    else {
      this.dataService
        .Nombramiento()
        .getPageEtapaProceso(data, pageIndex, pageSize)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => {
            this._loadingChange.next(false);
          })
        )
        .subscribe((response: any) => {
          if (response) {
            this._dataChange.next(response || []);
            this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistro;
            if ((response || []).length === 0) {
              if(!fistTime)
                this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN DE ACUERDO CON LOS CRITERIOS DE BÚSQUEDA INGRESADOS."', () => { });
            }
          }
          else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
          } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
          } else {
            this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
          }
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

}