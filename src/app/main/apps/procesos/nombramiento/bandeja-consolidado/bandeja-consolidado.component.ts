import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultadoOperacionEnum, TablaEquivalenciaNombramiento, TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { CatalogoEstadoConsolidadoEnum, CatalogoItemEnumNombramiento } from '../_utils/constants';
import { EtapaProcesoResponseModel } from '../models/etapa-proceso.model';
import { ModalConsultarMotivoRechazoConsolidadoComponent } from '../components/modal-consultar-motivo-rechazo-consolidado/modal-consultar-motivo-rechazo-consolidado.component';

@Component({
  selector: 'minedu-bandeja-consolidado',
  templateUrl: './bandeja-consolidado.component.html',
  styleUrls: ['./bandeja-consolidado.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaConsolidadoComponent implements OnInit {

  form: FormGroup;
  loading: false;
  export = false;
  now = new Date();
 
  selectedDre = 0;
  selectedUgel = 0;
  selectedEstadoConsolidado = 0;

  comboLists = {
    listDre: [],
    listUgel: [],
    listEstadoConsolidado: [],
  };
  displayedColumns: string[] = [
    'registro',
    'descripcionDre',        
    'descripcionUgel',
    'descripcionEstadoConsolidado',
    'fechaValidacion',
    'fechaAprobacion',
    'fechaRechazo', 
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

  paginatorPageSize = 10;
  paginatorPageIndex = 0;
  dataSource: ConsolidadoDataSource | null;
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;
  selection = new SelectionModel<any>(true, []);

  eliminando = false;
  dialogRef: any;
  tiempoMensaje:number=1000;
  currentSession: SecurityModel = new SecurityModel();
  permisos = {
      autorizadoAgregar: false,
      autorizadoModificar: false,
      autorizadoEliminar: false,
      autorizadoEnviar: false,
      autorizadoExportar: false,
      autorizadoConsultar:false
  };
  hasAccessPage: boolean;
  estadoConsolidadoEnum = CatalogoEstadoConsolidadoEnum;
  working=true;
  request = {
    idDre: null,
    idUgel: null,
    idEstadoConsolidado: null,
    idEtapaProceso:null,
    paginaActual:1,
    tamanioPagina:10
  };

  idEtapaProceso: number;
  numeroDocumento: string;
  
  etapaProceso: EtapaProcesoResponseModel = new EtapaProcesoResponseModel();
    constructor(
      private router: Router,      
      private route: ActivatedRoute,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private materialDialog: MatDialog,
      private sharedService: SharedService
    ) { }

  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    this.handleResponsive();
    this.buildSeguridad();   
    this.buildForm();
    this.passport();
    this.idEtapaProceso= parseInt(this.route.snapshot.params.idEtapaProceso);

    this.dataSource = new ConsolidadoDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
  
    if(this.hasAccessPage){
        this.obtenerProcesoEtapa();
        this.loadInstancia();
        this.loadEstadoConsolidado();
        this.buscarConsolidado(true);
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
    if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar && !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar && !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
    {
      this.hasAccessPage=false;
    }
    else{
      this.hasAccessPage=true;
    }
  }

  passport() {        
    const usuario = this.dataService.Storage().getPassportUserData();
    this.numeroDocumento= usuario.NUMERO_DOCUMENTO;
  }

  buildForm = () => {
    this.form = this.formBuilder.group({
      idDre: [null],
      idUgel: [null],
      idEstadoConsolidado: [null]
    });
  }

  selectInstancia(idDre: number): void {
    var dataSubInstancia = {
      idDre :idDre,
      activo : true
    }
    this.loadSubInstancia(dataSubInstancia);
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  buildShared() {
      this.sharedService.setSharedBreadcrumb("Procesos de Nombramiento");
      this.sharedService.setSharedTitle("Consolidado de plazas");
  }

  handleBuscar(): void { this.buscarConsolidado(); }
  handleLimpiar(): void {this.resetForm(); }

  handleGoNombramiento = () => {    this.router.navigate(['../../'], { relativeTo: this.route }); } 
  handleGoConsolidadoPlazasDetalle = (row) => {
    this.router.navigate(['../../consolidadodetalle/' + row.idConsolidadoPlaza ], { relativeTo: this.route }); 
  }  
  handleMotivoRechazo(row){
    
    this.dialogRef = this.materialDialog.open(ModalConsultarMotivoRechazoConsolidadoComponent, {
      panelClass: 'modal-proceso-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "save",
          title: "Motivo de rechazo",
          action: "create",
          info: { instancia: 16 },
          editable: true
        },
        detalleMotivoRechazo: row.detalleMotivoRechazo
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        if (response.reload) {
        }
      });
  }

  handleAprobarPlazas(){
    let obj = {
      idEtapaProceso: 0,
      consolidadoPlaza: {
        idEtapaProceso: this.idEtapaProceso,
        fechaAprobacion: new Date(),

        fechaModificacion: new Date(),
        usuarioModificacion: this.numeroDocumento,
        ipModificacion: '',
      }
    }
    
    this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la información.?', () => {
      this.dataService.Spinner().show("sp6");
      this.working = true;
      this.dataService
        .Nombramiento()
        .modificarFechaAprobacionMasivoConsolidadoPlaza(obj)
        .pipe(
          catchError((e) => of(e)),
          finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
        )
        .subscribe(response => {
          
          if (response && response > 0) {
            this.dataService.Message().msgSuccess('Operación realizada de forma exitosa.', () => { 
              this.buscarConsolidado(true);
            });
          } else if (response && (response.status === 400 || response.status === 422 || response.status === 404)) {
            this.dataService.Message().msgWarning(response.error.messages[0], () => { });
          } else {
            this.dataService.Message().msgWarning('No se puede crear la configuración del proceso.', () => { });
          }
        });
    }, () => { });
  }

  handleGoPlazasRechazadas(row) {
    debugger;
    return;
  }

  buscarConsolidado = (fistTime: boolean = false) => {
    this.setRequest();
    if (fistTime) {
      this.dataSource.load(this.request, 1, 10);
    } 
    else {          
      this.dataSource.load(
        this.request,
        this.paginator.pageIndex + 1,
        this.paginator.pageSize
      );
    }
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
      this.form.controls['idDre'].setValue(0);
      this.form.controls['idUgel'].setValue(0);
      this.form.controls['idEstadoConsolidado'].setValue(0);
  }

  loadInstancia = () => {
    this.dataService
        .Nombramiento()
        .getComboInstancia()
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response) {
              var index=0;
              response.splice(index,0,
                                {idDre:0,
                                descripcionDre:"SELECCIONAR"});
                const data = response.map((x) => ({
                    ...x,
                    value: x.idDre,
                    label: `${x.descripcionDre}`,
                }));
                this.comboLists.listDre = data;
            }
        });
  }

  loadSubInstancia = (dataUgel: any) => {
   this.dataService
        .Nombramiento()
        .getComboSubInstancia(dataUgel)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response) {
                var index=0;
                response.splice(index,0,
                                   {idUgel:0,
                                    descripcionUgel:"SELECCIONAR"});
                const data = response.map((x) => ({
                    ...x,
                    value: x.idUgel,
                    label: `${x.descripcionUgel}`,
                }));
                this.comboLists.listUgel = data;
            }
        });
  }

  loadEstadoConsolidado= () => {
  this.dataService
      .Nombramiento()
      .getComboCatalogoItem(CatalogoItemEnumNombramiento.ESTADO_CONSOLIDADO)
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response) {
              var index=0;
              response.splice(index,0,
                              {idCatalogoItem:0,
                                idCatalogo:0,
                                descripcionCatalogoItem:"SELECCIONAR"});
              const data = response.map((x) => ({
                  ...x,
                  value: x.idCatalogoItem,
                  label: `${x.descripcionCatalogoItem}`,
              }));
              this.comboLists.listEstadoConsolidado = data;
          }
      });
  }

  setRequest = () => {
    this.request = {
      idEtapaProceso:this.idEtapaProceso,
      idDre: this.form.get('idDre').value,
      idUgel: this.form.get('idUgel').value,
      idEstadoConsolidado: this.form.get('idEstadoConsolidado').value,
      paginaActual:1,  
      tamanioPagina:10
    };
  }

  obtenerProcesoEtapa = () => {
    // this.dataService
    // .Nombramiento()
    // .getEtapaProceso(this.idEtapaProceso)
    // .pipe(
    //     catchError(() => of([])),
    //     finalize(() => { })
    // )
    // .subscribe((response: any) => {
    //     if (response) {
    //         this.etapaProceso = response;
    //     }
    // });

  }

  handleExportar = () => {
    if (this.dataSource.data.length === 0) {
      this.dataService.Message().msgWarning('No se encontró información para exportar.', () => { });
      return;
    }

    this.export = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
      .Nombramiento()
      .getExportConsolidadoPlaza(this.request,1,this.dataSource.dataTotal)
      .pipe(catchError((e) => of(null)), finalize(() => {
        this.dataService.Spinner().hide('sp6');
        this.export = false;
      }))
      .subscribe((response: any) => {
        if (response) {
          saveAs(response, 'procesos-etapas-nombramiento.xlsx');
        } 
        else {
          this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
        }
      });
  }

}

