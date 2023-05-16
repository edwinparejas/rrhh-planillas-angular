import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
//import { servidorPublicoAnimations } from '@servidorpublico/animations';
import { mineduAnimations } from "@minedu/animations/animations";

import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
// import { AreaCurricularService } from 'app/core/data/services/area-curricular.service';
// import { CatalogoService } from 'app/core/data/services/catalogo.service';
// import { CuadroHorasCentroTrabajoService } from 'app/core/data/services/cuadro-horas-centrotrabajo.service';
// import { CuadroHorasPlazaExcedentesService } from 'app/core/data/services/cuadro-horas-plaza-excedentes.service';
// import { CuadroHorasPlazaNecesidadService } from 'app/core/data/services/cuadro-horas-plaza-necesidad.service';
// import { CuadroHorasProcesoService } from 'app/core/data/services/cuadro-horas-proceso.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray, isNull } from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
// import { AgregarBolsaHorasComponent } from './agregar-bolsa-horas/agregar-bolsa-horas.component';
// import { AgregarNecesidadesComponent } from './agregar-necesidades/agregar-necesidades.component';
// import { AgregarVacanteComponent } from './agregar-vacante/agregar-vacante.component';
import { BuscarCentroTrabajoComponent } from '../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BusquedaDocumentoIdentidadComponent } from './components/busqueda-documento-identidad/busqueda-documento-identidad.component';
import { BusquedaPlazaComponent } from './components/busqueda-plaza/busqueda-plaza.component';
import { RegistrarRechazoComponent } from './components/registrar-rechazo/registrar-rechazo.component';
import { VerDetallesComponent } from './ver-detalles/ver-detalles.component';

