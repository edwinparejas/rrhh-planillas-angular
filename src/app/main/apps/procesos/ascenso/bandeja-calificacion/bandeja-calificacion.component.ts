import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { EtapaResponseModel } from 'app/main/apps/procesos/ascenso/models/ascenso.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
import { TablaConfiguracionFormatoCarga,ModalidadEdicativaEnum,EstadoCalificacionEnum,ResultadoEliminarCagaEnum,PAGE_ORIGEN,ResultadoOperacionEnum } from '../_utils/constants';
import { BuscadorServidorPublicoComponent } from '../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { VerDetalleCalificacionAscensoComponent} from '../components/detalle-calificacion/ver-detalle-calificacion.component';
import { TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import Swal from 'sweetalert2';
import {
    TablaConfiguracionSistema,
    TablaConfiguracionFuncionalidad,
} from "app/core/model/types";

@Component({
  selector: 'minedu-bandeja-calificacion',
  templateUrl: './bandeja-calificacion.component.html',
  styleUrls: ['./bandeja-calificacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaCalificacionComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  loading: false;
  export = false;
  now = new Date();
  selectedDoc = 0;
  selectedInstancia = 0;
  selectedSubInstancia = 0;
  selectedGrupoCompetencia = 0;
  comboLists = {
    listTipoDocumento: [],
    listInstancia: [],
    listSubInstancia: [],
    listEstado: [],
    listGrupoCompetencia: []
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
idDNI:number;
dataSource: CalificacionDataSource | null;
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
resultadoOperacion=ResultadoOperacionEnum;
estadoCalificacion = EstadoCalificacionEnum;
resultadoEliminarCarga=ResultadoEliminarCagaEnum;
working=true;
request = {
    idTipoDocumento: null,
    idInstancia: null,
    idSubInstancia: null,
    idGrupoCompetencia: null,
    idRolPassport: null,
    idProceso:null,
    idEtapa:null,
    numeroDocumentoIdentidad:null
};
idRolPassport: number = 1;
idEtapa: number;
idProceso:number;
codigoEtapa: string;
codigoProceso:string;
abreviaturaModalidadEducativa:string;
totalCalificacionesProcesoEtapa:number;
etapa: EtapaResponseModel = new EtapaResponseModel();
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
    this.idProceso = this.route.snapshot.params.idProceso;
    this.idEtapa = this.route.snapshot.params.idEtapa;
    this.buildForm();
    this.dataSource = new CalificacionDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    //this.resetForm();
  
    if(this.hasAccessPage){
        this.loadTipoDocumento();
        this.loadInstancia();
        this.loadGrupoCompetencia();
        this.buscarProcesosCalificacion(true);
        this.obtenerProcesoEtapa();
        this.geTotalCalificaciones();
    }
    else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });
    
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

buildSeguridad = () => {
    this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
    this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
    this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
        !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
        !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
         { 
             this.hasAccessPage=false;
         }else{
          this.hasAccessPage=true;
         }
}
  buildForm = () => {
    this.form = this.formBuilder.group({
        numeroDocumentoIdentidad: [null],
        idTipoDocumento: [null],
        idInstancia: [null],
        idSubInstancia: [null],
        idEstado: [null],
        idGrupoCompetencia: [null],
        /*anio: [null, Validators.required],*/
    });
}


selectInstancia(idInstancia: number): void {
    var dataSubInstancia ={
        instanciaValue :this.form.get('idInstancia').value,
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
  handleGoAscenso = () => {    this.router.navigate(['../../../'], { relativeTo: this.route });} 
  handleLimpiar(): void {this.resetForm();    }
  handleBuscar(): void {this.buscarProcesosCalificacion();    }
  handleCargaMasiva = () => {
      if( this.totalCalificacionesProcesoEtapa==0){
      this.datos.idRequerimiento = 0;
      const param = this.routeGenerator(this.datos);
      this.router.navigate([param, 'cargamasiva'], { relativeTo: this.route });
      }else{
        this.dataService.Message().msgWarning('No se puede cargar calificaciones. Ya existen calificaciones para el proceso y etapa ',() => { });
      }

};
  handleEliminarMasivo=()=>{
    //M05: “ESTAS SEGURO QUE DESEAS ELIMINAR LA INFORMACION”
    let message = '¿Está seguro que deseas eliminar la información? ';
    Swal.fire({
        title: '',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0073b7',
        cancelButtonColor: '#333333',
        confirmButtonText: 'Si',
        cancelButtonText: 'No',
    }).then((result) => {
        if (result.value) {
            this.eliminarCalificaciones();
        }else{
          //  M16: “OPERACIÓN DE ELIMINACIÓN CANCELADA”.
             this.dataService.Message().msgAutoCloseWarningNoButton('Operación de eliminación cancelada',this.tiempoMensaje,() => { });
        }

    });
}
   
 

buscarServidorPublico = () => { }
busquedaPersonalizada = () => { 
         
          this.dialogRef = this.materialDialog.open(BuscadorServidorPublicoComponent, {
                        
                        panelClass: 'minedu-buscador-servidor-publico-dialog',
                        width: '980px',
                        disableClose: true,
                        data: {
                            action: 'busqueda',
                        },
                        
                    }
                );
                this.dialogRef.afterClosed().subscribe((resp) => {
                    if (resp != null) {
                        const servidorPublico = resp;
                        this.form.get('numeroDocumentoIdentidad').setValue(servidorPublico.numeroDocumentoIdentidad);
                    }
                }); 

}
verDetalle = (row) => { 
         
    this.dialogRef = this.materialDialog.open(VerDetalleCalificacionAscensoComponent, {
                   
                   panelClass: 'minedu-ver-detalle-calificacion-dialog',
                   width: '980px',
                   disableClose: true,
                   data: {
                       action: 'busqueda',
                       dataKey: row
                   },
               }
           );
}

buscarProcesosCalificacion = (fistTime: boolean = false,showMessage:boolean=true) => {
  this.setRequest();
  if (fistTime) {
      this.dataSource.load(this.request, 1, 10,showMessage);
  } else {          
      this.dataSource.load(
          this.request,
          this.paginator.pageIndex + 1,
          this.paginator.pageSize,showMessage
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
    this.form.controls['idTipoDocumento'].setValue(this.idDNI);
    this.form.controls['idInstancia'].setValue(0);
    this.form.controls['idSubInstancia'].setValue(0);
    this.form.controls['idGrupoCompetencia'].setValue(0);
    
}
loadTipoDocumento = () => {
  this.dataService.Ascenso()
      .getComboTipodocumento()
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response && response.result) {
            var index=0;
            response.data.splice(index,0,
                               {idCatalogoItem:0,
                                codigoCatalogoItem:0,
                                abreviaturaCatalogoItem:"TODOS"});
              const data = response.data.map((x) => ({
                  ...x,
                  value: x.idCatalogoItem,
                  label: `${x.abreviaturaCatalogoItem}`,
              }));
              this.idDNI=0;
                    data.forEach(x => {
                        if(x.label==='DNI' || x.label==='D.N.I.') this.idDNI=  x.value; 
                    });
              this.form.controls['idTipoDocumento'].setValue(this.idDNI);
              this.comboLists.listTipoDocumento = data;
          }
      });
}
loadInstancia = () => {
  this.dataService.Ascenso()
      .getComboInstancia()
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response && response.result) {
            var index=0;
            response.data.splice(index,0,
                               {idInstancia:0,
                                id:0,
                                descripcionInstancia:"TODOS"});
              const data = response.data.map((x) => ({
                  ...x,
                  value: x.id,
                  label: `${x.descripcionInstancia}`,
              }));
              this.comboLists.listInstancia = data;
          }
      });
}
geTotalCalificaciones() {


    var data={
       idProceso:Number(this.idProceso), 
       idEtapa:Number(this.idEtapa) 
   };
   this.dataService.Ascenso()
   .contarMasivoCargado(data)
   .pipe(
      catchError((e) => of(e)),
       finalize(() => { })
   ).subscribe((response: any) => {
   
       if (response && response.result) {
            this.totalCalificacionesProcesoEtapa=response.data;
       }  else if (response && response.statusCode === this.resultadoOperacion.NotFound) {
           this.dataService.Message().msgWarning(response.messages[0], () => { });
       } else if (response && response.statusCode === this.resultadoOperacion.UnprocessableEntity) {
           this.dataService.Message().msgWarning(response.messages[0], () => { });
       } else {
           this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => { this.working = false; });
       }
   
   
       
   });
   
   }
