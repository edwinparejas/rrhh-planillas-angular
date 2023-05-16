import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { ProcesoEtapaCabResponseModel } from '../../models/cuadro-horas.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../@minedu/animations/animations';
//import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
//import { TablaConfiguracionFormatoCarga,ModalidadEdicativaEnum,EstadoCalificacionEnum,ResultadoEliminarCagaEnum,PAGE_ORIGEN,ResultadoOperacionEnum } from '../../../ascenso/_utils/constants';
//import { BuscadorServidorPublicoComponent } from '../../../ascenso/components/buscador-servidor-publico/buscador-servidor-publico.component';
//import { VerDetalleCalificacionAscensoComponent} from '../../../ascenso/components/detalle-calificacion/ver-detalle-calificacion.component';
import { TablaPermisos } from '../../../../../../core/model/types';
import { SecurityModel } from '../../../../../../core/model/security/security.model';
import Swal from 'sweetalert2';
import { SharedService } from 'app/core/shared/shared.service';
import { descargarExcel } from 'app/core/utility/functions';
//import {    TablaConfiguracionSistema,    TablaConfiguracionFuncionalidad,} from "app/core/model/types";
import { AgregarMetasComponent } from '../../components/agregar-metas/agregar-metas.component';
import   { EstadoCuadroHorasEnum,ResultadoOperacionEnum} from '../_utils/constants';
import {  CUADRO_HORA_MESSAGE } from '../../models/cuadro-horas.model';
import {   SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { isArray } from 'lodash';
@Component({
  selector: 'minedu-metas',
  templateUrl: './metas.component.html',
  styleUrls: ['./metas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class MetasComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;
  loading: false;
  export = false;
  now = new Date();
   selectedAnio = 0;
   selectedInstancia = 0;
   selectedSubInstancia = 0;
//   selectedGrupoCompetencia = 0;
  comboLists = {
    listAnios: [],
    listInstancia: [],
    listSubInstancia: [],
    //listEstado: [],
    //listGrupoCompetencia: []
};
/*resumen={
    numeroHoraAsignadaUgel:0,
    numeroHoraAsignada:0,
    numeroHoraRestante:0,
    numeroHoraUtilizada:0
}*/
displayedColumns: string[] = [
  'id',
  'anio', 
  'codigoModular',        
  'descripcionInstitucion',
  'descripcionModalidad',
  'descripcionUbigeo',
  'totalDocentes',
  'totalAlumnos', 
  'totalSeccion', 
  'totalGrados', 
  'totalHoras', 
  'totalBolsaHoras', 
  'descripcionEstado',
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
tiempoMensaje:number=1500;
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
estadoCuadroHoras = EstadoCuadroHorasEnum;
//resultadoEliminarCarga=ResultadoEliminarCagaEnum;
working=true;
request = {
    anio: null,
    idInstancia: null,
    idSubInstancia: null,
    idRolPassport: null

};
resumen={
    totalAlumnos:0,
    totalSeccion:0,
    totalDocentes:0,
    totalGrados:0,
    totalHoras:0,
    totalBolsaHoras:0
}
idRolPassport: number = 1;
disabledDre:boolean;
disabledUgel:boolean;
idDre = 0;
idUgel = 0;
codigoEtapa: string;
codigoProceso:string;
instanciaSelectedText: string;
subInstanciaSelectedText: string;
abreviaturaModalidadEducativa:string;
totalCalificacionesProcesoEtapa:number;

etapa: ProcesoEtapaCabResponseModel = new ProcesoEtapaCabResponseModel();
  constructor(
    private router: Router,      
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dataService: DataService,
    private materialDialog: MatDialog,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.disabledDre=false;
    this.disabledUgel=false;
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
    setTimeout(_ => this.buildShared());

    this.handleResponsive();
    this.buildSeguridad();   

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
        this.loadAnios();

      
    }
    else this.dataService.Message().msgError('El rol asignado no tiene acceso a esta página.', () => { });
    this.loadConfigRol((response)=>{         this.loadInstancia();});

  }
  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() =>
        this.loadData(
            (this.paginator.pageIndex + 1).toString(),
              this.paginator.pageSize.toString()
          )
      );

     
  }
  buildShared() {
    this.sharedService.setSharedBreadcrumb("Bolsa horas / Parametrización");
    this.sharedService.setSharedTitle("Desarrollo de procesos de cuadro de horas");
}
ngOnDestroy(): void { }

buildSeguridad = () => {
//     this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
//    this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
//     this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
//     this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
//     this.permisos.autorizadoConsultar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Consultar);
//     this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
//     this.currentSession = this.dataService.Storage().getInformacionUsuario();
//     if(!this.permisos.autorizadoAgregar && !this.permisos.autorizadoModificar &&
//         !this.permisos.autorizadoEliminar && !this.permisos.autorizadoEnviar &&
//         !this.permisos.autorizadoConsultar && !this.permisos.autorizadoExportar)
//          { 
//              this.hasAccessPage=false;
//          }else{
//           this.hasAccessPage=true;
//          }
 
         /*temporal*/
    this.permisos.autorizadoAgregar = true;
    this.permisos.autorizadoModificar = true;
    this.permisos.autorizadoEliminar =true;
    this.permisos.autorizadoEnviar = true;
    this.permisos.autorizadoConsultar = true;
    this.permisos.autorizadoExportar= true;
    this.hasAccessPage=true;
}
  buildForm = () => {
    this.form = this.formBuilder.group({
        anio: [null],
        idInstancia: [null],
        idSubInstancia: [null]
      
    });
}

 
  handleResponsive(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
        this.isMobile = this.getIsMobile();
    };
}
  //handleRetornar = () => {    this.router.navigate(['../../../'], { relativeTo: this.route });} 
  
add = (vaction) => { 
         
    this.setRequest();
    if(this.request.anio==null){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione año',this.tiempoMensaje,() => { });
        return;
    }
    if(this.request.idInstancia===0){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione Instancia',this.tiempoMensaje,() => { });
        return;
    }
    if(this.request.idSubInstancia===0){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione Sub Instancia',this.tiempoMensaje,() => { });
        return;
    }
     
    this.dialogRef = this.materialDialog.open(AgregarMetasComponent, {
                   
                   panelClass: 'minedu-agregar-metas-dialog',
                   width: '1500px',
                   height:'640px',
                   disableClose: true,
                   data: {
                       action: vaction,
                       dataKey: {
                                    idUgel:this.request.idSubInstancia,
                                    idDre:this.request.idInstancia,
                                    idInstitucionEducativa:0,
                                    idMeta:0,
                                    anio:this.request.anio,
                                    instanciaText:this.instanciaSelectedText,
                                    subInstanciaText:this.subInstanciaSelectedText
                                },
                       parent:this
                   },
               }
           );

  
}
edit = (vaction,row) => { 
    this.dialogRef = this.materialDialog.open(AgregarMetasComponent, {
                   
                   panelClass: 'minedu-agregar-metas-dialog',
                   width: '1500px',
                   height:'640px',
                   disableClose: true,
                   data: {
                       action: vaction,
                       dataKey:  {
                                    idUgel:this.request.idSubInstancia,
                                    idInstitucionEducativa:row.idInstitucionEducativa,
                                    idMeta:row.id,
                                    anio:this.request.anio,
                                    instanciaText:this.instanciaSelectedText,
                                    subInstanciaText:this.subInstanciaSelectedText,
                                    codigoModular:row.codigoModular
                                 },
                       parent:this
                   },
               }
           );

  
}
selectInstancia(event: any): void {
    this.instanciaSelectedText=event.source.triggerValue;
    var dataSubInstancia ={idDre :this.form.get('idInstancia').value }
    this.loadSubInstancia(dataSubInstancia);
}
selectAnio(event: any): void {
} 
selectSubInstancia(event: any): void {
    this.subInstanciaSelectedText=event.source.triggerValue;
} 
handleLimpiar(): void {
    this.resetForm(); 
    this.buscar(true);   
 
}
handleBuscar(): void {  
    this.buscar(true);

}
buscar = (fistTime: boolean = false,showMessage:boolean=true) => {
 this.setRequest();
 let filter={
     anio: this.form.get('anio').value,
     idUnidadEjecutora: this.form.get('idInstancia').value,
    // idSubUnidadEjecutora: this.form.get('idSubInstancia').value,
     idUgel: this.form.get('idSubInstancia').value,
     paginaActual:0,
     tamanioPagina:0,
     idRolPassport:999
    };
    if(this.request.anio==null || this.request.anio==0){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione año',this.tiempoMensaje,() => { });
        return;
    }
    if(this.request.idInstancia==null || this.request.idInstancia==0){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione Instancia',this.tiempoMensaje,() => { });
        return;
    }
    if(this.request.idSubInstancia==null || this.request.idSubInstancia==0){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione Sub Instancia',this.tiempoMensaje,() => { });
        return;
    }
  if (fistTime) {
        filter.paginaActual=1;
        filter.tamanioPagina=10;
        this.dataSource.load(filter,showMessage);
  } else {          
        filter.paginaActual=this.paginator.pageIndex + 1;
        filter.tamanioPagina=this.paginator.pageSize;
        this.dataSource.load(filter,showMessage  );
  }
  this.getTotalHorasResumen();
}
loadData(pageIndex, pageSize): void {
  //this.setRequest();
  let filter={
    anio: this.form.get('anio').value,
    idSubUnidadEjecutora: this.form.get('idSubInstancia').value,
    paginaActual:this.paginator.pageIndex + 1,
    tamanioPagina:this.paginator.pageSize,
    idRolPassport:999
   };
  this.dataSource.load(filter);
}
resetForm = () => {  
    this.form.reset(); 
    this.form.controls['anio'].setValue(2021);
    this.form.controls['idInstancia'].setValue(0);
    this.form.controls['idSubInstancia'].setValue(0);
}
 
   handleEliminar=(row:any)=>{
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
           this.eliminar(row.id);
           
            this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada correctamente',this.tiempoMensaje,() => { });
        }else{
          //  M16: “OPERACIÓN DE ELIMINACIÓN CANCELADA”.
             this.dataService.Message().msgAutoCloseWarningNoButton('Operación de eliminación cancelada',this.tiempoMensaje,() => { });
        }

    });
} 
 
