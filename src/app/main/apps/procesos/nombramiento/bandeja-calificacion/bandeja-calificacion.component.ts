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
import { ResultadoOperacionEnum, TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { EtapaProcesoResponseModel } from '../models/etapa-proceso.model';
import { CatalogoItemEnumNombramiento } from '../_utils/constants';
import { ModalInformacionCalificacionComponent } from '../components/modal-informacion-calificacion/modal-informacion-calificacion.component';
import { ModalAgregarObservarPostulanteComponent } from '../components/modal-agregar-observar-postulante/modal-agregar-observar-postulante.component';

@Component({
  selector: 'minedu-bandeja-calificacion',
  templateUrl: './bandeja-calificacion.component.html',
  styleUrls: ['./bandeja-calificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaCalificacionComponent implements OnInit {

  form: FormGroup;
  loading: false;
  export = false;
  now = new Date();
  selectedDoc = 0;
  selectedInstancia = 0;
  selectedSubInstancia = 0;
  selectedGrupoInscripcion = 0;
  comboLists = {
    listTipoDocumento: [],
    listInstancia: [],
    listSubInstancia: [],
    listEstado: [],
    listEstadoCalificacion: [],
    listGrupoInscripcion: [],
  };

  displayedColumns: string[] = [
    'registro',
    'descripcionInstancia',        
    'descripcionSubInstancia',
    'descripcionGrupoInscripcion',
    'codigoModular',
    'institucionEducativa',
    'ordenMerito',
    'numeroDocumento',
    'apellidoPaterno',
    'codigoPlaza', 
    'puntajeFinal',
    'descripcionEstadoCalificacion',
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
  dataSource: CalificacionDataSource | null;
  idDNI:number;
  selection = new SelectionModel<any>(true, []);
  paginatorPageSize = 10;
  paginatorPageIndex = 0;
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
      anio: null,
      idEtapaProceso:null,

      idInstancia: null,
      idSubInstancia: null,
      idGrupoInscripcion: null,
      codigoPlaza: null,

      idTipoDocumento: null,
      numeroDocumentoIdentidad:null,
      idEstadoCalificacion: null,

  };

  idEtapaProceso: number;
  codigoEtapa: string;
  codigoProceso:string;
  abreviaturaModalidadEducativa:string;
  etapaProceso: EtapaProcesoResponseModel = new EtapaProcesoResponseModel();

    constructor(
      private router: Router,      
      private route: ActivatedRoute,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private materialDialog: MatDialog,
    ) { }

  ngOnInit(): void {
    this.handleResponsive();
    this.buildSeguridad();   
    // this.idEtapaProceso = parseInt(this.route.snapshot.params.idEtapaProceso);
    this.idEtapaProceso = parseInt(this.route.snapshot.params.idProceso);
    this.buildForm();

    this.dataSource = new CalificacionDataSource(this.dataService);

    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
  
    if(this.hasAccessPage){
        this.loadTipoDocumento();
        this.loadInstancia();
        this.loadGrupoInscripcion();
        this.loadEstadoCalificacion();
        this.obtenerEtapaProceso();
        this.buscarCalificacion(true); 
    }
    else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });    
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
      anio: [null],

      idInstancia: [null],
      idSubInstancia: [null],
      idGrupoInscripcion: [null],
      codigoPlaza: [null],

      idTipoDocumento: [null],
      numeroDocumentoIdentidad: [null],
      idEstadoCalificacion: [null],
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

  handleGoNombramiento = () => {    this.router.navigate(['../../../'], { relativeTo: this.route }); } 
  handleLimpiar(): void {this.resetForm(); }
  handleBuscar(): void { this.buscarCalificacion(true); }

  buscarCalificacion = (fistTime: boolean = false) => {
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

  handleInformacionCalificacion(row: any){

    this.dialogRef = this.materialDialog.open(ModalInformacionCalificacionComponent, {
      panelClass: 'modal-proceso-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "",
          title: "Ver información completa",
          action: "informate",
          info: { instancia: 16 },
          editable: true
        },
        idCalificacion: row.idCalificacion,
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

  handleObservacionPostulante(row: any){

    this.dialogRef = this.materialDialog.open(ModalAgregarObservarPostulanteComponent, {
      panelClass: 'modal-proceso-form-dialog',
      disableClose: true,
      data: {
        modal: {
          icon: "",
          title: "Observar Postulante",
          action: "informate",
          info: { instancia: 16 },
          editable: true
        },
        calificacion: row
      }
    });

    this.dialogRef.afterClosed()
      .subscribe((response: any) => {
        debugger
        if (!response) {
        }
        if (response.reload) { 
           this.buscarCalificacion();
        }
      });                                          
  } 
  
  resetForm = () => {  
    this.form.reset(); 
    this.form.get('anio').setValue(new Date("YYYY"));
    this.form.controls['idTipoDocumento'].setValue(this.idDNI);
    this.form.controls['idInstancia'].setValue(0);
    this.form.controls['idSubInstancia'].setValue(0);
    this.form.controls['idGrupoInscripcion'].setValue(0);
    this.form.controls['idEstadoCalificacion'].setValue(0);    
  }

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

  loadEstadoCalificacion = () => {
    this.dataService
      .Nombramiento()
      .getComboCatalogoItem(CatalogoItemEnumNombramiento.ESTADO_CALIFICACION)
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
              this.comboLists.listEstadoCalificacion = data;
          }
      });
  }

  loadInstancia = () => {
  this.dataService.Nombramiento()
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
              this.comboLists.listInstancia = data;
          }
      });
  }

  loadSubInstancia = (dataSubInstancia) => {
    this.dataService.Nombramiento()
        .getComboSubInstancia(dataSubInstancia)
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
                this.comboLists.listSubInstancia = data;
            }
        });
  }

  loadGrupoInscripcion = () => {
    // this.setRequest();
    // this.dataService.Nombramiento()
    //     .getComboGrupoInscripcion(this.request)
    //     .pipe(
    //         catchError(() => of([])),
    //         finalize(() => { })
    //     )
    //     .subscribe((response: any) => {
    //         if (response) {
    //             var index=0;
                
    //             response.splice(index,0,
    //                                {idGrupoInscripcion:0,
    //                                 codigoGrupoInscripcion:0,
    //                                 descripcionGrupoInscripcion:"SELECCIONAR"});
    //             const data = response.map((x) => ({
    //                 ...x,
    //                 value: x.idGrupoInscripcion,
    //                 label: `${x.descripcionGrupoInscripcion}`,
    //             }));
    //             this.comboLists.listGrupoInscripcion = data;
    //         }
    //     });
  }

  setRequest = () => {
    this.request = {
        anio: (new Date()).getFullYear(),
        idInstancia: this.form.get('idInstancia').value,
        idSubInstancia: this.form.get('idSubInstancia').value,
        idGrupoInscripcion: this.form.get('idGrupoInscripcion').value,
        codigoPlaza: this.form.get('codigoPlaza').value,

        idTipoDocumento: this.form.get('idTipoDocumento').value,
        numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
        idEstadoCalificacion: this.form.get('idEstadoCalificacion').value,
        idEtapaProceso:this.idEtapaProceso,
    };
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
      .getExportEtapaProceso(this.request,1,this.dataSource.dataTotal)
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

  getInfo = ()=>{
  }

  obtenerEtapaProceso = () => {
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
    if (data.anio === null) {
      this._loadingChange.next(false);
      this._dataChange.next([]);
    } 
    else {
      // this.dataService
      //   .Nombramiento()
      //   .getPageCalificacion(data, pageIndex, pageSize)
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