@Component({
  selector: 'servidorpublico-gestionar-total',
  templateUrl: './gestionar-total.component.html',
  styleUrls: ['./gestionar-total.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class GestionarTotalComponent implements OnInit {

  codigoCentroTrabajoLogin:string;
  soloLectura:boolean;
  fechaSolicitante:string;
  dniSolicitante:string;
  paramGlobal={
    idModeloServicioEducativo:0,
    idNivelEducativo:0,
    idProceso :0,
    idEtapa:0,
    idInstitucionEducativa:0,
    idUnidadEjecutora:0,
    anio:0,
    idModalidadEducativa:0,
    idParametroInicial:0,
    isNew:true,
    disabled:true,
    idCentroTrabajo:0,
    idEtapaProceso:0,
    idDesarrolloProceso:0,
    idSubUnidadEjecutora:0,
    idFormaAtencion:0,
    idPeriodoPromocional:0,
    codigoModular:'',
    idConsolidadoPlaza:0
  }
  permiso={
    accesoAprobarCuadroHoras:false,
    accesoRechazarCuadroHoras :false,
    accesoVerificarCuadroHoras :false
 }
 permisoTotal={
   accesoParametrizacion:false,
   accesoPlazas:false,
   accesoPreferencias:false,
   accesoDistribucionNombrados:false,
   accesoDistribucionTotal:false,
   accesoConsolidadoPlazas:false,
   accesoRemitirCuadroHoras:false
 }
 totalizados:{
  totalHoraLectiva:0,
  totalHoraDistribuida:0,
  pendiente:0
}
 securityModel:SecurityModel;
  procesoHeader: any = {};
  centroTrabajoHeader : any = {}

  form: FormGroup;
  dialogRef: any;
  tiposDocumentos: Array<any> = [];
  areasCurriculares: Array<any> = [];
  
  dialogRefAddVacante: any;
  dialogRefAddBolsa: any;
  dialogRefAddNecesidades: any;
  dialogRefInfo:any;
  displayedColumns: string[] = [
    "indice",
    "tipoCargo",
    "cargo",
    "areaCurricular",
    "codigoPlaza",
    "jornadaLaboral",
    "condicion",
    "documentoIdentidad",
    "apellidosNombres",
    "especialidadPrincipal",
    "escalaMagisterial",
    "tiempoServicioIIEE",
    "tiempoServicio",
    "horaLectiva",
    "horaNoLectiva",
    "estado",
    "reclamo",
    "opciones"
  ];
  displayedColumnsExcedente: string[] = [
    "indice",
    "tipoCargo",
    "cargo",
    "areaCurricular",
    "codigoPlaza",
    "jornadaLaboral",
    "condicion",
    "documentoIdentidad",
    "apellidosNombres",
    "especialidadPrincipal",
    "escalaMagisterial",
    "tiempoServicioIIEE",
    "horaLectiva",
    "horaNoLectiva",
    //"estado",
    //"reclamo",
    "opciones"
  ];
  displayedColumnsNecesidad: string[] = [
    "indice",
    "tipoCargo",
    "cargo",
    "areaCurricular",
    "codigoPlaza",
    "jornadaLaboral",
    "condicion",
    "documentoIdentidad",
    "apellidosNombres",
    "especialidadPrincipal",
    "escalaMagisterial",
    "tiempoServicioIIEE",
    "horaLectiva",
    "horaNoLectiva",
    "opciones"
  ];
  formTotal: FormGroup;
  resultadoFinalDataSource: ResultadoFinalDataSource | null;
  excedentesDataSource: ExcedentesDataSource | null;
  necesidadesDataSource: NecesidadesDataSource | null;


  selection = new SelectionModel<any>(false, []);

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true })
  paginatorExcedentes: MatPaginator;

  @ViewChild(MatPaginator, { static: true })
  paginatorNecesidades: MatPaginator;

  tabIndex: number = 1;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private materialDialog: MatDialog,
    // private cuadroHorasProcesoService: CuadroHorasProcesoService,
    // private catalogoService: CatalogoService,
    // private areaCurricularService: AreaCurricularService,
    private dataService: DataService,
    // private cuadroHorasCentroTrabajoService: CuadroHorasCentroTrabajoService,
    // private cuadroHorasPlazaExcedentesService: CuadroHorasPlazaExcedentesService,
    // private cuadroHorasPlazaNecesidadService: CuadroHorasPlazaNecesidadService
    ) { }

  ngOnInit(): void {
     this.securityModel=  this.dataService.Storage().getInformacionUsuario();
     console.log("this.securityModel",this.securityModel);
     this.tabIndex =0;
      this.soloLectura=true;
      this.buildForm();
      this.loadCombos();
      this.defaultGridResultadoFinal();
      this.defaultGridExcedentes();
      this.defaultGridNecesidades();

      this.loadParametrosIniciales((responseParam)=>{
        if(responseParam){
        this.loadCombos();
        this.loadProcesoHeader((response)=>{
              if(response)
                this.loadCentroTrabajo((responseCT)=>{
                  console.log("***************paramGlobal FINAL",this.paramGlobal);
                  this.loadComboAreaCurricular();
                  this.loadBusqueda();
                  this.loadTotalizados();
                  });
          });
        }
      }); 
      this.loadConfiguracionPermisoTotal((responseAccess)=>{
        this.initAccess(false);
          if(responseAccess){
            if(this.permisoTotal.accesoConsolidadoPlazas){
                 this.loadConfiguracionPermiso((response)=>{
                      console.log("loadConfiguracionPermiso response----",response);
                  });
              }
            else{
              this.dataService.SnackBar().msgInformation("NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN.", 'Cerrar'); 
            }  
          }
      });
 
  }

  ngAfterViewInit() {
    this.paginator.page.pipe(tap(() => this.loadBusqueda())).subscribe();
    this.paginatorExcedentes.page.pipe(tap(() => this.loadBusqueda())).subscribe();
    this.paginatorNecesidades.page.pipe(tap(() => this.loadBusqueda())).subscribe();
 }
  // ngAfterViewInit() {
  //   this.obtenerConsolidadoPlaza();
  
   //  this.paginator.page.pipe(tap(() => this.loadBusqueda())).subscribe();
  //  this.loadConfiguracionPermisoTotal((responseAccess)=>{
  //   this.initAccess(false);
  //     if(responseAccess){
  //       if(this.permisoTotal.accesoConsolidadoPlazas){
  //            this.loadConfiguracionPermiso((response)=>{
  //                 console.log("loadConfiguracionPermiso response----",response);
  //             });
  //         }
  //       else{
  //         this.dataService.SnackBar().msgInformation("NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN.", 'Cerrar'); 
  //       }  
  //     }
  // });
 // }
   
 
  buildForm() {
    this.form = this.formBuilder.group({
      idTipoDocumento: 0,
      numeroDocumento: '',
      codigoModular: '',
      codigoPlaza: '',
      idAreaCurricular: 0,
      idParametroInicial:this.paramGlobal.idParametroInicial
    });
    this.formTotal=this.formBuilder.group({
      totalHoraLectiva:0,
      totalHoraDistribuida:0,
      pendiente:0
    });
  }

  loadCombos() {
    
    this.dataService.CuadroHoras().getTipoDocumentos().pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        console.log("response",response);
        this.tiposDocumentos = response;
        this.form.get("idTipoDocumento").setValue("0");
      }, 
      (error: HttpErrorResponse) => { console.log(error); }
    )

    // this.dataService.CuadroHoras().obtenerActivos().pipe(
    //   catchError((e) => { return  this.configCatch(e);        }),
    //   finalize(() => { })
    // ).subscribe(
    //   (response) => {
    //     this.areasCurriculares = response
    //   },
    //   (error: HttpErrorResponse) => {
    //     console.log(error);
    //   }
    // )
  }
  loadComboAreaCurricular(){
    this.dataService.CuadroHoras().getAreasCurriculares({
      anio:this.paramGlobal.anio,
      idNivelEducativo:this.paramGlobal.idNivelEducativo
    }).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        this.areasCurriculares = response
        this.form.get("idAreaCurricular").setValue("0");
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    )
  }
  loadProcesoHeader(callback) {
    let request = {
      idEtapaProceso:  parseInt(this.route.snapshot.params.idEtapaProceso)
    };
    this.dataService.CuadroHoras().getCabeceraProceso(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
              (response) => {
              this.procesoHeader = response
              this.paramGlobal.anio=Number(response.anio);
              callback(true);
              },
              (error: HttpErrorResponse) => {
              console.log(error);
              }
    )
    }
   
 loadCentroTrabajo(callback) {
     
      let request = {
      id_institucion_educativa: this.paramGlobal.idInstitucionEducativa 
      };
      this.dataService.CuadroHoras().obtenerPorId(request).pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => { })
      ).subscribe(
      (response) => {
      
      this.centroTrabajoHeader = response;
      this.paramGlobal.idNivelEducativo=response.idNivelEducativo;
      this.paramGlobal.idModeloServicioEducativo=response.idModeloServicioEducativo;
      this.paramGlobal.idModalidadEducativa=response.idModalidadEducativa;
      this.paramGlobal.idCentroTrabajo=response.idCentroTrabajo;
      this.loadComboAreaCurricular();
      //this.setParametroInicial(response);
      
      callback(true);
      },
      (error: HttpErrorResponse) => {
      console.log('loadCentroTrabajo', error);
      }
      )
      }
  defaultGridResultadoFinal() {
    this.resultadoFinalDataSource = new ResultadoFinalDataSource(this.dataService, 
     // this.cuadroHorasProcesoService, 
      this.router);
    this.paginator.showFirstLastButtons = true;
    this.paginator._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginator._intl.nextPageLabel = "Siguiente página";
    this.paginator._intl.previousPageLabel = "Página anterior";
    this.paginator._intl.firstPageLabel = "Primera página";
    this.paginator._intl.lastPageLabel = "Última página";
  }

  defaultGridExcedentes() {
    this.excedentesDataSource = new ExcedentesDataSource(this.dataService, 
     // this.cuadroHorasPlazaExcedentesService, 
      this.router);
    this.paginatorExcedentes.showFirstLastButtons = true;
    this.paginatorExcedentes._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginatorExcedentes._intl.nextPageLabel = "Siguiente página";
    this.paginatorExcedentes._intl.previousPageLabel = "Página anterior";
    this.paginatorExcedentes._intl.firstPageLabel = "Primera página";
    this.paginatorExcedentes._intl.lastPageLabel = "Última página";
  }

  defaultGridNecesidades() {
    this.necesidadesDataSource = new NecesidadesDataSource(this.dataService, 
      //this.cuadroHorasPlazaNecesidadService, 
      this.router);
    this.paginatorNecesidades.showFirstLastButtons = true;
    this.paginatorNecesidades._intl.itemsPerPageLabel = "Filas por tabla";
    this.paginatorNecesidades._intl.nextPageLabel = "Siguiente página";
    this.paginatorNecesidades._intl.previousPageLabel = "Página anterior";
    this.paginatorNecesidades._intl.firstPageLabel = "Primera página";
    this.paginatorNecesidades._intl.lastPageLabel = "Última página";
  }

  loadBusqueda() {
    let request = this.form.getRawValue();
    request.idAreaCurricular=parseInt(request.idAreaCurricular);
    request.idTipoDocumento=parseInt(request.idTipoDocumento);
    request.idParametroInicial= this.paramGlobal.idParametroInicial

    if(this.tabIndex==0)this.resultadoFinalDataSource.load(request, this.paginator.pageIndex + 1, this.paginator.pageSize); 
    if(this.tabIndex==1)this.excedentesDataSource.load(request, this.paginatorExcedentes.pageIndex + 1, this.paginatorExcedentes.pageSize); 
    if(this.tabIndex==2)this.necesidadesDataSource.load(request, this.paginatorNecesidades.pageIndex + 1, this.paginatorNecesidades.pageSize); 
    
    this.obtenerConsolidadoPlaza();
    console.log("resultadoFinalDataSource...",this.resultadoFinalDataSource.data);
  }

  btnBuscar(e) {
   
    this.loadBusqueda();
  }

  buscar() {
    this.loadBusqueda();
  }

  limpiar() {
    this.form.patchValue({
      idTipoDocumento: 0,
      numeroDocumento: '',
      codigoModular: '',
      codigoPlaza: '',
      idAreaCurricular: 0,
      idParametroInicial: this.paramGlobal.idParametroInicial
    });

    this.form.get("idTipoDocumento").setValue("0"); 
    this.form.get("idAreaCurricular").setValue("0");
    this.loadBusqueda();
  }

  // changeTab(event) {
  //   this.tabIndex = event.index + 1;
  //   console.log(event.index + 1);
  // }

  handleExportar() {
    this.dataService.Util().msgConfirm('¿Está seguro que desea exportar la información?', () => {
      let request = this.form.getRawValue();
      request.idAreaCurricular=parseInt(request.idAreaCurricular);
      request.idTipoDocumento=parseInt(request.idTipoDocumento);
      request.idParametroInicial=this.paramGlobal.idParametroInicial
      if (this.tabIndex == 0) {
        this.dataService.CuadroHoras().getPlazaCuadroHoraExportar(request).pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { })
        ).subscribe(
          (response) => {
            descargarExcel(response, 'plazascuadrohoras.xlsx');
          }
        );
      }
      if (this.tabIndex == 1) {
        this.dataService.CuadroHoras().getPlazaCuadroHoraExcedenteExportar(request).pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { })
        ).subscribe(
          (response) => {
            descargarExcel(response, 'plazascuadrohoras_excedentes.xlsx');
          }
        );
      }
      if (this.tabIndex == 2) {
        this.dataService.CuadroHoras().getPlazaCuadroHoraNecesidadExportar(request).pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { })
        ).subscribe(
          (response) => {
            descargarExcel(response, 'plazascuadrohoras_necesidades.xlsx');
          }
        );
      }
         
      }, () => {
        return;
      });
  } 
  
  obtenerConsolidadoPlaza(){
    this.dataService.CuadroHoras().obtenerConsolidadoPlaza(this.paramGlobal.idConsolidadoPlaza).pipe(
      catchError((e) => {this.soloLectura=true; return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        this.soloLectura=true;
        if(response.aprobado!==undefined)          this.soloLectura=response.aprobado; 
        if(response.aprobado!=true && response.rechazado!==undefined)         this.soloLectura=response.rechazado; 
        if(this.soloLectura==undefined)this.soloLectura=true;

        if(response.aprobado!==undefined){
          this.dniSolicitante=response.usuarioCreacion;
          this.fechaSolicitante =response.fecha_validacion;
        }
       // console.log("obtenerConsolidadoPlaza",response);

        //console.log("this.soloLectura",this.soloLectura);
        //this.soloLectura=false;
      }
    );
  } 
  handleInfo(row) {
    // console.log(row);
    // return 
    this.dialogRefInfo = this.materialDialog.open(VerDetallesComponent, {
      panelClass: 'servidorpublico-ver-detalle',
      width: '1200px',
    
      disableClose: true,
      data: {
        action: 'new',
        dataKey: {
          dataInicial: this.paramGlobal,
          servidor:row
        },
        //parent: this
      }
    })
    this.dialogRefInfo.afterClosed().subscribe((response: any) => {
     // this.loadBusqueda();
    });
  }
    
  retornar=()=>{
    this.router.navigate(['../../../../../../consolidado/'+this.paramGlobal.idConsolidadoPlaza], { relativeTo: this.route });
  }
  busquedaDocumentoIdentidadDialog = ($event) => {
    const form = this.form.value;
    const idTipoDocumentoIdentidad = form.idTipoDocumento;
    const numeroDocumentoIdentidad = form.numeroDocumento;

    this.dialogRef = this.materialDialog.open(BusquedaDocumentoIdentidadComponent,
        {
            panelClass: 'buscar-documento-identidad',
            disableClose: true,
            data: {
                idTipoDocumentoIdentidad: idTipoDocumentoIdentidad,
                numeroDocumentoIdentidad: numeroDocumentoIdentidad,
            },
        }
    );
    this.dialogRef.afterClosed().subscribe((resp) => {
      console.log(resp);
        if (!resp) {
            return;
        }
        this.form.patchValue({ idTipoDocumento: resp.idTipoDocumentoIdentidad });
        this.form.patchValue({ numeroDocumento: resp.numeroDocumentoIdentidad });
    });
};
busquedaCentroTrabajoPersonalizada = () => {
  this.dialogRef = this.materialDialog.open(
      BuscarCentroTrabajoComponent,
      {
          panelClass: "buscar-centro-trabajo-dialog",
          width: "1000px",
          disableClose: true,
          data: {
              action: "requerimiento",
          },
      }
  );

  this.dialogRef.afterClosed().subscribe((result) => {

      console.log(result);

      if (result != null) {
          this.form
              .get("codigoModular")
              .setValue(result.centroTrabajo.codigo_modular);
         // this.buscarPlaza();
      }
  });
};

busquedaPlazasDialog = ($event) => {
  this.dialogRef = this.materialDialog.open(
      BusquedaPlazaComponent,
      {
          panelClass: 'minedu-busqueda-plaza',
          disableClose: true,
          data: {
              action: 'busqueda',
          },
      }
  );

  this.dialogRef.afterClosed().subscribe((resp) => {
      if (resp != null) {
          this.form.get('codigoPlaza').setValue(resp.codigoPlaza);
      }
  });
};

loadParametrosIniciales = (callback) => {
  let response:boolean=false;
  callback(response);

  console.log("***** loadParametrosIniciales ",this.route.snapshot.params.idConsolidado);

  // var codigoCentroTrabajoLogin=this.dataService.Util().getPassportSedeSelected().CODIGO_SEDE;
  this.paramGlobal.idProceso = parseInt(this.route.snapshot.params.idProceso)
  this.paramGlobal.idEtapa  = parseInt(this.route.snapshot.params.idEtapa)
  this.paramGlobal.idEtapaProceso=  parseInt(this.route.snapshot.params.idEtapaProceso)
  this.paramGlobal.idConsolidadoPlaza=  parseInt(this.route.snapshot.params.idConsolidadoPlaza)

  

  var codigoCentroTrabajoLogin=this.route.snapshot.params.codigoCentroTrabajo;
  this.dataService.CuadroHoras().obtenerPorCodigoCentroTrabajo({
    codigoCentroTrabajo:codigoCentroTrabajoLogin
 }).pipe(
  catchError((e) => { return  this.configCatch(e);        }),
  finalize(() => { })
).subscribe(
   (responseCT) => {
   // console.log("responseCT----->",responseCT);
    this.paramGlobal.codigoModular=responseCT.codigoModular;
    this.paramGlobal.idCentroTrabajo=responseCT.idCentroTrabajo;
    this.paramGlobal.idInstitucionEducativa=responseCT.idInstitucionEducativa;

           this.dataService.CuadroHoras().obtenerParametroInicialPorCentroTrabajo({
            idCentroTrabajo:responseCT.idCentroTrabajo,
            idEtapaProceso:this.paramGlobal.idEtapaProceso 
           
        }).pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { })
        ).subscribe(
          (responseParam) => {
                      //  console.log("responseParam----->",responseParam);
                        if(!isNull(responseParam)){
                           this.paramGlobal.idParametroInicial=responseParam.idParametroInicial;
                           this.paramGlobal.idDesarrolloProceso=responseParam.idDesarrolloProceso;
                           this.paramGlobal.idEtapaProceso=responseParam.idEtapaProceso;
                        }
                        else   this.dataService.SnackBar().msgWarning("NO SE PUDO OBTENER CODIGO DE PARAMETRIZACION INICIAL", 'Cerrar'); 
            response=true;
            callback(response);
          },
          (error: HttpErrorResponse) => {
            this.dataService.Util().msgError("OCURRIÓ UN ERROR AL REALIZAR ESTA OPERACIÓN.OBTENER PARAMETROS INICIALES");
            callback(response);
          }
   )
   },
   (error: HttpErrorResponse) => {
     this.dataService.Util().msgError("OCURRIÓ UN ERROR AL REALIZAR ESTA OPERACIÓN. OBTENER CENTRO COSTO");
   }
 )
