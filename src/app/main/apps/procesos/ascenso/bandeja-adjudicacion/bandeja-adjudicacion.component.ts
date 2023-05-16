import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { EtapaResponseModel } from 'app/main/apps/procesos/ascenso/models/ascenso.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, filter } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../@minedu/animations/animations';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router, NavigationEnd  } from '@angular/router';
import { EstadoAdjudicacionEnum,ResultadoFinalizarEtapaEnum,ResultadoOperacionEnum } from '../_utils/constants';
import {Location} from '@angular/common';
import { BuscadorServidorPublicoComponent } from '../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { BuscadorCodigoPlazaComponent } from '../components/buscador-codigo-plaza/buscador-codigo-plaza.component';
import { VerObservacionAscensoComponent } from '../components/observacion-ascenso/ver-observacion-ascenso.component';
import { LevantarObservacionAscensoComponent } from '../components/levantar-observacion/levantar-observacion-ascenso.component';
import { VerInformacionAdjudicacionAscensoComponent } from '../components/informacion-adjudicacion/ver-informacion-adjudicacion.component';
import Swal from 'sweetalert2';
import { MISSING_TOKEN, TablaConfiguracionFuncionalidad, TablaConfiguracionSistema, TablaPermisos } from '../../../../../core/model/types';
import { SecurityModel } from '../../../../../core/model/security/security.model';
import { SharedService } from 'app/core/shared/shared.service'; 
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';