eliminarCalificaciones() {

 var data={
    idProceso:Number(this.idProceso), 
    idEtapa:Number(this.idEtapa) 
};
this.dataService.Ascenso()
.eliminarMasivo(data)
.pipe(
   catchError((e) => of(e)),
    finalize(() => { })
).subscribe((response: any) => {

    if (response && response.result) {
        this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.',this.tiempoMensaje,() => { });
        this.buscarProcesosCalificacion(false,false);
        this.geTotalCalificaciones();
    }  else if (response && response.statusCode === this.resultadoOperacion.NotFound) {
        this.dataService.Message().msgWarning(response.messages[0], () => { });
    } else if (response && response.statusCode === this.resultadoOperacion.UnprocessableEntity) {
        this.dataService.Message().msgWarning(response.messages[0], () => { });
    }
     else {
        this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
    }


    
});

}

loadSubInstancia = (dataSubInstancia) => {
   this.dataService.Ascenso()
        .getComboSubInstancia(dataSubInstancia)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response && response.result) {
                var index=0;
                response.data.splice(index,0,
                                   {idSubinstancia:0,
                                    id:0,
                                    descripcionSubinstancia:"TODOS"});
                const data = response.data.map((x) => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcionSubinstancia}`,
                }));
                this.comboLists.listSubInstancia = data;
            }
        });
  }
  loadGrupoCompetencia = () => {
    this.dataService.Ascenso()
        .getComboGrupoCompetencia()
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response && response.result) {
                var index=0;
                response.data.splice(index,0,
                                   {idGrupoCompetencia:0,
                                    codigoGrupoCompetencia:0,
                                    descripcionGrupoCompetencia:"TODOS"});
                const data = response.data.map((x) => ({
                    ...x,
                    value: x.idGrupoCompetencia,
                    label: `${x.descripcionGrupoCompetencia}`,
                }));
                this.comboLists.listGrupoCompetencia = data;
            }
        });
  }

setRequest = () => {
  this.request = {
      idTipoDocumento: this.form.get('idTipoDocumento').value,
      idInstancia: this.form.get('idInstancia').value,
      idSubInstancia: this.form.get('idSubInstancia').value,
      idGrupoCompetencia: this.form.get('idGrupoCompetencia').value,
      numeroDocumentoIdentidad: this.form.get('numeroDocumentoIdentidad').value,
      idRolPassport: this.idRolPassport,
      idEtapa:this.idEtapa,
      idProceso:this.idProceso
  };
 
}

getInfo = ()=>{
}

obtenerProcesoEtapa = () => {
    this.dataService.Ascenso()
    .getEtapaById(this.idEtapa)
    .pipe(
        catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response && response.result) {
            this.etapa=response.data;
            this.codigoEtapa=this.etapa.codigoEtapa;
            this.codigoProceso=this.etapa.codigoProceso;
            this.abreviaturaModalidadEducativa=this.etapa.abreviaturaModalidadEducativa;
        }
    });

  }

  handleExportar = () => {


    let message = '¿Está seguro de exportar la información?';
    Swal.fire({
        title: '',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0073b7',
        cancelButtonColor: '#333333',
        confirmButtonText: 'SI',
        cancelButtonText: 'NO',
    }).then((result) => {

        if (result.value) {
    if (this.dataSource.data.length === 0) {
        this.dataService
            .Message()
            .msgWarning('No se encontró información para para exportar.', () => { });
        return;
    }

    this.export = true;
    this.dataService.Spinner().show('sp6');
    this.dataService
        .Ascenso()
        .exportarExcelCalificaciones(
            this.request,
            1,
            this.dataSource.dataTotal)
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
                        'No se encontró información para los criterios de búsqueda ingresado',
                        () => { }
                    );
            }
        });
    }else{
        //M15 - “EXPORTACION CANCELADA”
        this.dataService.Message().msgAutoCloseWarningNoButton('Exportación cancelada.',this.tiempoMensaje,() => { });
    }
 });

}
private routeGenerator = (data: any): string => {
    let formatoFiltrar=0;
    let codigoFuncionalidad=0;
     if(this.abreviaturaModalidadEducativa==ModalidadEdicativaEnum.EBR)codigoFuncionalidad=TablaConfiguracionFormatoCarga.EBR;
     if(this.abreviaturaModalidadEducativa==ModalidadEdicativaEnum.ETP)codigoFuncionalidad=TablaConfiguracionFormatoCarga.ETP;
    const param =
        (TablaConfiguracionSistema.PERSONAL + "").padStart(3, "0") +
        (codigoFuncionalidad + "").padStart(4, "0") +
        String(this.codigoProceso).padStart(10, "0") +
        String(this.codigoEtapa).padStart(10, "0") +
        String(formatoFiltrar).padStart(10, "0");
    return param;
};
}


export class CalificacionDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;

  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize,showMessage:boolean=true): void {
      this._loadingChange.next(false);                
      if (data.anio === null) {
          this._loadingChange.next(false);
          this._dataChange.next([]);
      } else {
          this.dataService
              .Ascenso()
              .getListaCalificacion(data, pageIndex, pageSize)
              .pipe(
                  catchError(() => of([])),
                  finalize(() => {
                      this._loadingChange.next(false);
                  })
              )
              .subscribe((response: any) => {
                if (response && response.result) {
                  this._dataChange.next(response.data || []);
                  this.totalregistro = (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro;
                  if ((response.data || []).length === 0) {
                    if(showMessage){
                      this.dataService
                          .Message()
                          .msgWarning(
                              'No se encontró información para los criterios de búsqueda ingresado.',
                              () => { }
                          );
                    }
                  }
                }else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                }else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                }else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => {  });
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
 