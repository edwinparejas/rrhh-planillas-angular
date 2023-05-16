import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit, ComponentFactoryResolver } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder ,Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize, takeUntil, filter, find } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { SharedService } from 'app/core/shared/shared.service';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription, of, Observable, BehaviorSubject, Subject } from 'rxjs';
//import { CalificacionDetalleModel } from '../../../ascenso/models/ascenso.model';
import { CentroTrabajoResponseModel,BolsaRequestModel,CUADRO_HORA_MESSAGE } from '../../models/cuadro-horas.model';
import Swal from 'sweetalert2';
import { ASISTENCIA_MESSAGE, CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { BuscarCentroTrabajoComponent } from '../buscar-centro-trabajo/buscar-centro-trabajo.component';
import { isArray, isNumber } from 'lodash';

 

@Component({
    selector: 'minedu-agregar-institucion',
    templateUrl: './agregar-institucion.component.html',
    styleUrls: ['./agregar-institucion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AgregarInstitucionComponent implements OnInit, OnDestroy, AfterViewInit {
    working: false;
    form: FormGroup;
    form2:FormGroup;
    row: number;
    selection = new SelectionModel<any>(true, []);
    idProceso :number;
    paginatorPageSize = 3;
    paginatorPageIndex = 1;
    seleccionado: any = null;
    idRolPassport: number = 1;
    esReadOnly:boolean=true;
    disabledBtn:boolean=false;
    titulo='Agregar Parametro Inicial a IIEE';
    isNew:boolean=true;
    resumen={
        numeroHoraAsignadaUgel:0,
        numeroHoraAsignada:0,
        numeroHoraRestante:0,
        numeroHoraUtilizada:0
    }
    paramInit={
        idUgel:0,
        idDre:0,
        idInstitucionEducativa:0,
        idBolsaHora:0,
        anio:0,
        instanciaText:"",
        subInstanciaText:""
     }
     dialogRef: any;
     @ViewChild('paginator', { static: true }) paginator: MatPaginator;

  //  calificacion: CalificacionDetalleModel = new CalificacionDetalleModel();
    centrotrabajo: CentroTrabajoResponseModel=new CentroTrabajoResponseModel();
    bolsaHoras: BolsaRequestModel= new BolsaRequestModel();
    bolsaHorasResponse: BolsaRequestModel= new BolsaRequestModel();
    formParent:any;
    constructor(
        public matDialogRef: MatDialogRef<AgregarInstitucionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private dataShared: SharedService,
        private materialDialog: MatDialog) {
            this.formParent=data.parent;

         }

    ngAfterViewInit(): void {
    
    }
    buildForm = () => {
    
        this.form = this.formBuilder.group({
            codigoModular: [null],
            
        });
        this.form2 = this.formBuilder.group({
            horaAsignada: [null],
            
        });
    }
    ngOnDestroy(): void {    }
    ngOnInit(): void { 
          this.buildForm();      
                console.log(this.data.dataKey);

                this.paramInit.idUgel=this.data.dataKey.idUgel;
                this.paramInit.idDre=this.data.dataKey.idDre;
                this.paramInit.idInstitucionEducativa=this.data.dataKey.idInstitucionEducativa;
                this.paramInit.idBolsaHora=this.data.dataKey.idBolsaHora;
                this.paramInit.anio=this.data.dataKey.anio;
                this.paramInit.instanciaText=this.data.dataKey.instanciaText;
                this.paramInit.subInstanciaText=this.data.dataKey.subInstanciaText;
                
                console.log(this.paramInit);
                if(this.data.action=='edit'){
                        this.titulo='Modificar Parametro Inicial a IIEE';
                        this.detalleInfo(this.data.dataKey.idInstitucionEducativa); 
                        this.obtenerBolsaHora(this.data.dataKey.idBolsaHora); 
                        this.esReadOnly=false;
                        this.isNew=false;
                }else{
                    this.esReadOnly=true;
                    
                }
                this.getTotalHorasResumen();
           }
    handleCancel = () => {        this.matDialogRef.close();    }
    handleSave = () => {  
        let message = '¿Está seguro que deseas grabar la información? ';
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
              
        let codigoModular=  this.form.get("codigoModular").value;
        let horaAsignada=  this.form2.get("horaAsignada").value;
        this.bolsaHoras.anio=this.data.dataKey.anio; 
        this.bolsaHoras.idInstitucionEducativa=this.centrotrabajo.ID_INSTITUCION_EDUCATIVA; 
        this.bolsaHoras.idSubUnidadEjecutora=this.data.dataKey.idUgel;
        this.bolsaHoras.numeroHorasAsignadas=eval(horaAsignada);
        this.bolsaHoras.numeroHorasUtilizadas=0;
        this.bolsaHoras.idEstado=1;
        this.bolsaHoras.activo=true;
        this.bolsaHoras.codigoModular=codigoModular
        this.bolsaHoras.idUgel=this.data.dataKey.idUgel
        

        // console.log("this.bolsaHoras",this.bolsaHoras)
        // console.log("this.bolsaHoras.numeroHorasAsignadas",this.bolsaHoras.numeroHorasAsignadas)
        // console.log("this.resumen.numeroHoraRestante",this.resumen.numeroHoraRestante)
        // console.log("this.bolsaHorasResponse.numeroHorasAsignadas",this.bolsaHorasResponse.numeroHorasAsignadas)
        // console.log("this.resumen",this.resumen)
        //     return

        if(this.centrotrabajo.ID_MODALIDAD_EDUCATIVA==undefined || 
            this.bolsaHoras.numeroHorasAsignadas==0 || 
            this.bolsaHoras.numeroHorasAsignadas==null){
            this.dataService.Message().
            msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.CODIGO_MODULAR_HORAS_REQUIRED,2000, () => { });
        }else{
                if(this.resumen.numeroHoraAsignadaUgel===0){
                    this.dataService.Message().
                    msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.LIMIT_ZERO_BOLSA,2000, () => { });
                    return;
                }
                if(this.bolsaHoras.numeroHorasAsignadas===0){
                    this.dataService.Message().
                    msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.LIMIT_MAYOR_ZERO,2000, () => { });
                    return;
                }
                if(this.bolsaHoras.numeroHorasAsignadas>(this.resumen.numeroHoraRestante+this.bolsaHorasResponse.numeroHorasAsignadas)){
                    console.log("entroooo");
                    this.dataService.Message().
                    msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.LIMIT_EXCEEDED_BOLSA,2000, () => { });
                    return;
                }
                    if(this.isNew){
                            this.dataService.CuadroHoras()
                            .grabarBolsaHoras(this.bolsaHoras)
                            .pipe(
                                catchError((e) => {return  this.configCatch(e);        }),
                                finalize(() => { })
                            ).subscribe((response: any) => {
                                console.log("*******",response);
                                if(isNumber(response)){
                                        this.formParent.buscarProcesosCalificacion(false,false); 
                                        this.matDialogRef.close();  
                                        this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.',1000,() => { });
                                }
                            });
                    }else{
                        this.bolsaHoras.idBolsaHoras=this.data.dataKey.idBolsaHora;
                        this.dataService.CuadroHoras()
                        .actualizarBolsaHoras(this.bolsaHoras)
                        .pipe(
                            catchError((e) => { 
                                this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                                    SNACKBAR_BUTTON.CLOSE); return of(e); }),
                            finalize(() => { })
                        ).subscribe((response: any) => {
                        this.formParent.buscarProcesosCalificacion(false,false); 
                        this.matDialogRef.close();  
                        this.dataService.Message().msgAutoCloseSuccessNoButton('Actualización realizada de forma exitosa.',1000,() => { });
                        });
                    }
        }
    }else{
      //  M16: “OPERACIÓN DE ELIMINACIÓN CANCELADA”.
         this.dataService.Message().msgAutoCloseWarningNoButton('Operación de eliminación cancelada',1000,() => { });
    }

});
         
        }
        