export class ConsolidadoDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;
  public totalvalidado = 0;
  public totalpendiente = 0;
  public totalrechazado = 0;

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize): void {
    this._loadingChange.next(false);                
    if (data.idEtapa === null ||data.idProceso === null ) {
      this._loadingChange.next(false);
      this._dataChange.next([]);
    } 
    else {
      // this.dataService
      //   .Nombramiento()
      //   .getPageConsolidadoPlaza(data, pageIndex, pageSize)
      //   .pipe(
      //     catchError((e) => of(e)),
      //     finalize(() => {
      //       this._loadingChange.next(false);
      //     })
      //   )
      //   .subscribe((response: any) => {
      //     if (response) {
      //       this._dataChange.next(response || []);
      //         this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalRegistro;
      //         this.totalvalidado = (response || []).length === 0 ? 0 : response[0].totalValidado;
      //         this.totalpendiente = (response || []).length === 0 ? 0 : response[0].totalPendiente;
      //         this.totalrechazado = (response || []).length === 0 ? 0 : response[0].totalRechazado;
      //         if ((response || []).length === 0) {
      //           this.dataService.Message().msgWarning('No se encontró información de nombramiento(s) para los criterios de búsqueda ingresados.', () => { });
      //         }
      //     }
      //     else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
      //       this.dataService.Message().msgWarning(response.messages[0], () => { });
      //     } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
      //       this.dataService.Message().msgWarning(response.messages[0], () => { });
      //     } else {
      //       this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => {  });
      //     }
      //   });
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