@Component({
  selector: 'minedu-bandeja-adjudicacion',
  templateUrl: './bandeja-adjudicacion.component.html',
  styleUrls: ['./bandeja-adjudicacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class BandejaAdjudicacionComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  loading: false;
  now = new Date();
  selectedDoc = 0;
  selectedModalidad = 0;
  selectedNivel = 0;
  selectedInstancia = 0;
  selectedSubInstancia = 0;
  selectedEstado = 0;
  anio = 2021;
  abreviaturaRegimenLaboral = 'DECRETO LEGISLATIVO 1057 - CONTRATACION ADMINISTRATIVA DE SERVICIO';
  codigoProceso = "2021-001"
  descripcionEtapaFase = "Regular";
  fechaRegistroEtapa = "24/11/2021";
  comboLists = {
    listTipoDocumento: [],
    listInstancia: [],
    listSubInstancia: [],
    listEstado: [],
    listModalidad: [],
    listNivel: [] 
};
displayedColumns: string[] = [
  'region',
  'centroTrabajo',        
  'nroDocumento',
  'nombreCompleto',
  'grupoCompetencia', 
  'puntajePun',
  'puntajeTrayectoria',
  'bonificacionIncapacidad',
  'puntajeFinal',
  'escala',
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
dataSource: AdjudicacionDataSource | null;
selection = new SelectionModel<any>(true, []);
paginatorPageSize = 10;
paginatorPageIndex = 0;
@ViewChild('paginator', { static: true }) paginator: MatPaginator;
eliminando = false;
dialogRef: any;
currentSession: SecurityModel = new SecurityModel();
tiempoMensaje:number=1000;
permisos = {
    autorizadoAgregar: false,
    autorizadoModificar: false,
    autorizadoEliminar: false,
    autorizadoEnviar: false,
    autorizadoExportar: false,
    autorizadoConsultar:false,
};
hasAccessPage: boolean;
working=true;
estadoAdjudicacion = EstadoAdjudicacionEnum;
resultadoProcesarFin=ResultadoFinalizarEtapaEnum;
resultadoOperacion=ResultadoOperacionEnum;
idDNI:number;
request = {
    idProcesoEtapa: null,
    idInstancia: null,
    idSubInstancia: null,
    idTipoDocumento: null,
   // numeroDocumento: null,
    idModalidadEducativa: null,
    idNivel:null,
    idEstado: null,
    paginaActual:1,
    tamanioPagina:10
};

export = false;
idRolPassport: number = 1;
previousUrl: string = null;
currentUrl: string = null;
idEtapa:number;
idProceso:number;
idEtapaProceso: number;
etapa: EtapaResponseModel = new EtapaResponseModel();
  constructor(
    private rutaActiva: ActivatedRoute,
    private router: Router,                
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    private _location: Location,
    private sharedService: SharedService,
    
  ) { 
  }
  ngOnInit(): void {
    setTimeout(_ => this.buildShared());
    this.handleResponsive();
    this.buildSeguridad();   
    this.idProceso = this.rutaActiva.snapshot.params.idProceso;
    // this.idProceso = this.rutaActiva.snapshot.params.idProceso;
    // this.idEtapa = this.rutaActiva.snapshot.params.idEtapa;
    this.buildForm();
    this.dataSource = new AdjudicacionDataSource(this.dataService);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = 'Filas por tabla';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.firstPageLabel = 'Primera página';
    this.paginator._intl.lastPageLabel = 'Última página';
    //this.resetForm();
  
    if(this.hasAccessPage){
        this.obtenerProcesoEtapa();
        this.loadTipoDocumento();
        this.loadInstancia();
        this.loadModalidad();
        this.loadEstado();
        this.buscarAdjudicaciones(true);  
        //this.loadEstadoAdjudicacion();
        // this.buscarAdjudicaciones(true);
    }
    else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });  
  }
  ngAfterViewInit(): void {
   /* this.paginator.page.subscribe(() =>
        this.loadData(
            (this.paginator.pageIndex + 1).toString(),
              this.paginator.pageSize.toString()
          )
      );*/
  }
ngOnDestroy(): void { }

  buildForm = () => {
    this.form = this.formBuilder.group({
        idTipoDocumento: [null],
        numeroDocumentoIdentidad: [null],
        idCodigoPlaza: [null],
        idCargo:  [null],
        idInstancia: [null],
        idSubInstancia: [null],
        idModalidadEducativa: [null],
        idNivel: [null],
        idEstado: [null]
    });
}
buildSeguridad = () => {
    this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
    this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
    this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
    this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    this.idRolPassport=this.currentSession.idRol;
    if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
        !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
        !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
         { 
             this.hasAccessPage=false;
         }else{
          this.hasAccessPage=true;
         }
}
buildShared() {
    this.sharedService.setSharedBreadcrumb("Procesos de ascenso");
    this.sharedService.setSharedTitle("Desarrollo de procesos de ascensos");
}
selectInstancia(idInstancia: number): void {
  var dataSubInstancia ={
      instanciaValue :this.form.get('idInstancia').value,
      activo : true
  }
    this.loadSubInstancia(dataSubInstancia);
}
selectNivel(idModalidadEducativa: number): void {
    var dataNivel = {
        modalidadValue :this.form.get('idModalidadEducativa').value,
        activo : true
    }
    this.loadNivel(dataNivel);
}
handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
}
handleLimpiar(): void {this.resetForm();    }
// handleGoAscenso = () => {
//     this.router.navigate(['../../../'], { relativeTo: this.rutaActiva });
// } 

handleGoAscenso(){
   this._location.back();
 };

handleBuscar(): void {this.buscarAdjudicaciones();    }

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
                        this.form.get('idTipoDocumento').setValue(servidorPublico.idTipoDocumentoIdentidad);
                    }
                }); 

}
busquedaPlazas = () => { 
         this.dialogRef = this.materialDialog.open(BuscadorCodigoPlazaComponent, {
                        
                        panelClass: 'minedu-buscador-codigo-plaza-dialog',
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
                        this.form.get('idCodigoPlaza').setValue(servidorPublico.codigoPlaza);  
                    }
                }); 
}
verObservacion = ( row) =>{
            this.dialogRef = this.materialDialog.open(VerObservacionAscensoComponent, {
                panelClass: 'minedu-ver-observacion-ascenso-dialog',
                width: '600px',
                disableClose: true,
                data: {
                    action: 'busqueda',
                    dataKey: row
                },
                
            }
        );
}
levantarObservacion = (row) =>{
    this.dialogRef = this.materialDialog.open(LevantarObservacionAscensoComponent, {
        panelClass: 'minedu-levantar-observacion-ascenso-dialog',
        width: '600px',
        disableClose: true,
        data: {
            action: 'busqueda',
            dataKey: row,
            parent:this
        },
    }
);
}
verInformacionAccionPersonal = (row) =>{
    this.dialogRef = this.materialDialog.open(VerInformacionAdjudicacionAscensoComponent, {
        panelClass: 'minedu-ver-informacion-adjudicacion-dialog',
        width: '980px',
        disableClose: true,
        data: {
            action: 'busqueda',
            dataKey : row
        },
    }
);
}
verActa = (row) =>{

};
eliminarCargaMasiva = () => {
    this.dataService.Ascenso()
    .getEliminarCargaMasiva(this.idProceso)
    .pipe(
        catchError(() => of([])),
        finalize(() =>{})
    )
    .subscribe((response: any) => {
        console.log("idProceso", this.idProceso);
        console.log('response', response);
        if(response){
            this.dataService.Message().msgAutoSuccess('Eliminado exitosamente',this.tiempoMensaje,() => { });
        }
    })

}
obtenerProcesoEtapa = () => {
    this.dataService.Ascenso()
    .getProcesoById(this.idProceso)
    .pipe(
        catchError(() => of([])),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        console.log('obtenerProcesoEtapa', response);
        if (response) {
            this.etapa=response;
            console.log('obtenerProcesoEtapa',this.etapa);
        }
    });
}


