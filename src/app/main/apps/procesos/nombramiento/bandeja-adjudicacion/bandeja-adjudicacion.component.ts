import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { saveAs } from 'file-saver';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultadoOperacionEnum, TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service';
import { CatalogoItemEnumNombramiento } from '../_utils/constants';
import { EtapaProcesoResponseModel } from '../models/etapa-proceso.model';

@Component({
  selector: 'minedu-bandeja-adjudicacion',
  templateUrl: './bandeja-adjudicacion.component.html',
  styleUrls: ['./bandeja-adjudicacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaAdjudicacionComponent implements OnInit {

  form: FormGroup;
  loading: false;
  export = false;
  now = new Date();
  selectedDoc = 0;
  selectedEstadoAdjudicacion = 0;
  selectedInstancia = 0;
  selectedSubInstancia = 0;
  selectedGrupoCompetencia = 0;
  comboLists = {
    listTipoDocumento: [],
    // listInstancia: [],
    // listSubInstancia: [],
    listEstadoAdjudicacion: [],
    // listGrupoCompetencia: []
  };
  displayedColumns: string[] = [
    'registro',
    'descripcionInstancia',        
    'descripcionSubinstancia',
    'numeroDocumento',
    'apellidoPaterno',
    'descripcionGrupoCompetencia',
    'codigoPlaza', 
    'puntajeFinal',
    'escalaObtenida',
    'estado',
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

  dataSource: AdjudicacionDataSource | null;
  idDNI:number;
  selection = new SelectionModel<any>(true, []);
  @ViewChild('paginator', { static: true }) paginator: MatPaginator;

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
  datos = {
      idRequerimiento: null
    };
  working=true;
  request = {
      idTipoDocumento: null,
      numeroDocumentoIdentidad:null,
      idEstadoAdjudicacion: null,
      idRolPassport: null,
      idEtapaProceso:null
  };
  idRolPassport: number = 1;
  idEtapaProceso: number;
  codigoEtapa: string;
  codigoProceso:string;
  abreviaturaModalidadEducativa:string;
  totalCalificacionesProcesoEtapa:number;
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
    this.handleResponsive();
    this.buildSeguridad();   
    this.idEtapaProceso = this.route.snapshot.params.idEtapaProceso;
    this.buildForm();

    this.dataSource = new AdjudicacionDataSource(this.dataService);
    
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
  
    if(this.hasAccessPage){
        this.loadTipoDocumento();
        this.loadEstadoAdjudicacion();
        this.obtenerProcesoEtapa();
        this.buscarAdjudicacion(true);
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
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar && !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar && !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
    {
      this.hasAccessPage=false;
    }
    else{
      this.hasAccessPage=true;
    }
  }

  buildForm = () => {
    this.form = this.formBuilder.group({
      numeroDocumentoIdentidad: [null],
      idTipoDocumento: [null],
      idEstadoAdjudicacion: [null],
      codigoModular: [null],
      codigoPlaza: [null],
    });
  }

  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  buildShared() {
      this.sharedService.setSharedBreadcrumb("Adjudicación");
      this.sharedService.setSharedTitle("Adjudicación de plazas");
  }

  handleGoNombramiento = () => {    this.router.navigate(['../../../'], { relativeTo: this.route }); } 
  handleLimpiar(): void {this.resetForm(); }
  handleBuscar(): void { this.buscarAdjudicacion(true); }

loadTipoDocumento = () => {
  this.dataService
      .Nombramiento()
      .getComboCatalogoItem(CatalogoItemEnumNombramiento.TIPO_DOCUMENTO_IDENTIDAD)
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
              this.idDNI = 0;
              data.forEach(x => {
                  if(x.label==='DNI' || x.label==='D.N.I.') this.idDNI=  x.value; 
              });
              this.form.controls['idTipoDocumento'].setValue(this.idDNI);
              this.comboLists.listTipoDocumento = data;
          }
      });
}

loadEstadoAdjudicacion = () => {
  this.dataService
      .Nombramiento()
      .getComboCatalogoItem(CatalogoItemEnumNombramiento.ESTADO_ADJUDICACION)
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response) {
            var index=0;
            response.splice(index,0,
              {idCatalogoItem:0,
              codigoCatalogoItem:0,
              descripcionCatalogoItem:"SELECCIONAR"});
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`,
            }));
            this.comboLists.listEstadoAdjudicacion = data;
          }
      });
}

buscarAdjudicacion = (fistTime: boolean = false) => {
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

handleExportar = () => {
  if (this.dataSource.data.length === 0) {
    this.dataService.Message().msgWarning('No se encontró información para exportar.', () => { });
    return;
  }

  this.export = true;
  this.dataService.Spinner().show('sp6');
  // this.dataService
  //   .Nombramiento()
  //   .getExportAdjudicacion(this.request, 1, this.dataSource.dataTotal)
  //   .pipe(catchError((e) => of(null)), finalize(() => {
  //     this.dataService.Spinner().hide('sp6');
  //     this.export = false;
  //   }))
  //   .subscribe((response: any) => {
  //     if (response) {
  //       saveAs(response, 'plazas-prepublicadas-nombramiento.xlsx');
  //     } 
  //     else {
  //       this.dataService.Message().msgWarning('No se encontró información para los criterios de búsqueda ingresado', () => { });
  //     }
  //   });
}

resetForm = () => {  
  this.form.reset(); 
  this.form.controls['idTipoDocumento'].setValue(this.idDNI);
  // this.form.controls['idInstancia'].setValue(0);
  // this.form.controls['idSubInstancia'].setValue(0);
  // this.form.controls['idGrupoCompetencia'].setValue(0);
}

setRequest = () => {
  this.request = {
      idTipoDocumento: this.form.get('idTipoDocumento').value,
      idEstadoAdjudicacion: this.form.get('idEstadoAdjudicacion').value,
      numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
      idRolPassport: this.idRolPassport,
      idEtapaProceso:this.idEtapaProceso,
  };
}

obtenerProcesoEtapa = () => {
    // this.dataService.Nombramiento()
    // .getEtapaProceso(this.idEtapaProceso)
    // .pipe(
    //     catchError(() => of([])),
    //     finalize(() => { })
    // )
    // .subscribe((response: any) => {
    //     if (response) {
    //         this.etapaProceso=response;
    //     }
    // });
  }
}

export class AdjudicacionDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
    super();
  }

  load(data: any, pageIndex, pageSize): void {
    this._loadingChange.next(false);                
    if (data.anio === null) {
      this._loadingChange.next(false);
      this._dataChange.next([]);
    }
    else {
      // this.dataService
      //   .Nombramiento()
      //   .getPageAdjudicacion(data, pageIndex, pageSize)
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
      //         // if ((response || []).length === 0) {
      //         //   this.dataService.Message().msgWarning('No se encontró información de nombramiento(s) para los criterios de búsqueda ingresados.', () => { });
      //         // }
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
