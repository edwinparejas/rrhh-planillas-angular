import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
//import { servidorPublicoAnimations } from '@servidorpublico/animations';
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from 'app/core/data/data.service';
// import { AreaCurricularService } from 'app/core/data/services/area-curricular.service';
// import { CatalogoService } from 'app/core/data/services/catalogo.service';
//import { CuadroHorasCentroTrabajoService } from 'app/core/data/services/cuadro-horas-centrotrabajo.service';
// import { CuadroHorasPlazaBolsaHorasService } from 'app/core/data/services/cuadro-horas-plaza-bolsahoras.service';
// import { CuadroHorasPlazaVacanteService } from 'app/core/data/services/cuadro-horas-plaza-vacante.service';
// import { CuadroHorasProcesoService } from 'app/core/data/services/cuadro-horas-proceso.service';
// import { CuadroHorasReporteService } from 'app/core/data/services/cuadro-horas-reportes.service';
import { descargarExcel } from 'app/core/utility/functions';
import { isArray, isNull, isObject } from 'lodash';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DocumentViewerComponent } from '../../components/document-viewer/document-viewer.component';
import { BuscarCentroTrabajoComponent } from '../../../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
 
 
@Component({
  selector: 'servidorpublico-anexo-primero',
  templateUrl: './anexo-primero.component.html',
  styleUrls: ['./anexo-primero.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class AnexoPrimeroComponent implements OnInit {
  spans = [];
  esAnexo1: boolean = false;
  esAnexo2: boolean = false;
  esAnexo3: boolean = false;
  esAnexo4: boolean = false;
  esAnexo5: boolean = false;
  file: any = null;
  centroTrabajoHeader: any = {};
  codigoCentroTrabajoFound: string = '';
  flgBuscar:boolean=false;
  anexo1VariablesDataSource: Anexo1VariablesDataSource | null;
  anexo1CargosDataSource: Anexo1CargosDataSource | null;
  anexo1CargosEventualDataSource: Anexo1CargosEventualDataSource | null;
  anexo2DataSource: Anexo2DataSource | null;
  anexo3DataSource: Anexo3DataSource | null;
  anexo4DataSource: Anexo4DataSource | null;
  anexo5CabeceraDataSource: Anexo5CabeceraDataSource | null;
  anexo5DetalleDataSource: Anexo5DetalleDataSource | null;
  totalHorasPlanEstudio: number;
  selection = new SelectionModel<any>(false, []);
  totalPlazaExcedente:0;
  displayedColumnsAnexo1Variables: string [] = [
    "variable",
    "grado1",
    "grado2",
    "grado3",
    "grado4",
    "grado5",
    "total"
  ]
  displayedColumnsAnexo1Cargos: string [] = [
    "registro",
    "cargo",
    "regimenContrato",
    "area",
    "codigoEventual",
    "jornadaLaboral",
    "horasDictado"
  ]
  displayedColumnsAnexo1Cargos_G2: string [] = [
    "registro",
    "cargo",
    "regimenContrato",
    "area",
    "codigoEventual",
    "jornadaLaboral",
    "horasDictado"
  ]
  displayedColumnsAnexo2: string [] = [
    "areaCurricular",
    "primeroHoras",
    "primeroSeccion",
    "primeroTotal",

    "segundoHoras",
    "segundoSeccion",
    "segundoTotal",

    "terceroHoras",
    "terceroSeccion",
    "terceroTotal",

    "cuartoHoras",
    "cuartoSeccion",
    "cuartoTotal",
    
    "quintoHoras",
    "quintoSeccion",
    "quintoTotal",
        
    "totalParcial",
    "numeroSeccionParcial",
    "totalHorasParcial",
  ]

  displayedColumnsAnexo3: string [] = [
    "textoUnico",
    "primero",
    "segundo",    
    "tercero",
    "cuarto",
    "quinto",
    "totalAsignado",
    "descripcionAreaCurricular",
    "jornadaLaboral"
  ]
  esIEPredeterminado:boolean=false;

  displayedColumnsAnexo4: string [] = [
    "cargo",
    "regimenLaboral",
    "area",
    "codigoPlaza",
    "jornadaLaboral"
  ]

  displayedColumnsAnexo5Cabecera: string [] = [
    "titulo",
    "totalHoras"
  ]
  displayedColumnsAnexo5Detalle: string [] = [
    "areaCurricular",
    "totalHoras"
  ]
  tipoModeloServicio: any = {
    esEbrJec: false ,
    esEbrJer: false,
    esCrfa: false,
    esEba: false,
    esRE: false
  }
  idPlanEstudio: number;
  descripcionPlanEstudio: string;
  idProceso:number;
  title:string;
  dialogRef: any;
  form: FormGroup;
  userPassport:any;
  rolPassport:any;
  sedePassport:any;
  horasLibreDisponibilidad:any[];
  totalHorasLibreDisponibilidad:number;
  constructor(
    // private cuadroHorasCentroTrabajoService: CuadroHorasCentroTrabajoService,
    // private cuadroHorasReporteService: CuadroHorasReporteService,
    // private cuadroHorasProcesoService: CuadroHorasProcesoService,
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private sanitizer: DomSanitizer,
    private materialDialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.route.paramMap.subscribe((params) => {
      this.idProceso= parseInt(params.get('idProceso'));
      let numeroAnexo = parseInt(params.get('numeroanexo'));
      if (numeroAnexo == 1) {
        this.title = 'Anexo 01: Variables para Elaboración del Cuadro de Distribución de Horas Pedagogicas.';
        this.esAnexo1 = true;
      }
      if (numeroAnexo == 2) {
        this.esAnexo2 = true;
        this.title = 'Anexo	02 : Distribución de Horas Pedagógicas por Grados - Según Plan de Estudios.';
      }
      if (numeroAnexo == 3) {
        this.esAnexo3 = true;
        this.title = 'Anexo	03 : Cuadro de Distribución de Horas Pedagógicas.';
      }
      if (numeroAnexo == 4) {
        this.esAnexo4 = true;
        this.title = 'Anexo	04 : Plazas Excedentes Ocupadas y/o Vacantes por reubicar.';
      }
      if (numeroAnexo == 5) {
        this.esAnexo5 = true;
        this.title = 'Anexo	05 : Resumen del Cuadro de Distribución de Horas Pedagógicas. ';
      }
    });
    
    if (this.esAnexo1) {
      this.anexo1VariablesDataSource = new Anexo1VariablesDataSource(this.dataService,   this.router);
      this.anexo1CargosDataSource = new Anexo1CargosDataSource(this.dataService,   this.router);
      this.anexo1CargosEventualDataSource = new Anexo1CargosEventualDataSource(this.dataService,  this.router);
    }
    if (this.esAnexo2) {
      this.anexo2DataSource = new Anexo2DataSource(this.dataService,   this.router);
    }
    if (this.esAnexo3) {
      this.anexo3DataSource = new Anexo3DataSource(this.dataService,  this.router);
    }
    if(this.esAnexo4) {
      this.anexo4DataSource = new Anexo4DataSource(this.dataService,   this.router);
    }
    if(this.esAnexo5) {
      this.anexo5CabeceraDataSource = new Anexo5CabeceraDataSource(this.dataService,   this.router);
      this.anexo5DetalleDataSource = new Anexo5DetalleDataSource(this.dataService,  this.router);
    }
    
    this.loadCentroTrabajo();
  
  }

  soloNumeros = (event) => {
    return event.charCode >= 48 && event.charCode <= 57;
  }
  buildForm() {
    //const hoy   = new Date();
    this.form = this.formBuilder.group({
      anio: new FormControl({
                            value: this.route.snapshot.params.anio,
                            disabled:true
                            }),
      numeroDocumento: 0,
      codigoModular: new FormControl({
                            value: this.route.snapshot.params.codigoModular,
                            disabled:true
                            }) ,
      idParametroInicial:0 
    });
   
  }
  loadCentroTrabajo() {
    
    let request = {
      codigoModular:this.form.get("codigoModular").value
    };
    this.dataService.CuadroHoras().obtenerPorCodigoModularAnexos(request).pipe(
      catchError((e) => { 
         this.flgBuscar=false;
         return  this.configCatch(e);       
         }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        if(response.ok===undefined)         this.flgBuscar=true;
        else    {
                this.flgBuscar=false;
                this.resetGrillas();

        }
 
        this.centroTrabajoHeader = response;
        this.codigoCentroTrabajoFound=response.codigoCentroTrabajo
        
        this.tipoModeloServicio.esEbrJec=this.centroTrabajoHeader.esEbrJec;
        this.tipoModeloServicio.esEbrJer=this.centroTrabajoHeader.esEbrJer;
        this.tipoModeloServicio.esCrfa=this.centroTrabajoHeader.esCrfa;
        this.tipoModeloServicio.esEba=this.centroTrabajoHeader.esEba;
        this.tipoModeloServicio.esRE=this.centroTrabajoHeader.esRE;
        this.loadParametroInicialPorIdCentroDesaProc(response.idCentroTrabajo);
        this.buscar();
      },
      (error: HttpErrorResponse) => {
        this.flgBuscar=false;
        console.log('loadCentroTrabajo****', error);
      }
    )
  }
resetGrillas(){
  if(this.esAnexo1){
    this.anexo1VariablesDataSource.load([]);
    this.anexo1CargosDataSource.load([]);
    this.anexo1CargosEventualDataSource.load([]);
  }
   if(this.esAnexo2){
    this.anexo2DataSource.load([]);
  }
}

  limpiar() {
    this.resetGrillas();
    const hoy   = new Date();
    this.centroTrabajoHeader.descripcionDRE = '';
    this.centroTrabajoHeader.idCentroTrabajo = 0;
    this.centroTrabajoHeader.descripcionUgel = '';
    this.centroTrabajoHeader.descripcionTipoCentroTrabajo = '';
    this.centroTrabajoHeader.descripcionModalidadEducativa = '';
    this.centroTrabajoHeader.descripcionNivelEducativo = '';
    this.centroTrabajoHeader.descripcionModeloServicioEducativo = '';
    this.codigoCentroTrabajoFound='0';
    this.form.get("codigoModular").setValue('');
    this.form.get("anio").setValue(hoy.getFullYear());
    this.tipoModeloServicio.esEbrJec=false;
    this.tipoModeloServicio.esEbrJer=false;
    this.tipoModeloServicio.esCrfa=false;
    this.tipoModeloServicio.esEba=false;
    this.tipoModeloServicio.esRE=false;
    this.flgBuscar=false;
  }
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
              this.codigoCentroTrabajoFound=result.centroTrabajo.codigo_centro_trabajo;
               this.loadCentroTrabajo();
      }
  });
};
btnBuscar(event) {
   if(event.charCode==13){
      this.loadCentroTrabajo();
  }
}
  buscar() {
    this.obtenerParametroInicial((response)=>{
      console.log("response****",response);
      if(response.ok===undefined) {
            console.log("buscar");
            let request = {
              codigoCentroTrabajo:this.codigoCentroTrabajoFound,
              idParametroInicial:response.idParametroInicial ,
              idDesarrolloProceso: response.idDesarrolloProceso ,
              idEtapaProceso:response.idEtapa,
              esEbrJec:this.tipoModeloServicio.esEbrJec,
              esEbrJer:this.tipoModeloServicio.esEbrJer,
              esCrfa:this.tipoModeloServicio.esCrfa,
              esEba:this.tipoModeloServicio.esEba,
              esRE:this.tipoModeloServicio.esRE

            }
            this.idPlanEstudio=response.idPlanEstudio;
            this.descripcionPlanEstudio=response.descripcionPlanEstudio;

            if (this.esAnexo1) this.buscarAnexo1(request);
            if (this.esAnexo2) this.buscarAnexo2(request);
            if (this.esAnexo3) this.buscarAnexo3(request);
            if (this.esAnexo4) this.buscarAnexo4(request);
            if (this.esAnexo5) this.buscarAnexo5(request);
      }
      else{
        console.log("no buscar");
        this.resetGrillas();
      }
    });
  }
  handleExportar() {
    this.obtenerParametroInicial((response)=>{
      console.log("response****",response);
      if(response.ok===undefined) {
            console.log("buscar");
            let request = {
              codigoCentroTrabajo:this.codigoCentroTrabajoFound,
              idParametroInicial:response.idParametroInicial ,
              idDesarrolloProceso: response.idDesarrolloProceso ,
              idEtapaProceso:response.idEtapa,
              esEbrJec:this.tipoModeloServicio.esEbrJec,
              esEbrJer:this.tipoModeloServicio.esEbrJer,
              esCrfa:this.tipoModeloServicio.esCrfa,
              esEba:this.tipoModeloServicio.esEba,
              esRE:this.tipoModeloServicio.esRE,
              idPlanEstudio:this.idPlanEstudio,
              descripcionPlanEstudio:this.descripcionPlanEstudio,
              origenCuadroHoraTotal:true
            }
           
            console.log("request",request);


            if (this.esAnexo1) this.exportarPdfAnexo1(request);
            if (this.esAnexo2) this.exportarPdfAnexo2(request);
            if (this.esAnexo3) this.exportarPdfAnexo3(request);
            if (this.esAnexo4) this.exportarPdfAnexo4(request);
            if (this.esAnexo5) this.exportarPdfAnexo5(request);
      }
      else{
        console.log("no buscar");
        this.resetGrillas();
      }
    });
  }

  buscarAnexo1(request) {
  
    this.dataService.CuadroHoras().consultaAnexo1(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
         
        this.anexo1VariablesDataSource.load(response.variables);
        this.anexo1CargosDataSource.load(response.cargos);
        this.anexo1CargosEventualDataSource.load(response.cargosEventual);
        this.dataService.Spinner().hide("sp6");
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
    this.dataService.CuadroHoras().obtenerHorasMinimasPlanEstudio({
      idParametroInicial:request.idParametroInicial,
    }).pipe(
          catchError((e) => { return  this.configCatch(e);        }),
          finalize(() => { })
    ).subscribe((response)=>{
          this.totalHorasPlanEstudio=response;
    }
    );
  }
  buscarAnexo2(request) {
    this.dataService.CuadroHoras().consultaAnexo2(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        if (response) {
          this.anexo2DataSource.load(response);
        }
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
    this.dataService.CuadroHoras().consultaAnexo2HLD(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        if (response) {
          console.log(response,"response HDL")
          this.horasLibreDisponibilidad=response
          this.totalHorasLibreDisponibilidad = this.horasLibreDisponibilidad.reduce((
            acc,
            obj,
          ) => acc + (obj.totalHLD),
          0);
          this.dataService.Spinner().hide("sp6");
        }
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }
  buscarAnexo3(request) {
    this.dataService.CuadroHoras().consultaAnexo3(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        if (response) {
          this.anexo3DataSource.load(response);
        }
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }
  buscarAnexo4(request) {
    this.dataService.CuadroHoras().consultaAnexo4(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        if (response) {
          this.anexo4DataSource.load(response);
          this.totalPlazaExcedente=response.length;
          this.dataService.Spinner().hide("sp6");
        }
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }

  buscarAnexo5(request) {
    this.dataService.CuadroHoras().consultaAnexo5(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        if (response) {
          this.anexo5CabeceraDataSource.load(response.listaCabecera);
          this.anexo5DetalleDataSource.load(response.listaDetalle);
          this.dataService.Spinner().hide("sp6");
        }
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }

  getDocumento(data) {
    this.dataService.Documento().descargar(data.nombreArchivo)
    .pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(response => {
        if (response) {
          const data = window.URL.createObjectURL(response);
          this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data);
          this.handlePreview(response, "anexos.pdf");
        } else {
          this.dataService.Util().msgWarning('<b>No tiene generado el reporte anexo 1.</b>', () => { });
        }
      });
  }
  private handlePreview(file: any, codigoAdjuntoAdjunto: string) {
    this.dialogRef = this.materialDialog.open(DocumentViewerComponent, {
        panelClass: 'modal-viewer-form-dialog',
        width:'1000px',
        disableClose: true,
        data: {
            modal: {
                icon: "remove_red_eye",
                title: "Reporte - Anexo 1 PDF",
                file: file,
                fileName: codigoAdjuntoAdjunto
            }
        }
    });

    this.dialogRef.afterClosed()
        .subscribe((response: any) => {
            if (!response) {
                return;
            }
        });
}

obtenerParametroInicial=(callback)=>{
 
  
  this.dataService.CuadroHoras().obtenerParametroInicialPorCentroAnioProceso({
    idCentroTrabajo:this.centroTrabajoHeader.idCentroTrabajo,
    anio: this.form.get("anio").value,
    idProceso:this.idProceso
  }).pipe(
    catchError((e) => {  return  this.configCatch(e);        }),
    finalize(() => {  })
  ).subscribe(
    (response) => {
           callback(response);
    },
    (error: HttpErrorResponse) => {
          callback(null);
      console.log('obtenerParametroInicial', error);
    }
  )          
    
  }
  
  exportarPdfAnexo1(request) {
  
  
    this.dataService.CuadroHoras().exportarPdfAnexo1(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        //console.log(response.ok);
        if(response.ok!=undefined && response.ok===false) return;
        this.getDocumento({nombreArchivo:response.codigoDocumentoGenerado});
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }
  exportarPdfAnexo2(request) {
    this.dataService.CuadroHoras().exportarPdfAnexo2(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        //console.log(response.ok);
        if(response.ok!=undefined && response.ok===false) return;
        this.getDocumento({nombreArchivo:response.codigoDocumentoGenerado});
        
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }
  exportarPdfAnexo3(request) {
    this.dataService.CuadroHoras().exportarPdfAnexo3(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        //console.log(response.ok);
        if(response.ok!=undefined && response.ok===false) return;
        this.getDocumento({nombreArchivo:response.codigoDocumentoGenerado});
        
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }
  exportarPdfAnexo4(request) {
    this.dataService.CuadroHoras().exportarPdfAnexo4(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        //console.log(response.ok);
        if(response.ok!=undefined && response.ok===false) return;
        this.getDocumento({nombreArchivo:response.codigoDocumentoGenerado});
        
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }
  exportarPdfAnexo5(request) {
    this.dataService.CuadroHoras().exportarPdfAnexo5(request).pipe(
      catchError((e) => { return  this.configCatch(e);        }),
      finalize(() => { })
    ).subscribe(
      (response) => {
        //console.log(response.ok);
        if(response.ok!=undefined && response.ok===false) return;
        this.getDocumento({nombreArchivo:response.codigoDocumentoGenerado});
        
      },
      (error: HttpErrorResponse) => {
        console.log('buscar', error);
      }
    )
  }
 private configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.error.messages)) {
      this.dataService.Util().msgWarning(e.error.messages[0], () => { });
    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
  handleRetornar(){
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
  // getTotalCabecera5(){ 
  //   return this.anexo5CabeceraDataSource.data.reduce((summ, v) => summ += parseInt(v.hora_sesion_aprendizaje),0); 
  // }
  // getTotalHoraJornada(){ 
  //   return   this.anexo3DataSource.data.reduce((summ, v) => summ += parseInt(v.horaPedagojica),0); 
  // }
  // getTotalDetalle5(){ 
  //   return this.anexo5DetalleDataSource.data.reduce((summ, v) => summ += parseInt(v.hora_dictado),0); 
  // }

  loadParametroInicialPorIdCentroDesaProc(idCentroTrabajo:number){
    var filter={
      idCentroTrabajo:idCentroTrabajo,  
      idEtapaProceso: parseInt(this.route.snapshot.params.idEtapaProceso)
    }
    console.log("loadParametroInicialPorIdCentroDesaProc",filter)
    this.dataService.CuadroHoras().obtenerParametroInicialPorCentroTrabajo(filter).pipe(
        catchError((e) => {return  this.configCatch(e);}),
        finalize(() => { })
      ).subscribe(
        (response) => {
          this.form.get("anio").setValue(response.anio)
        } 
      )
  }
  getTotalCabecera5(){ 
    return this.anexo5CabeceraDataSource.data.reduce((summ, v) => summ += parseInt(v.hora_sesion_aprendizaje),0); 
  }
  getTotalHoraJornada(){ 
    return   this.anexo3DataSource.data.reduce((summ, v) => summ += parseInt(v.horaPedagojica),0); 
  }
  getTotalHoraAsignada(){ 
    return   this.anexo3DataSource.data.reduce((summ, v) => summ += parseInt(v.totalAsignado),0); 
  }
  getTotalDetalle5(){ 
    return this.anexo5DetalleDataSource.data.reduce((summ, v) => summ += parseInt(v.hora_dictado),0); 
  }
  getTotalDetalle1_G2(){ 
    return this.anexo1CargosDataSource.data.reduce((summ, v) => summ += parseInt(v.horaSesionAprendizaje),0); 
  }
  getTotalDetalle1_G3(){ 
    return this.anexo1CargosEventualDataSource.data.reduce((summ, v) => summ += parseInt(v.horaSesionAprendizaje),0); 
  }
  getNUmeroHoraMinimas(){
    return this.totalHorasPlanEstudio
  }
  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }
  getRowSpan2(row, index) {
    console.log("idx",index);
    console.log("row",row);
    return row.vecesRepetido;// this.spans[index] && this.spans[index][col];
  }
}


export class Anexo1VariablesDataSource  extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
 //   private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data || []);
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

export class Anexo1CargosDataSource  extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
  //  private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data || []);
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
export class Anexo1CargosEventualDataSource  extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
  //  private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this.dataService.Spinner().show("sp6");
    this._dataChange.next(data || []);
    this.dataService.Spinner().hide("sp6");
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

export class Anexo2DataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
  //  private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data || []);
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
export class Anexo3DataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
   // private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data || []);
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


export class Anexo4DataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
    //private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data || []);
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
  private configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.error.messages)) {
      this.dataService.Util().msgWarning(e.error.messages[0], () => { });
    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}



export class Anexo5CabeceraDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
    //private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data || []);
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
  private configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.error.messages)) {
      this.dataService.Util().msgWarning(e.error.messages[0], () => { });
    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}

export class Anexo5DetalleDataSource extends DataSource<any> {
  private _dataChange = new BehaviorSubject<any>([]);
  private _totalRows = 0;
  private _loadingChange = new BehaviorSubject<boolean>(false);

  public loading = this._loadingChange.asObservable();
  constructor(
    private dataService: DataService,
   // private cuadroHorasReporteService: CuadroHorasReporteService, 
    private router: Router) {
    super();
  }

  load(data: any) {
    this._dataChange.next(data || []);
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
  private configCatch(e: any) {
    if (e && e.status === 400 && isArray(e.error.messages)) {
      this.dataService.Util().msgWarning(e.error.messages[0], () => { });
    } else {
      this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}