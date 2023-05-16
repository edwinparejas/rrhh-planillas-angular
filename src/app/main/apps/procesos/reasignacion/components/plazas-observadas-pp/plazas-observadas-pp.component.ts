import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnDestroy, AfterViewInit, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ResultadoOperacionEnum } from 'app/core/model/types';
import { SharedService } from 'app/core/shared/shared.service';
import { BehaviorSubject, Subject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize,tap } from 'rxjs/operators';
import { EstadoEtapaEnum } from '../../_utils/constants';
import { TablaPermisos } from '../../../../../../core/model/types';
import { OpcionFiltro } from 'app/main/apps/licencias/models/licencia.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PrePublicacionComponent } from '../../pre-publicacion/pre-publicacion.component';
import { descargarExcel } from 'app/core/utility/functions';
import { InformacionPlazaComponent } from '../../plazas/components/informacion-plaza/informacion-plaza.component';
import { HttpClient } from '@angular/common/http';

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
  selector: 'minedu-plazas-observadas-pp',
  templateUrl: './plazas-observadas-pp.component.html',
  styleUrls: ['./plazas-observadas-pp.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class PlazasObservadasPPComponent implements OnInit, OnDestroy, AfterViewInit {

  objetoBus: any = {};
  objSus: Subscription;
  dialogRef: any;
  ipAddress = '';
  lading: false;
  export = false;

  dataSource: ObservadosDataSource | null;
  selectionObservadas = new SelectionModel<any>(true, []);
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  private _unsubscribeAll: Subject<any>;
  paginatorPageIndex = 0;
  paginatorPageSize = 10;

  isMobile = false;
  currentSession: SecurityModel = new SecurityModel();
  estadoEtapa = EstadoEtapaEnum;
  opcionFiltro: OpcionFiltro = new OpcionFiltro();

  displayedColumns: string[] = [
    'select',
    'instancia',
    'subinstancia',
    'codigo_modular',
    'centro_trabajo',
    'modalidad',
    'nivel_educativa',
    'tipo_gestion',
    'codigo_plaza',
    'cargo',
    'area_curricular',
    'tipo_plaza',
    'vigencia_inicio',
    'vigencia_fin',
    'acciones'
  ];
  permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false
  };
  request = {
    idep: 0,
    idEtapaProceso: 0,
    idDesarrolloProceso: 0,
    operacion: '',
    idInstancia: '',
    idSubInstancia: '',
    codigoModular: '',
    codigoPlaza: '',
    pageIndex: 0,
    pageSize: 10
  };

  @Input() btnBuscar: Observable<void>;
  @Input() set observadaBusqueda(observadaBusqueda: any) {
    if (observadaBusqueda) {
      this.request.idDesarrolloProceso = observadaBusqueda.idDesarrolloProceso;
      this.objetoBus.idEtapaProceso = Number(observadaBusqueda.idEtapaProceso);
      this.objetoBus.idInstancia = Number(observadaBusqueda.idInstancia);
      this.objetoBus.idSubInstancia = Number(observadaBusqueda.idSubInstancia);
      this.objetoBus.idCodigoModular = Number(observadaBusqueda.idCodigoModular);
      this.objetoBus.idCodigoPlaza = Number(observadaBusqueda.idCodigoPlaza);
      this.objetoBus.anio = observadaBusqueda.anio;
      this.objetoBus.valiPlaza = observadaBusqueda.valiPlaza;
      this.objetoBus.fecha_corte = observadaBusqueda.fecha_corte;
    //   this.buscarPrePublicacion(true);
      this.loadData();
      this.masterToggle();
      this.selectionObservadas.clear();
    } 
  }

//   ngAfterViewInit(): void {
//     this.paginator.page.subscribe(() =>
//       this.loadData()
//     );
//   }

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
    private dataService: DataService,
    private sharedService: SharedService,
    private materialDialog: MatDialog,
    private parent: PrePublicacionComponent
  ) { 
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    // this.objSus = this.dtService.objeto$.subscribe(objetoBusqueda => {
    //   this.objetoBus = objetoBusqueda;
    //   this.buscarPrePublicacion(true);
    // });
    setTimeout(_ => this.buildShared());
    this.handleResponsive();
    this.buildSeguridad();
    // this.configurarGrid();
    // this.buscarPrePublicacion(true);
    this.route.data.subscribe((data) => {
        if (data) {
            this.configurarGrid();
        }
    });
  }