return  callback;

};

handleAprobar(){
  if(!this.permiso.accesoAprobarCuadroHoras ){
    this.dataService.SnackBar().msgInformation("NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN.", 'Cerrar'); 
    return;  // descomentar para aplicar validacion
  }
  
  const user = this.dataService.Storage().getPassportUserData();
  const rol = this.dataService.Storage().getPassportRolSelected();

    this.dataService.Util().msgConfirm('¿ESTÁ SEGURO QUE DESEA APROBAR LAS PLAZAS?', () => {
      let request={
        idConsolidadoPlaza:this.paramGlobal.idConsolidadoPlaza,
        idParametroInicial:this.paramGlobal.idParametroInicial,
        numeroDocumento:this.securityModel.numeroDocumento,
        tipoNumeroDocumento:this.securityModel.tipoNumeroDocumento,
        solicitante:this.securityModel.nombreCompleto,
        primerApellidoAprobador:user.APELLIDO_PATERNO,
        segundoApellidoAprobador:user.APELLIDO_MATERNO,
        nombresAprobador:user.NOMBRES_USUARIO,
        codigoRol:rol.CODIGO_ROL,
        codigoCentroTrabajo:rol.CODIGO_SEDE,
        usuarioModificacion:user.NUMERO_DOCUMENTO,
        motivoRechazo:''
      }
      this.dataService.CuadroHoras().aprobarConsolidadoPlaza(request).pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => { })
      ).subscribe(
        (response) => {
          if(response>0) 
          this.dataService.Util().msgAutoCloseSuccess("OPERACIÓN REALIZADA DE FORMA EXITOSA",3000);
          this.obtenerConsolidadoPlaza();
          
        },
        (error: HttpErrorResponse) => {
          this.dataService.Util().msgError("OCURRIÓ UN ERROR AL REALIZAR ESTA OPERACIÓN.");
        }
      )
     
       
    }, () => {
      return;
    });
}
handleRechazar(){

  if(!this.permiso.accesoRechazarCuadroHoras ){
    this.dataService.SnackBar().msgInformation("NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN.", 'Cerrar'); 
    return;
  }
  this.dialogRef = this.materialDialog.open(
    RegistrarRechazoComponent,
    {
        panelClass: 'minedu-registrar-rechazo',
        disableClose: true,
        width:'1000px',
        data: {
            action: 'rechazar',
            instanciaSolicitante:this.centroTrabajoHeader.descripcionDRE,
            fechaSolicitante:this.fechaSolicitante,
            dniSolicitante:this.dniSolicitante,
            idConsolidadoPlaza:this.paramGlobal.idConsolidadoPlaza,
            idParametroInicial:this.paramGlobal.idParametroInicial,
            numeroDocumento:this.securityModel.numeroDocumento,
            tipoNumeroDocumento:this.securityModel.tipoNumeroDocumento,
            solicitante:this.securityModel.nombreCompleto
        },
    }
);

this.dialogRef.afterClosed().subscribe((resp) => {
  this.obtenerConsolidadoPlaza();
    // if (resp != null) {
    //     this.form.get('codigoPlaza').setValue(resp.codigoPlaza);
    // }
});
}
handleReporteador(){
  console.log(  this.router);
  //return;
  //this.router.navigate(['reportes-anexo/1'], { relativeTo: this.route });
  this.router.navigate(['reportes/'+this.paramGlobal.anio+'/'+this.paramGlobal.codigoModular+''], { relativeTo: this.route });
}
private configCatch(e: any) { 

  if (e && (e.status === 400 || e.status === 500) && isArray(e.error.messages)) {
    this.dataService.Util().msgWarning(e.error.messages[0], () => { });
  } else {
    this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
  }

  this.dataService.Spinner().hide("sp6");
  return of(e) 

  }
  loadConfiguracionPermiso(callback) {
    let request = {
      codigoRolPassport:this.securityModel.codigoRol,
      codigoTipoSede:this.securityModel.codigoTipoSede,
      idEtapa:this.paramGlobal.idEtapa  
    };
    this.dataService.CuadroHoras().obtenerMaestroPermisoConsolidadoAnexos(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
  ).subscribe(
    (response) => {
  
      if(response!==null){
   
        this.permiso.accesoAprobarCuadroHoras=response.accesoAprobarCuadroHoras;
        this.permiso.accesoRechazarCuadroHoras= response.accesoRechazarCuadroHoras;
        this.permiso.accesoVerificarCuadroHoras= response.accesoVerificarCuadroHoras;
      }else{
        /*NO TIENE ACCESO Y NO ESTA CONFIGURADO EN TABLAS MAESTROS*/
        this.dataService.SnackBar().msgInformation("NO TIENE PERMISOS CONFIGURADOS PARA ACCEDER A ESTA OPCIÓN.", 'Cerrar'); 
        this.permiso.accesoAprobarCuadroHoras=false;
        this.permiso.accesoRechazarCuadroHoras= false;
        this.permiso.accesoVerificarCuadroHoras= false;
      }
      callback(true);
    },
    (error: HttpErrorResponse) => {
    console.log('loadCentroTrabajo', error);
    }
    )
  }
  loadConfiguracionPermisoTotal(callback) {
  let request = {
    codigoRolPassport:this.securityModel.codigoRol,
    codigoTipoSede:this.securityModel.codigoTipoSede,
    idEtapa:this.paramGlobal.idEtapa  
  };
    this.dataService.CuadroHoras().obtenerMaestroPermisoDesarrollo(request).pipe(
    catchError((e) => { return  this.configCatch(e);        }),
    finalize(() => { })
  ).subscribe(
  (response) => {
  
    if(response!==null){
      this.permisoTotal.accesoParametrizacion=response.accesoParametrizacion
      this.permisoTotal.accesoPlazas=response.accesoPlazas
      this.permisoTotal.accesoPreferencias=response.accesoPreferencias
      this.permisoTotal.accesoDistribucionNombrados=response.accesoDistribucionNombrados
      this.permisoTotal.accesoDistribucionTotal=response.accesoDistribucionTotal
      this.permisoTotal.accesoConsolidadoPlazas=response.accesoConsolidadoPlazas
      this.permisoTotal.accesoRemitirCuadroHoras=response.accesoRemitirCuadroHoras
    }else{
      /*NO TIENE ACCESO Y NO ESTA CONFIGURADO EN TABLAS MAESTROS*/
     // this.dataService.SnackBar().msgWarning(MESSAGE_CUADRO_HORA_GENERICO.M02_NO_ACCESS_CONFIG, 'Cerrar..'); 
      this.permisoTotal.accesoParametrizacion=false
      this.permisoTotal.accesoPlazas=false
      this.permisoTotal.accesoPreferencias=false
      this.permisoTotal.accesoDistribucionNombrados=false
      this.permisoTotal.accesoDistribucionTotal=false
      this.permisoTotal.accesoConsolidadoPlazas=false
      this.permisoTotal.accesoRemitirCuadroHoras=false
    }
    callback(true);
  },
  (error: HttpErrorResponse) => {
  console.log('loadCentroTrabajo', error);
  }
  )
  }
  initAccess(acceso:boolean){
    this.permiso.accesoAprobarCuadroHoras=acceso;
    this.permiso.accesoRechazarCuadroHoras= acceso;
    this.permiso.accesoVerificarCuadroHoras= acceso;
  }  
  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    /*console.log('tabChangeEvent => ', tabChangeEvent); 
    console.log('index => ', tabChangeEvent.index); */
    this.tabIndex= tabChangeEvent.index;
    this.loadBusqueda()
}
selectedIndex(){    return this.tabIndex;  }
loadTotalizados() {
  let request = {
    idParametroInicial:this.paramGlobal.idParametroInicial,
  };
  this.dataService.CuadroHoras().getTotalizadoDistribucion(request).pipe(
    catchError((e) => { return  this.configCatch(e);        }),
    finalize(() => { })
  ).subscribe(
            (response) => {
              this.totalizados= response
              this.formTotal.patchValue(
                { 
                totalHoraLectiva: this.totalizados.totalHoraLectiva,
                totalHoraDistribuida:this.totalizados.totalHoraDistribuida,
                pendiente:this.totalizados.pendiente
               });

            },
            (error: HttpErrorResponse) => {
            console.log(error);
            }
  )
  }
}