handleFinalizarEtapa= () => {
    let message = '¿Está seguro de finalizar etapa? ';
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
                this.FinalizarEtapa();
            }else{
                this.dataService.Message().msgAutoCloseWarningNoButton('Operación finalizar etapa ha sido cancelada',this.tiempoMensaje,() => { });
            }

        });
    }
handleAdjudicar = () => {
    
    let message = 'Se adjudicará a todos los postulantes aptos que comprenden esta etapa del proceso ¿Desea confirmar la operación?';
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
                this.ActualizarAptos();
            }else{
                //M17: “OPERACIÓN DE ADJUDICACION CANCELADA”.
                this.dataService.Message().msgAutoCloseWarningNoButton('Operación de adjudicación cancelada.',this.tiempoMensaje,() => { });
            }

        });
    }

// handleExportar = () => {
//     let message = '¿Está seguro de exportar la información?';
//     Swal.fire({
//         title: '',
//         text: message,
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#0073b7',
//         cancelButtonColor: '#333333',
//         confirmButtonText: 'SI',
//         cancelButtonText: 'NO',
//     }).then((result) => {

//         if (result.value) {
//     if (this.dataSource.data.length === 0) {
//         this.dataService
//             .Message()
//             .msgWarning('No se encontró información para para exportar.', () => { });
//         return;
//     }
//     this.export = true;
//     this.dataService.Spinner().show('sp6');
//     this.dataService
//         .Ascenso()
//         .exportarExcelAdjudicacion(
//             this.request,
//             1,
//             this.dataSource.dataTotal)
//         .pipe(
//             catchError((e) => of(null)),
//             finalize(() => {
//                 this.dataService.Spinner().hide('sp6');
//                 this.export = false;
//             })
//         )
//         .subscribe((response: any) => {
//             console.log("export", response);
//             if (response) {
//                 saveAs(response, 'ascenso.xlsx');
//             } else {
//                 this.dataService
//                     .Message()
//                     .msgWarning(
//                         'No se encontró información para los criterios de búsqueda ingresado',
//                         () => { }
//                     );
//             }
//         });
//     }else{
//         //M15 - “EXPORTACION CANCELADA”
//         this.dataService.Message().msgAutoCloseWarningNoButton('Exportación cancelada.',this.tiempoMensaje,() => { });
//     }
// });
// }