detalleInfo = (id)=>{
   
    this.dataService.CuadroHoras().buscarDatoCentroTrabajoXIIEE({ID_INSTITUCION_EDUCATIVA:id})
    .pipe(
        catchError((e) => { 
            this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                SNACKBAR_BUTTON.CLOSE); return of(e); }),
        finalize(() => {  })
    )
    .subscribe((response: any) => {
        if (response!=null) {
            this.setCentroTrabajo(response);    
            this.form.get("codigoModular").setValue(response.CODIGO_MODULAR);
        }else{
            this.dataService.Message().
            msgInfo(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_SEARCH_IIEE, () => { });
        } 
 
    });

  }
  obtenerBolsaHora = (id)=>{
     
    this.dataService.CuadroHoras().obtenerBolsaHoras({id:id})
    .pipe(
        catchError((e) => { 
            this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                SNACKBAR_BUTTON.CLOSE); return of(e); }),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response!=null) {
            this.setBolsaHoraEdit(response);  
            this.form2.get("horaAsignada").setValue(this.bolsaHorasResponse.numeroHorasAsignadas  );
            this.form.get("codigoModular").setValue(this.bolsaHorasResponse.codigoModular);
        }else{
            this.dataService.Message().
            msgInfo(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_SEARCH_IIEE, () => { });
        } 
 
    });

  }