export class ResultadoFinalDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(
    private dataService: DataService,
    //private cuadroHorasProcesoService: CuadroHorasProcesoService, 
    private router: Router) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    this.dataService.CuadroHoras().getPlazaCuadroHoraTotalResultadofinalPaginado(data).subscribe(
      (response) => {
        if (response) {
          // const grid = response;
          console.log('grid => ', response);
          // if (grid && !grid.hasErrors) {
            this._totalRows = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
            this._loadingChange.next(false);
            
            this._dataChange.next(response || []);

            console.log('this._totalRows =>',this._totalRows)
        } else {
          this._totalRows = 0;
          this._dataChange.next([]);
          this.dataService.Util().msgWarning("NO HAY REGISTROS PARA MOSTRAR", () => { });
        }

        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      }
    )
  }

  connect(collectionViewer: CollectionViewer): Observable<[]> {
    return this._dataChange.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._dataChange.complete();
    this._loadingChange.complete();
  }

  get dataTotal(): any {
    return this._totalRows;
  }

  get data(): any {
    return this._dataChange.value || [];
  }
}

//--------------------EXCEDENTES--------------------------

export class ExcedentesDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(
    private dataService: DataService,
    //private cuadroHorasPlazaExcedentesService: CuadroHorasPlazaExcedentesService, 
    private router: Router) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    this.dataService.CuadroHoras().getPlazaCuadroHoraTotalExcedentesPaginado(data).subscribe(
      (response) => {
        if (response) {
          // const grid = response;
          console.log('grid => ', response);
          // if (grid && !grid.hasErrors) {
            this._totalRows = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
            this._loadingChange.next(false);
            
            this._dataChange.next(response || []);

            console.log('this._totalRows =>',this._totalRows)
        } else {
          this._totalRows = 0;
          this._dataChange.next([]);
          this.dataService.Util().msgWarning("NO HAY REGISTROS PARA MOSTRAR", () => { });
        }

        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      }
    )
  }

  connect(collectionViewer: CollectionViewer): Observable<[]> {
    return this._dataChange.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._dataChange.complete();
    this._loadingChange.complete();
  }

  get dataTotal(): any {
    return this._totalRows;
  }

  get data(): any {
    return this._dataChange.value || [];
  }
}