eliminar(id) {

 var data={
     id : id,
     activo : false,
};
this.dataService.CuadroHoras()
.eliminarMetas(data)
.pipe(
   catchError((e) => of(e)),
    finalize(() => { })
).subscribe((response: any) => {
  console.log(response);
    this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.',this.tiempoMensaje,() => { });
    this.buscar(false,false); 

    // if (response && response.result) {
    //     this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.',this.tiempoMensaje,() => { });
    //     this.buscarProcesosCalificacion(false,false);
    //    // this.geTotalCalificaciones();
    // }  else if (response && response.statusCode === this.resultadoOperacion.NotFound) {
    //     this.dataService.Message().msgWarning(response.messages[0], () => { });
    // } else if (response && response.statusCode === this.resultadoOperacion.UnprocessableEntity) {
    //     this.dataService.Message().msgWarning(response.messages[0], () => { });
    // }
    //  else {
    //     this.dataService.Message().msgError('Ocurrieron algunos problemas al guardar la información.', () => { this.working = false; });
    // }


    
});

}
 

setRequest = () => {
  this.request = {
      anio: this.form.get('anio').value,
      idInstancia: this.form.get('idInstancia').value,
      idSubInstancia: this.form.get('idSubInstancia').value,
      idRolPassport: this.idRolPassport

  };
 
}
 

 
  loadAnios = () => {
    this.dataService.CuadroHoras()
        .getComboAnios({})
        .pipe(
            catchError((e) => { 
                this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                    SNACKBAR_BUTTON.CLOSE); return of(e); }),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response!=null) {
                    const data = response.map((x) => ({
                        ...x,
                        value: x.anio,
                        label: `${x.anio}`,
                    }
                    ));
                    this.comboLists.listAnios = data;
                    const hoy =new Date()
                    this.form.controls['anio'].setValue(hoy.getFullYear());
            }else{
                this.dataService.Message().
                msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_ANIO,1000, () => { });
            }
          
        });
  }
  loadInstancia = () => {
    this.dataService.CuadroHoras()
        .getComboInstancia({})
        .pipe(
            catchError((e) => { 
                this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                    SNACKBAR_BUTTON.CLOSE); return of(e); }),
            finalize(() => { })
        )
        .subscribe((response: any) => {
            if (response!=null) {
              var index=0;
              response.splice(index,0,{ idDre:0,descripcion:"SELECCIONE"});
                const data = response.map((x) => ({
                    ...x,
                    value: x.idDre,
                    label: `${x.descripcion}`,
                    selected:this.idDre==x.idDre
                }));
                this.comboLists.listInstancia = data;

                            
                const dataSel = this.comboLists.listInstancia.find((x) => x.selected === true);
                if(dataSel!==undefined){
                    this.form.controls['idInstancia'].setValue(dataSel.value);
                    this.instanciaSelectedText=dataSel.label;
                }

            if (this.comboLists.listInstancia.length !== 0) {
                 //const data = this.comboLists.listInstancia.find((x) => x.selected === true);
                 var dataSubInstancia ={idDre :this.form.get('idInstancia').value }
                this.loadSubInstancia(dataSubInstancia);
            }else{
                this.buscar(true);
            }




            }else{
                this.dataService.Message().
                msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_INSTANCIA,1000, () => { });
            }
        });
  }
  loadSubInstancia = (dataSubInstancia) => {
    
      this.dataService.CuadroHoras()
          .getComboSubInstancia(dataSubInstancia)
          .pipe(
              catchError(() => of([])),
              finalize(() => { })
          )
          .subscribe((response: any) => {
            if (response!=null) {
                  var index=0;
                  response.splice(index,0,{ idUgel:0,descripcion:"SELECCIONE"});
                  const data = response.map((x) => ({
                      ...x,
                      value: x.idUgel,
                      label: `${x.descripcion}`,
                      selected:this.idUgel==x.idUgel
                  }));
                  this.comboLists.listSubInstancia = data;

                  const dataSel = this.comboLists.listSubInstancia.find((x) => x.selected === true);
                  if(dataSel!==undefined ){
                    this.form.controls['idSubInstancia'].setValue(dataSel.value);
                    this.subInstanciaSelectedText=dataSel.label;
                    this.buscar(true);
                  }

            }else{
                this.dataService.Message().
                msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_SUBINSTANCIA,1500, () => { });
            }
          });
    }
    getTotalHorasResumen = () => {
        this.setRequest();
        this.dataService.Spinner().show('sp6');
        this.dataService.CuadroHoras()
            .getTotalesResumenMetas({
                                anio:this.request.anio,
                                idUgel:this.request.idSubInstancia
                               })
            .pipe(
                catchError((e) => { 
                    this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                        SNACKBAR_BUTTON.CLOSE); return of(e); }),
                finalize(() => {  this.dataService.Spinner().hide('sp6');})
            )
            .subscribe((response: any) => {
                if (response!=null) {
                      this.resumen=response;
                }else{
                    this.dataService.Message().
                    msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_SEARCH_IIEE,1500, () => { });
                }
            });
      }  
  handleAprobar = () => {

    if(this.request.anio==null){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione año para aprobar las metas',this.tiempoMensaje,() => { });
        return;
    }
    if(this.request.idSubInstancia===0){
        this.dataService.Message().msgAutoCloseWarningNoButton('Seleccione Sub Instancia para aprobar las metas.',this.tiempoMensaje,() => { });
        return;
    }
    let message = '¿Está seguro de aprobar toda la información? Esta acción es irrreversible.';
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
     
            let data={
                idUgel: this.request.idSubInstancia,
                anio:this.request.anio
                }
    
    this.dataService.Spinner().show('sp6');
    this.dataService
        .CuadroHoras()
        .cambiarEstadoMetas(data)
        .pipe(
            catchError((e) => { 
                this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                    SNACKBAR_BUTTON.CLOSE); return of(e); }),
            finalize(() => {this.dataService.Spinner().hide('sp6'); })
        )
        .subscribe((response: any) => {
            this.dataService.Message().msgAutoCloseSuccessNoButton('Aprobación realizada con éxito.',this.tiempoMensaje,() => { });
            this.buscar(false,false); 
        });
    }else{
        //M15 - “EXPORTACION CANCELADA”
        this.dataService.Message().msgAutoCloseWarningNoButton('Aprobación cancelada.',this.tiempoMensaje,() => { });
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
        .CuadroHoras()
        .exportarMetas({
            anio: this.form.get('anio').value,
            idUgel: this.form.get('idSubInstancia').value,
            idRolPassport:999
           }
       )
        .pipe(
            catchError((e) => { 
                this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                    SNACKBAR_BUTTON.CLOSE); return of(e); }),
            finalize(() => {
                this.dataService.Spinner().hide('sp6');
                this.export = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                descargarExcel(response, "metas.xlsx");
                //saveAs(response, 'parametroInicial.xlsx');
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
private configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
  loadConfigRol = (callback ) => {
            this.dataService.CuadroHoras().obtenerPorCodigoCentroTrabajoDreUgel({
                CodigoCentroTrabajo:this.currentSession.codigoSede
            }).pipe(
                catchError((e) => { callback(false);return  this.configCatch(e);        }),
                finalize(() => {})
            )
            .subscribe((response: any) => {
                    console.log("loadDreUgelUserPassport",response);
                    if(response!==null){
                    if(response.idDre!=null)            this.disabledDre=true;
                    if(response.idUgel!=null)            this.disabledUgel=true;
                    this.idDre=response.idDre;
                    this.idUgel=response.idUgel;
                    callback(true)
                    }else{
                        callback(true);

                    }
            });
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

  //load(data: any, pageIndex, pageSize,showMessage:boolean=true): void {
    load(data: any ,showMessage:boolean=true): void {      
      this._loadingChange.next(false);                
      if (data.anio === null) {
          this._loadingChange.next(false);
          this._dataChange.next([]);
      } else {
          this.dataService
              .CuadroHoras()
              .getListaMetas(data)
              .pipe(
                catchError((e) => { return  this.configCatch(e);        }),
                finalize(() => {
                   // this.dataService.Spinner().hide('sp6');
                })
            )
              .subscribe((response: any) => {
                  console.log(response);
                  this._dataChange.next(response || []);
                  this.totalregistro =20;// (response || []).length === 0 ? 0 : 2;

                if (response && response.result) {
                  this._dataChange.next(response.data || []);
                  this.totalregistro =20;// (response.data || []).length === 0 ? 0 : response.data[0].totalRegistro;
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
                    //this.dataService.Message().msgError('Ocurrieron algunos problemas al obtener la información.', () => {  });
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
  private configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}
 