soloNumeros = (event) => {
        return event.charCode >= 48 && event.charCode <= 57;
}
  keyPressBuscarCodigoModular=(event)=>{
    if (event.charCode ==13 ) {
        this.buscarCodigoModular();
        return false;
    }
    return true;
  }
 
  setCentroTrabajo(response){
      

    this.centrotrabajo.CODIGO_MODULAR=response.codigoModular;
    this.centrotrabajo.INSTITUCION_EDUCATIVA=response.descripcionInstitucionEducativa;
    this.centrotrabajo.ID_DRE=response.idDre;
    this.centrotrabajo.DESCRIPCION_DRE=response.descripcionDRE;
    this.centrotrabajo.ID_UGEL=response.idUgel;
    this.centrotrabajo.DESCRIPCION_UGEL=response.descripcionUgel;
    this.centrotrabajo.ID_INSTITUCION_EDUCATIVA=response.idInstitucionEducativa;
    this.centrotrabajo.DESCRIPCION_TIPO_CENTRO_TRABAJO=response.descripcionTipoCentroTrabajo;
    this.centrotrabajo.DESCRIPCION_MODALIDAD_EDUCATIVA=response.descripcionModalidadEducativa;
    this.centrotrabajo.ID_MODALIDAD_EDUCATIVA=response.idModalidadEducativa;
    this.centrotrabajo.ID_NIVEL_EDUCATIVO=response.idNivelEducativo;
    this.centrotrabajo.DESCRIPCION_NIVEL_EDUCATIVO=response.descripcionNivelEducativo;
    this.centrotrabajo.ANOFISCAL=response.anio;
    this.centrotrabajo.MODELO_SERVICIO=response.descripcionModeloServicioEducativo;
    this.centrotrabajo.ID_CENTRO_TRABAJO=response.idCentroTrabajo;
    //console.log("entroooo", this.centrotrabajo);
  }

  setBolsaHoraEdit(response){
    this.bolsaHorasResponse.idBolsaHoras=response.idBolsaHoras;
    this.bolsaHorasResponse.idRegion=response.idRegion;
    this.bolsaHorasResponse.idInstitucionEducativa=response.idInstitucionEducativa;
    this.bolsaHorasResponse.idUnidadEjecutora=response.idUnidadEjecutora;
    this.bolsaHorasResponse.anio=response.anio;
    this.bolsaHorasResponse.numeroHorasAsignadas=response.numeroHorasAsignadas;
    this.bolsaHorasResponse.numeroHorasUtilizadas=response.numeroHorasUtilizadas;
    this.bolsaHorasResponse.idEstado=response.idEstado;
    this.bolsaHorasResponse.codigoModular=response.codigoModular;
    //this.bolsaHorasResponse.idUgel=response.idUgel;
  }
  getTotalHorasResumen = () => {
    
     
    this.dataService.CuadroHoras()
        .getTotalesResumen({
                            anio:this.data.dataKey.anio,
                            idSubUnidadEjecutora:this.data.dataKey.idUgel
                           })
        .pipe(
            catchError((e) => { 
                this.dataService.SnackBar().msgError(CUADRO_HORA_MESSAGE.EXCEPTION_ERROR,
                                                    SNACKBAR_BUTTON.CLOSE); return of(e); }),
            finalize(() => {  })
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
  buscarCodigoModular = () => {
    let codigoModular=  this.form.get("codigoModular").value;
            let data={
                codigoModular:codigoModular,
                idUgel:this.data.dataKey.idUgel 
            };
            console.log(data.codigoModular);
            if(data.codigoModular==null || data.codigoModular=="" || data.codigoModular==" "){
                this.dataService.Message().msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.CODIGO_MODULAR_REQUIRED,2000,() => { });
            }else{
                this.dataService.CuadroHoras()
                .buscarDatoCentroTrabajo(data)
                .pipe(
                    catchError((e) => {this.disabledBtn=true; return  this.configCatch(e);        }),
                    finalize(() => { })
                ).subscribe((response: any) => {
                    if (response.idInstitucionEducativa!=undefined) {
                        this.setCentroTrabajo(response);   
                        this.verificarExisteRegitro(); 
                    }else{
                      //  this.dataService.Message().msgInfo(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_SEARCH_IIEE, () => { });
                    } 
                });
        } 
     
  }
  verificarExisteRegitro(){
    this.dataService.CuadroHoras()
    .existeBolsaHorasIE({
        anio:this.data.dataKey.anio, 
        idInstitucionEducativa:this.centrotrabajo.ID_INSTITUCION_EDUCATIVA, 
        idSubUnidadEjecutora:this.data.dataKey.idUgel,
        idUgel:this.data.dataKey.idUgel
    })
    .pipe(
        catchError((e) => {this.obtenerBolsaExistente(); this.disabledBtn=true;return  this.configCatch(e);        }),
    finalize(() => { /* this.dataService.Spinner().hide('sp6');*/ })
    ).subscribe((response: any) => {
        console.log("verioficar existe bolsa",response)
        if(isNumber(response)){
            /*
            SI ES 0 ENTONCES NO EXISTE
            SI ENTRA AL CATCHERROR EXISTE YA EL REGRISTRO
            */
            this.disabledBtn=false;
        }
     
    });
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
                idUgelSel:this.paramInit.idUgel,
                idDreSel:this.paramInit.idDre,

                

            },
        }
    );
  
    this.dialogRef.afterClosed().subscribe((result) => {
  
        console.log(result);
  
        if (result != null) {
            this.form
                .get("codigoModular")
                .setValue(result.centroTrabajo.codigo_modular);
                this.buscarCodigoModular();
        }
    });
  };

  private configCatch(e: any) { 
    console.log("e",e);
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    }else   if (e && e.status === 400 && isArray(e.error.messages)) {
        this.dataService.Util().msgWarning(e.error.messages[0], () => { });
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

 obtenerBolsaExistente(){
     this.dataService.CuadroHoras()
        .getBolsaPorIE({
            anio:this.data.dataKey.anio, 
            idInstitucionEducativa:this.centrotrabajo.ID_INSTITUCION_EDUCATIVA, 
            idSubUnidadEjecutora:this.data.dataKey.idUgel,
            idUgel:this.data.dataKey.idUgel
        })
        .pipe(
            catchError((e) => { this.disabledBtn=true;return  this.configCatch(e);        }),
        finalize(() => { /* this.dataService.Spinner().hide('sp6');*/ })
        ).subscribe((response: any) => {
           console.log("getBolsaPorIE",response)
           this.form2.get("horaAsignada").setValue(response.numeroHorasAsignadas);
        });
  }
} 