//--------------------NECESIDADES--------------------------

export class NecesidadesDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();

  constructor(
    private dataService: DataService,
 //   private cuadroHorasPlazaNecesidadService: CuadroHorasPlazaNecesidadService, 
    private router: Router) {
    super();
  }

  load(data: any, pageIndex: number, pageSize: number) {
    this._loadingChange.next(true);
    this.dataService.Spinner().show("sp6");
    
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;

    this.dataService.CuadroHoras().getPlazaCuadroHoraTotalNecesidadPaginado(data).subscribe(
      (response) => {
        if (response) {
          // const grid = response;
          console.log('grid => ', response);
          // if (grid && !grid.hasErrors) {
            this._totalRows = (response[0] || [{ totalRegistro: 0 }]).totalRegistro;
            this._loadingChange.next(false);
            
            this._dataChange.next(response || []);

            console.log('this._totalRows =>',this._totalRows)
        } else {
          this._totalRows = 0;
          this._dataChange.next([]);
          this.dataService.Util().msgWarning("NO HAY REGISTROS PARA MOSTRAR", () => { });
        }

        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      },
      (error: HttpErrorResponse) => {
        console.log(error);
        this._loadingChange.next(false);
        this.dataService.Spinner().hide("sp6");
      }
    )
  }

  connect(collectionViewer: CollectionViewer): Observable<[]> {
    return this._dataChange.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this._dataChange.complete();
    this._loadingChange.complete();
  }

  get dataTotal(): any {
    return this._totalRows;
  }

  get data(): any {
    return this._dataChange.value || [];
  }
}