//   ngAfterViewInit() {
    // this.paginator.page.pipe(tap(() => this.loadData())).subscribe();
    // this.paginatorBecarios.page.pipe(tap(() => this.handleBuscar())).subscribe();

    // this.paginator.page.subscribe(() => this.loadData());
    // setTimeout(() => { this.dataService.Spinner().show('sp6'); this.loadData(); }, 0);
//   }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() =>
        this.loadData()
    );
 }

  ngOnDestroy(): void {
    // this._unsubscribeAll.next();
    // this._unsubscribeAll.complete();
  }

  buildShared() {
    // this.sharedService.setSharedBreadcrumb("Reasignación / Desarrollo de procesos de reasignación");
    // this.sharedService.setSharedTitle("Desarrollo de procesos de reasignación");
  }

  configurarGrid = () => {
    this.dataSource = new ObservadosDataSource(this.dataService,
        this.sharedService);
    if(this.dataSource.totalregistro != null){
        this.dataSource.totalregistroglobal += this.dataSource.totalregistro;}  

    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.paginator._intl.getRangeLabel = dutchRangeLabel;
  }

  private loadData(): void {
    this.setRequest();
    this.dataSource.load(
      this.request,
      this.paginator.pageIndex + 1,
      this.paginator.pageSize
    );
  }

  setRequest = () => {
    this.request = {
        idep:0,
        idEtapaProceso: Number(this.route.snapshot.params.id),
        idDesarrolloProceso: Number(this.route.snapshot.params.id),
        operacion: 'OBSERVADAS',
        idInstancia: this.objetoBus.idInstancia,
        idSubInstancia: this.objetoBus.idSubInstancia,
        codigoModular: this.objetoBus.idCodigoModular,
        codigoPlaza: this.objetoBus.idCodigoPlaza,
        pageIndex: 1,
        pageSize: 10
    }
  }
  
  /*Selecciona todas las filas si no están todas seleccionadas; de lo contrario, selección clara.*/
  masterToggle = () => {
    this.isAllSelected() ?
      this.selectionObservadas.clear() :
      this.dataSource.data.forEach(row => this.selectionObservadas.select(row));
  }
  /*Si el número de elementos seleccionados coincide con el número total de filas.*/
  isAllSelected = (): boolean => {
    const numSelected = this.selectionObservadas.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  selectedGridObservadas = (param) => {
    this.selectionObservadas.toggle(param);
  };
  /* La etiqueta de la casilla de verificación en la fila pasada */
  checkboxLabel(row): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    // return `${this.selectionObservadas.isSelected(row) ? 'deselect' : 'select'} row ${row.instancia + 1}`;
    return `${this.selectionObservadas.isSelected(row) ? 'deselect' : 'select'} row ${row.registro + 1}`;
  }

  handleReasignarPlaza(): void {

    let idpl = [];
    let reasignarPlaza: any = this.selectionObservadas.selected;
    if (reasignarPlaza.length === 0) {
      this.dataService.Message()
        .msgWarning('“DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA”',
          () => { });
      return;
    }
    for (let i = 0; i < reasignarPlaza.length; i++) {
      idpl.push(reasignarPlaza[i].id_plaza_reasignacion_detalle);
    }
    const dato = {
      oper: 'REASIGNAR',
      idsPlazasReasignacionDetalle: idpl,
      usuario: this.currentSession.numeroDocumento,
      ip: this.ipAddress
    }
    this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA TRASLADAR LAS PLAZAS A LA PESTAÑA “PLAZAS REASIGNACIÓN”?', 
    () => {
    this.dataService.Reasignaciones()
      .reasignarPlazas(dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => {
         this.dataService.Spinner().hide("sp6");
        })
      )
      .subscribe((Response: any) => {
        if (Response.length > 0) {
            this.dataService.Message().msgError('"ERROR, SURGIÓ UN PROBLEMA AL TRATAR DE REASIGNAR LA(s) PLAZA(S)."', () => {});
          return
        }
        else {
        this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."',3000,() => {});
        //this.buscarPrePublicacion(true);
        //   this.selectionObservadas.clear();
        //   this.parent.ngOnInit();

        //   this.getDataGridConvocadas();
        //   this.masterToggleConvocadas();
        //   this.selectionConvocadas.clear();
        this.loadData();
        this.masterToggle();
        this.selectionObservadas.clear();
        // this.parent.handleBuscar();
        }
      });
    });
  }

  dialogInformacion(row): void {

    this.dialogRef = this.materialDialog.open(InformacionPlazaComponent,
      {
        panelClass: 'informacion-plaza',
        disableClose: true,
        data: {
          idPlazaReasignacion: Number(row.id_plaza_reasignacion),
          idPlazaReasignacionDetalle: Number(row.id_plaza_reasignacion_detalle),
          idPlaza: Number(row.id_plaza)
        },
      }
    );

    this.dialogRef.afterClosed().subscribe((resp) => {
        this.selectionObservadas.clear();
    });
  }

  buildSeguridad = () => {
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  buscarPrePublicacion = (fistTime: boolean = false) => {
    this.setRequest();
    if (this.request.idDesarrolloProceso) {
    //   if (fistTime) {   
    //     this.dataSource.load(this.request, 1, 10, true);
    //   } else {
    //     this.dataSource.load(
    //       this.request,
    //       this.paginator.pageIndex + 1,
    //       this.paginator.pageSize,
    //       false
    //     );
    //   }
    if (fistTime) {   
        this.dataSource.load(this.request, 1, 10);
      } else {
        this.dataSource.load(
          this.request,
          this.paginator.pageIndex + 1,
          this.paginator.pageSize
        );
      }
    }
  }

  handleExportar(): void {
    const reExport = {
      idDesarrolloProceso: this.request.idDesarrolloProceso,
      operacion: 'OBSERVADAS',
      idInstancia: this.objetoBus.idInstancia,
      idSubInstancia: this.objetoBus.idSubInstancia,
      codigoModular: this.objetoBus.idCodigoModular.toString(),
      codigoPlaza: this.objetoBus.idCodigoPlaza.toString()
    }

    if (this.dataSource.data.length === 0) {
      this.dataService
        .Message()
        .msgWarning('No se encontró información para exportar.', () => { });
      return;
    }
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Reasignaciones()
      .exportarPrePublicacionPlazasObservadas(reExport)
      .pipe(
        catchError((e) => of(null)),
        finalize(() => {
          this.dataService.Spinner().hide('sp6');
        })
      )
      .subscribe((response: any) => {
        if (response) {
          descargarExcel(response, 'Plazas Observadas ' + this.objetoBus.anio + '.xlsx');
          this.dataService
            .Message()
            .msgAutoSuccess(
              'Se procedio a realizar la descarga de las <b>Plazas Observadas</b>',
              3000, () => { }
            );
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
}

export class ObservadosDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;
  public totalregistroglobal=0;

  constructor(private dataService: DataService,
    private sharedService: SharedService) {
    super();
  }

  load(data: any, pageIndex, pageSize): void {

    //   this.dataService.Spinner().show('sp6');
    //   this._loadingChange.next(false);
      this.dataService
        .Reasignaciones()
        .getPrePubliObservadas(data, pageIndex, pageSize)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => {
            this._loadingChange.next(false);
            this.dataService.Spinner().hide('sp6');
          })
        )
        .subscribe((response: any) => {
          if (response) {
            // this._dataChange.next((response));
            // this.totalregistro = (response).length === 0 ? 0 : response[0].total_rows;
            // this.totalregistroglobal += this.totalregistro; // *******************
            // if ((response).length === 0 || this.totalregistroglobal === 0) {
            //   this.dataService
            //     .Message()
            //     .msgWarning(
            //       'No se encontró información de la(s) Plaza(s) Observada(s) para los criterios de búsqueda ingresados.',
            //       () => { }
            //     );
            // }
            this.sharedService.sendRotacionData({});
            if (response.length == 0) {
              this.dataService
                .Message()
                .msgWarning(
                  'No se encontró información de la(s) Plaza(s) Observada(s) para los criterios de búsqueda ingresados.',
                  () => { }
                );
            } else {
                this.totalregistro =
                    (response || []).length === 0
                        ? 0
                        : response[0].total_rows;
                this._dataChange.next(response || []);
            }

          }
          else if (response === ResultadoOperacionEnum.NotFound) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
          } else if (response === ResultadoOperacionEnum.UnprocessableEntity) {
            this.dataService.Message().msgWarning(response.messages[0], () => { });
          } else {
            this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { });
          }
        });
    // }

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
}