handleExportar = () => {
       
    if (this.dataSource.data.length === 0) {
        this.dataService.Message().msgWarning('"NO SE ENCONTRÓ INFORMACIÓN PARA EXPORTAR."', () => {} );
        return;
    }
    this.dataService.Spinner().show("sp6");
    this.dataService.Ascenso().exportarExcelAdjudicacion(this.request, 1, this.dataSource.dataTotal).pipe(
        catchError((e) => of(null)),
        finalize(() => {
            this.dataService.Spinner().hide("sp6");
        })
    )
    .subscribe((response: any) => {
        console.log("exportando", response);
        if (response) {
            console.log("entre...!!",response);
            saveAs(response, "ascenso_adjudicacion.xlsx");
        } else {
            this.dataService.Message().msgWarning('"NO SE GENERÓ CORRECTAMENTE EL ARCHIVO EXCEL DE CONSOLIDADO DE PLAZAS."', () => {} );
        }
    });
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
  this.form.controls['idModalidad'].setValue(0);
  this.form.controls['idInstancia'].setValue(0);
  this.form.controls['idSubInstancia'].setValue(0);
  this.form.controls['idEstado'].setValue(0);

}

loadTipoDocumento = () => {
  this.dataService.Ascenso()
      .getComboTipodocumento()
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          console.log('tipoDocumento',response);
          if (response) {
            var index=0;
            response.splice(index,0,
                               {idCatalogoItem:0,
                                codigoCatalogoItem:0,
                                abreviaturaCatalogoItem:"TODOS"});
              const data = response.map((x) => ({
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
          console.log('tipoDocumento',this.comboLists);
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
          console.log('instancias:', response);
          if (response ) {
            var index=0;
            response.splice(index,0,
                               {idInstancia:0,
                                id:0,
                                descripcionInstancia:"TODOS"});
              const data = response.map((x) => ({
                  ...x,
                  value: x.id,
                  label: `${x.descripcionInstancia}`,
              }));
              this.comboLists.listInstancia = data;
          }
      });
}
loadEstado = () => {
    this.dataService.Ascenso()
        .getComboEstado()
        .pipe(
            catchError(() => of([])),
            finalize(() => {})
        )
        .subscribe((response: any) => {
            console.log('estado',response);
            if(response){
                var index=0;
                response.splice(index,0,
                            {idCatalogoItem:0,
                                codigoCatalogoItem:0,
                                abreviaturaCatalogoItem:'',
                                descripcionCatalogoItem:"TODOS"});
            const data = response.map((x) => ({
                ...x,
                value: x.idCatalogoItem,
                label: `${x.descripcionCatalogoItem}`
            }));
            this.comboLists.listEstado = data;
            }
        })
}
// loadAdjudicacion = () => {
//     this.dataService.Ascenso()
//         .getListarAdjudicacion()
//         .pipe(
//             catchError(() => of([])),
//             finalize(()=>{})
//         )
//         .subscribe((response: any) => {
//             if(response){
//                 var index = 0;
//                 response.splice(index,0,
//                                 {

//                                 });
//                 const data = response.map((x) => ({
//                     ...x,
//                     value:x.id,
//                     label: `${""}`,
//                 }));
//                 this.comboLists.listAdjudicacion = data;
//             }
//         })
// }
loadSubInstancia = (dataSubInstancia) => {
    this.dataService.Ascenso()
        .getComboSubInstancia(dataSubInstancia)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response) {
                var index=0;
                response.splice(index,0,
                                   {idSubinstancia:0,
                                    id:0,
                                    descripcionSubinstancia:"TODOS"});
                const data = response.map((x) => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcionSubinstancia}`,
                }));
                this.comboLists.listSubInstancia = data;
            }
        });
  }

loadModalidad = () => {
    this.dataService.Ascenso()
        .getComboModalidad()
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            console.log('modalidad:', response);
            if (response) {
                var index=0;
                response.splice(index,0,
                                   {idModalidadEducativa:0,
                                    codigoModalidadEducativa:0,
                                    descripcionModalidadEducativa:"TODOS"});
                const data = response.map((x) => ({
                    ...x,
                    value: x.codigoModalidadEducativa,
                    label: `${x.descripcionModalidadEducativa}`,
                }));
                this.comboLists.listModalidad = data;
            }
        });
  }
  loadNivel =(dataNivel) => {
    this.dataService.Ascenso()
        .getComboNivel(dataNivel)
        .pipe(
            catchError(()=>of([])),
            finalize(() =>{})
        )
        .subscribe((response: any) => {
            console.log('nivel:', response);
            if(response) {
                var index = 0;
                response.splice(index,0,
                                {idNivelEducativa:0,
                                codigoNivelEducativa:0,
                                descripcionNivelEducativo:"TODOS"});
                const data = response.map((x) =>({
                    ...x,
                    value: x.idNivelEducativa,
                    label: `${x.descripcionNivelEducativo}`,
                }));
                this.comboLists.listNivel = data;
            }
        })
}
  loadEstadoAdjudicacion = () => {
    this.dataService.Ascenso()
        .getComboEstadoAdjudicaciones(1)
        .pipe(
            catchError(() => of([])),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response && response.result) {
                var index=0;
                response.data.splice(index,0,
                                   {idCatalogoItem:0,
                                    idCatalogo:0,
                                    descripcionCatalogoItem:"TODOS"});
                const data = response.data.map((x) => ({
                    ...x,
                    value: x.idCatalogoItem,
                    label: `${x.descripcionCatalogoItem}`,
                }));
                this.comboLists.listEstado = data;
            }
        });
  }
  buscarAdjudicaciones = (fistTime: boolean = false) => {
    this.setRequest();
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
setRequest = () => {
  this.request = {
    idProcesoEtapa: 2,
    idInstancia: this.form.get('idInstancia').value,
    idSubInstancia: this.form.get('idSubInstancia').value,
    idTipoDocumento: this.form.get('idTipoDocumento').value,
    idModalidadEducativa: this.form.get('idModalidadEducativa').value,
    idNivel: this.form.get('idNivel').value,
    // numeroDocumento: this.form.get('numeroDocumento').value,
    idEstado: this.form.get('idEstado').value,
    paginaActual:1,
    tamanioPagina:10
    
  };
}

ActualizarAptos = () => {
var data={
    idProceso:Number(this.idProceso), 
    idEtapa:Number(this.idEtapa) 
};
this.dataService.Ascenso()
.AdjudicarAptos(data)
.pipe(
    catchError(() => of([])),
    finalize(() => { })
)
.subscribe((response: any) => {
    if (response && response.result) {
        //M07: “OPERACIÓN REALIZADA DE FORMA EXITOSA”.
        this.dataService
        .Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.',
        this.tiempoMensaje,
        () => { });
        this.buscarAdjudicaciones(); 
    }
});

}

handleCargaMasiva = () => {

    let d = {
        idEtapaProceso: this.idProceso
    }
    // this.dataService.Contrataciones().getVerificarCargaMasiva(d).pipe(
    //     catchError((e) => of([e])),
    //     finalize(() => {
    //         this.dataService.Spinner().hide("sp6");
    //     })
    // )
    // .subscribe((response: any) => {
        // if (response > 0) {
            const data = {
                idEtapaProceso: this.idProceso,
                codigo: 0
            };
    
            const codigo = this.routeGenerator(data);
    
            this.router.navigate([
                "ayni",
                "personal",
                "procesos",
                "ascenso",
                "adjudicacion",
                this.idProceso.toString(),
                codigo,
                "cargamasiva",
            ]);
        // } else {
        //     let r = response[0];
        //     if (r.status == ResultadoOperacionEnum.InternalServerError) {
        //         this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
        //     } else if (r.status == ResultadoOperacionEnum.NotFound) {
        //         this.dataService.Message().msgWarning(r.message, () => { });
        //     } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
        //         this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
        //     } else {
        //         this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
        //     }
        // }
    // });
/*
    this.router.navigate(['.calificacionpun/' + codigo + '/cargamasiva'], {
        relativeTo: this.route,
    })
    */
}

private routeGenerator = (data: any): string => {
    const param =
        (TablaConfiguracionSistema.PERSONAL + "").padStart(3, "0") +
        (TablaConfiguracionFuncionalidad.REGISTRAR_ASCENSOS + "").padStart(
            4,
            "0"
        ) +
        (data.idEtapaProceso + "").padStart(10, "0") +
        (data.codigo + "").padStart(10, "0") +
        "0000000000";

    return param;
};


FinalizarEtapa = () => {
    var data={
        idProceso:Number(this.idProceso), 
        idEtapa:Number(this.idEtapa) 
    };
    this.dataService.Ascenso()
    .Finalizar(data)
    .pipe(
       catchError((e) => of(e)),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response && response.result) {
            if(response.data==998){
                this.dataService.Message().msgWarning("No se puede finalizar la etapa. No existen datos de adjudicaciones.",   () => { });
            }else  if(response.data==999){
                this.dataService.Message().msgWarning("No se puede finalizar la etapa. Aún hay postulantes con estados: APTO, OBSERVADO ó ADJUDICADO.",   () => { });
            }else{
                this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.',this.tiempoMensaje,() => { });
                this.permisos.autorizadoModificar=false;
                this.permisos.autorizadoAgregar=false;
            }
        }  else if (response && response.statusCode === this.resultadoOperacion.NotFound) {
            this.dataService.Message().msgWarning(response.messages[0],   () => { });
        } else if (response && response.statusCode === this.resultadoOperacion.UnprocessableEntity) {
            this.dataService.Message().msgWarning(response.messages[0],   () => { });
        } else {
            this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
        }
    });
    
    }
}

export class AdjudicacionDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _loadingChange = new BehaviorSubject<boolean>(false);
  
  public loading = this._loadingChange.asObservable();
  public totalregistro = 0;
  public totalAdjudicado = 0;
  public totalNoAdjudicado = 0;
  public totalObservado = 0;
  public totalConResolucion = 0;
  public totalRegistroEstados = 0;
  
  constructor(private dataService: DataService) {
      super();
  }

  load(data: any, pageIndex, pageSize): void {
      this._loadingChange.next(false);    
      console.log("Buscar",data);           
      if (data.anio === null) {
          this._loadingChange.next(false);
          this._dataChange.next([]);
      } else {
          this.dataService
              .Ascenso()
              .getListaAdjudicar(data, pageIndex, pageSize)
              .pipe(
                  catchError(() => of([])),
                  finalize(() => {
                      this._loadingChange.next(false);
                  })
              )
              .subscribe((response: any) => {
                  console.log("grillaaaa", response);
                if (response) {
                  this._dataChange.next(response || []);
                  this.totalregistro = (response || []).length === 0 ? 0 : response[0].totalregistro;
                  if ((response || []).length === 0) {
                    //M09 - “NO SE ENCONTRÓ INFORMACIÓN DE ACUERDO CON LOS CRITERIOS DE BÚSQUEDA INGRESADOS”
                          this.dataService.Message().msgWarning('No se encontró información de acuerdo con los criterios de búsqueda ingresados.',() => { });
                          this.totalAdjudicado=0;
                          this.totalNoAdjudicado=0;
                          this.totalObservado=0;
                          this.totalConResolucion=0;
                          this.totalRegistroEstados=0;
                  }else{
                    this.totalAdjudicado=response[0].totalAdjudicado;
                    this.totalNoAdjudicado=response[0].totalNoAdjudicado;
                    this.totalObservado=response[0].totalObservado;
                    this.totalConResolucion=response[0].totalConResolucion;
                    this.totalRegistroEstados=this.totalAdjudicado+this.totalNoAdjudicado+this.totalObservado+this.totalConResolucion;

                  }
                }else if (response  === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response, () => { });
                }else if (response  === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response, () => { });
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
