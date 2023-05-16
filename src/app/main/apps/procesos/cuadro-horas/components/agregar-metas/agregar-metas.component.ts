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
import { CentroTrabajoResponseModel,MetasRequestModel,CUADRO_HORA_MESSAGE } from '../../models/cuadro-horas.model';
import Swal from 'sweetalert2';
import { ASISTENCIA_MESSAGE, CONFIGURACION_PROCESO_MESSAGE, PASSPORT_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { isArray, isNumber } from 'lodash';
import { BuscarCentroTrabajoComponent } from '../buscar-centro-trabajo/buscar-centro-trabajo.component';
 

@Component({
    selector: 'minedu-agregar-metas',
    templateUrl: './agregar-metas.component.html',
    styleUrls: ['./agregar-metas.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AgregarMetasComponent implements OnInit, OnDestroy, AfterViewInit {
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
    titulo='Agregar Meta para IIEE';
    isNew:boolean=true;
    resumen={
        totalBolsaUgel:0,
        totalBolsaAsignadaUgel:0,
        totalHorasPlanEstudio:0
    }
    calculoHoraClase={
        grado1:0,
        grado2:0,
        grado3:0,
        grado4:0,
        grado5:0
    }
    calculoCargaDocente={
        grado1:0,
        grado2:0,
        grado3:0,
        grado4:0,
        grado5:0
    }
    paramInit={
        idUgel:0,
        idDre:0,
        idInstitucionEducativa:0,
        idMeta:0,
        anio:0,
        instanciaText:"",
        subInstanciaText:""
     }
     total={
         alumnos:0,
         secciones:0,
         horasClase:0
     }
     //horasPlanEstudio:number;
     @ViewChild('paginator', { static: true }) paginator: MatPaginator;

    //calificacion: CalificacionDetalleModel = new CalificacionDetalleModel();
    centrotrabajo: CentroTrabajoResponseModel=new CentroTrabajoResponseModel();
    metas: MetasRequestModel= new MetasRequestModel();
    metasResponse: MetasRequestModel= new MetasRequestModel();
    formParent:any;
    dialogRef: any;
    constructor(
        public matDialogRef: MatDialogRef<AgregarMetasComponent>,
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

            totalAlumnoGrado1: [null],
            totalAlumnoGrado2: [null],
            totalAlumnoGrado3: [null],
            totalAlumnoGrado4: [null],
            totalAlumnoGrado5: [null],
        
            totalSeccionGrado1: [null],
            totalSeccionGrado2: [null],
            totalSeccionGrado3: [null],
            totalSeccionGrado4: [null],
            totalSeccionGrado5: [null],

            totalBolsaHoras: [null],
            totalDocentes: [null]

            
        });
    }
    ngOnDestroy(): void {    }
    ngOnInit(): void { 
          this.buildForm();      
                console.log("dataKey****",this.data.dataKey);

                this.paramInit.idUgel=this.data.dataKey.idUgel;
                this.paramInit.idDre=this.data.dataKey.idDre;
                this.paramInit.idInstitucionEducativa=this.data.dataKey.idInstitucionEducativa;
                this.paramInit.idMeta=this.data.dataKey.idMeta;
                this.paramInit.anio=this.data.dataKey.anio;
                this.paramInit.instanciaText=this.data.dataKey.instanciaText;
                this.paramInit.subInstanciaText=this.data.dataKey.subInstanciaText;
                

                if(this.data.action=='edit'){
                        this.titulo='Modificar Meta IIEE';
                        this.detalleInfo(this.data.dataKey.idInstitucionEducativa); 
                        this.obtenerMeta(this.data.dataKey.idMeta); 
                        this.esReadOnly=false;
                        this.isNew=false;
                        this.form.get("codigoModular").setValue(this.data.dataKey.codigoModular);
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
              
        //let codigoModular=  this.form.get("codigoModular").value;
        //let horaAsignada=  this.form2.get("horaAsignada").value;
        this.metas.anio=this.data.dataKey.anio; 
        this.metas.idInstitucionEducativa=this.centrotrabajo.ID_INSTITUCION_EDUCATIVA; 
        this.metas.idSubUnidadEjecutora=this.data.dataKey.idUgel;

        this.metas.totalAlumnos=this.total.alumnos;
        this.metas.totalSeccion=this.total.secciones;
        this.metas.totalHoras=this.total.horasClase;
        this.metas.totalGrados=5;

        
        this.metas.totalBolsaHoras=Number(this.form2.get("totalBolsaHoras").value);
        this.metas.totalDocentes=Number(this.form2.get("totalDocentes").value);

        this.metas.totalAlumnoGrado1=Number(this.form2.get("totalAlumnoGrado1").value);
        this.metas.totalAlumnoGrado2=Number(this.form2.get("totalAlumnoGrado2").value);
        this.metas.totalAlumnoGrado3=Number(this.form2.get("totalAlumnoGrado3").value);
        this.metas.totalAlumnoGrado4=Number(this.form2.get("totalAlumnoGrado4").value);
        this.metas.totalAlumnoGrado5=Number(this.form2.get("totalAlumnoGrado5").value);

        this.metas.totalSeccionGrado1=Number(this.form2.get("totalSeccionGrado1").value);
        this.metas.totalSeccionGrado2=Number(this.form2.get("totalSeccionGrado2").value);
        this.metas.totalSeccionGrado3=Number(this.form2.get("totalSeccionGrado3").value);
        this.metas.totalSeccionGrado4=Number(this.form2.get("totalSeccionGrado4").value);
        this.metas.totalSeccionGrado5=Number(this.form2.get("totalSeccionGrado5").value);

        //totalAlumnoGrado1,totalSeccionGrado1
        this.metas.idUgel=this.data.dataKey.idUgel
        this.metas.idEstado=1;
        this.metas.activo=true;
        if(this.centrotrabajo.ID_MODALIDAD_EDUCATIVA==undefined ){
            this.dataService.Message().
            msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.CODIGO_MODULAR_HORAS_REQUIRED,2000, () => { });
        }else{
                // if(this.metas.totalAlumnos>this.resumen.numeroHoraRestante){
                //     this.dataService.Message().
                //     msgAutoCloseWarningNoButton(CUADRO_HORA_MESSAGE.LIMIT_EXCEEDED_BOLSA,2000, () => { });
                //     return;
                // }
                    if(this.isNew){
                            this.dataService.CuadroHoras()
                            .grabarMetas(this.metas)
                            .pipe(
                                catchError((e) => { return  this.configCatch(e);        }),
                                finalize(() => {
                                   // this.dataService.Spinner().hide('sp6');
                                })
                            ).subscribe((response: any) => {
                                if(isNumber(response)){
                                    console.log("response*****insert",response);
                                    this.formParent.buscar(false,false); 
                                    this.matDialogRef.close();  
                                    this.dataService.Message().msgAutoCloseSuccessNoButton('Operación realizada de forma exitosa.',1000,() => { });
                                }
                            });
                    }else{
                        this.metas.idMetas=this.data.dataKey.idMeta;
                        this.dataService.CuadroHoras()
                        .actualizarMetas(this.metas)
                        .pipe(
                            catchError((e) => { return  this.configCatch(e);        }),
                            finalize(() => {
                               // this.dataService.Spinner().hide('sp6');
                            })
                        ).subscribe((response: any) => {

                            console.log("response*****udate",response);

                        //this.formParent.buscar(false,false); 
                        //this.matDialogRef.close();  
                        //this.dataService.Message().msgAutoCloseSuccessNoButton('Actualización realizada de forma exitosa.',1000,() => { });
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
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response!=null) {
            console.log("detalleInfo***",response)
            this.setCentroTrabajo(response);    
            this.form.get("codigoModular").setValue(response.codigoModular);
        }else{
            this.dataService.Message().
            msgInfo(CUADRO_HORA_MESSAGE.NO_FOUND_DATA_SEARCH_IIEE, () => { });
        } 
 
    });

  }
  obtenerMeta = (id)=>{
     
    this.dataService.CuadroHoras().obtenerMetas({id:id})
    .pipe(
        catchError((e) => { return  this.configCatch(e);        }),
        finalize(() => { })
    )
    .subscribe((response: any) => {
        if (response!=null) {
            this.setMetaEdit(response);  
            this.form2.get("totalAlumnoGrado1").setValue(this.metasResponse.totalAlumnoGrado1);
            this.form2.get("totalAlumnoGrado2").setValue(this.metasResponse.totalAlumnoGrado2);
            this.form2.get("totalAlumnoGrado3").setValue(this.metasResponse.totalAlumnoGrado3);
            this.form2.get("totalAlumnoGrado4").setValue(this.metasResponse.totalAlumnoGrado4);
            this.form2.get("totalAlumnoGrado5").setValue(this.metasResponse.totalAlumnoGrado5);

            this.form2.get("totalSeccionGrado1").setValue(this.metasResponse.totalSeccionGrado1);
            this.form2.get("totalSeccionGrado2").setValue(this.metasResponse.totalSeccionGrado2);
            this.form2.get("totalSeccionGrado3").setValue(this.metasResponse.totalSeccionGrado3);
            this.form2.get("totalSeccionGrado4").setValue(this.metasResponse.totalSeccionGrado4);
            this.form2.get("totalSeccionGrado5").setValue(this.metasResponse.totalSeccionGrado5);

            this.form2.get("totalBolsaHoras").setValue(this.metasResponse.totalBolsaHoras);
            this.form2.get("totalDocentes").setValue(this.metasResponse.totalDocentes);
            
             for(let i=1;i<=5;i++){
                this.calcNumHora(i);
                this.calcCargaDocente(i);
             }
             this.calcularResumenDistribucion();
            
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
  calcNumHora=(grado)=>{
       //if( event.which >= 48 && event.which <= 57){
          let valor=0;
        if(grado==1){
            valor=Number(this.form2.get("totalSeccionGrado1").value);
            this.calculoHoraClase.grado1=this.resumen.totalHorasPlanEstudio*(isNaN(valor)?0:valor);
        }
        if(grado==2){
            valor=Number(this.form2.get("totalSeccionGrado2").value);
            this.calculoHoraClase.grado2=this.resumen.totalHorasPlanEstudio*(isNaN(valor)?0:valor);
        }
        if(grado==3){
            valor=Number(this.form2.get("totalSeccionGrado3").value);
            this.calculoHoraClase.grado3=this.resumen.totalHorasPlanEstudio*(isNaN(valor)?0:valor);
        }
        if(grado==4){
            valor=Number(this.form2.get("totalSeccionGrado4").value);
            this.calculoHoraClase.grado4=this.resumen.totalHorasPlanEstudio*(isNaN(valor)?0:valor);
        }
        if(grado==5){
            valor=Number(this.form2.get("totalSeccionGrado5").value);
            this.calculoHoraClase.grado5=this.resumen.totalHorasPlanEstudio*(isNaN(valor)?0:valor);
        }
        this.calcCargaDocente(grado);
        //this.calcularResumenDistribucion();
  }
  calcCargaDocente=(grado)=>{
          let num=0;
          let dem=0;
          let result=0;
        if(grado==1){
            num=Number(this.form2.get("totalAlumnoGrado1").value);
            dem=Number(this.form2.get("totalSeccionGrado1").value);
            result=(isNaN(num)?0:num)/(isNaN(dem)?1:dem);
            this.calculoCargaDocente.grado1=(result===Infinity || isNaN(result))?0:(Math.round(result * 100) / 100);
        }
        if(grado==2){
            num=Number(this.form2.get("totalAlumnoGrado2").value);
            dem=Number(this.form2.get("totalSeccionGrado2").value);
            result=(isNaN(num)?0:num)/(isNaN(dem)?1:dem);
            this.calculoCargaDocente.grado2=(result===Infinity || isNaN(result))?0:(Math.round(result * 100) / 100);
        }
        if(grado==3){
            num=Number(this.form2.get("totalAlumnoGrado3").value);
            dem=Number(this.form2.get("totalSeccionGrado3").value);
            result=(isNaN(num)?0:num)/(isNaN(dem)?1:dem);
            this.calculoCargaDocente.grado3=(result===Infinity || isNaN(result))?0:(Math.round(result * 100) / 100);
        }
        if(grado==4){
            num=Number(this.form2.get("totalAlumnoGrado4").value);
            dem=Number(this.form2.get("totalSeccionGrado4").value);
            result=(isNaN(num)?0:num)/(isNaN(dem)?1:dem);
            this.calculoCargaDocente.grado4=(result===Infinity || isNaN(result))?0:(Math.round(result * 100) / 100);
        }
        if(grado==5){
            num=Number(this.form2.get("totalAlumnoGrado5").value);
            dem=Number(this.form2.get("totalSeccionGrado5").value);
            result=(isNaN(num)?0:num)/(isNaN(dem)?1:dem);
            this.calculoCargaDocente.grado5=(result===Infinity || isNaN(result))?0:(Math.round(result * 100) / 100);
        }

 
        this.calcularResumenDistribucion();
  }
  buscarCodigoModular=()=>{
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
                finalize(() => {  })
            ).subscribe((response: any) => {
                if (response.idInstitucionEducativa!=undefined) {
                    console.log("buscarCodigoModular***",response)
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
    .existeMetasIE({
        anio:this.data.dataKey.anio, 
        idInstitucionEducativa:this.centrotrabajo.ID_INSTITUCION_EDUCATIVA, 
        idSubUnidadEjecutora:this.data.dataKey.idUgel,
        idUgel:this.data.dataKey.idUgel
    })
    .pipe(
        catchError((e) => {this.disabledBtn=true; return  this.configCatch(e);        }),
    finalize(() => { /* this.dataService.Spinner().hide('sp6');*/ })
    ).subscribe((response: any) => {
        if(isNumber(response)){
            /*
            SI ES 0 ENTONCES NO EXISTE
            SI ENTRA AL CATCHERROR EXISTE YA EL REGRISTRO
            */
            this.disabledBtn=false;
        }
    });
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

    this.centrotrabajo.ID_MODELO_SERVICIO_EDUCATIVO=response.idModeloServicioEducativo;
    this.centrotrabajo.ID_FORMA_ATENCION=response.idFormaAtencion;

    this.getHoraMinimaPlanEstudio();
    
  }

  setMetaEdit(response){
    this.metasResponse.idMetas=response.idMeta;
    this.metasResponse.idRegion=response.idRegion;
    this.metasResponse.idInstitucionEducativa=response.idInstitucionEducativa;
    this.metasResponse.idUnidadEjecutora=response.idUnidadEjecutora;
    this.metasResponse.anio=response.anio;
    this.metasResponse.totalDocentes=response.totalDocentes;
    this.metasResponse.totalAlumnos=response.totalAlumnos;
    this.metasResponse.totalSeccion=response.totalSeccion;
    this.metasResponse.totalGrados=response.totalGrados; 
    this.metasResponse.totalHoras=response.totalHoras;
    this.metasResponse.totalBolsaHoras=response.totalBolsaHoras;       
    this.metasResponse.idEstado=response.idEstado;
    this.metasResponse.totalAlumnoGrado1=response.totalAlumnoGrado1;
    this.metasResponse.totalAlumnoGrado2=response.totalAlumnoGrado2;
    this.metasResponse.totalAlumnoGrado3=response.totalAlumnoGrado3;
    this.metasResponse.totalAlumnoGrado4=response.totalAlumnoGrado4;
    this.metasResponse.totalAlumnoGrado5=response.totalAlumnoGrado5;

    this.metasResponse.totalSeccionGrado1=response.totalSeccionGrado1;
    this.metasResponse.totalSeccionGrado2=response.totalSeccionGrado2;
    this.metasResponse.totalSeccionGrado3=response.totalSeccionGrado3;
    this.metasResponse.totalSeccionGrado4=response.totalSeccionGrado4;
    this.metasResponse.totalSeccionGrado5=response.totalSeccionGrado5;
    //this.metasResponse.idUgel=response.idUgel;
    console.log("response*****",response); 
  }
  getTotalHorasResumen = () => {
 

    this.dataService.CuadroHoras()
        .getTotalesResumenHorasMetas({
                            anio:this.data.dataKey.anio,
                            idUgel:this.data.dataKey.idUgel
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
  getHoraMinimaPlanEstudio=()=>{
    this.dataService.CuadroHoras().getHoraMininmaPlanEstudio({
        idNivelEducativo:this.centrotrabajo.ID_NIVEL_EDUCATIVO,
        idModeloServicioEducativo:this.centrotrabajo.ID_MODELO_SERVICIO_EDUCATIVO,
        idFormaAtencion:this.centrotrabajo.ID_FORMA_ATENCION,
        idPeriodoPromocional:0,
        anioEmision:this.data.dataKey.anio
     }) .subscribe((response: any) => {
              this.resumen.totalHorasPlanEstudio=response
              console.log("getHoraMininmaPlanEstudio****",response);
              for(let i=1;i<=5;i++){
                this.calcNumHora(i);
                this.calcCargaDocente(i);
             }
     });
  }
calcularResumenDistribucion=()=>{
    let a=Number(this.form2.get("totalAlumnoGrado1").value);
    let b=Number(this.form2.get("totalAlumnoGrado2").value);
    let c=Number(this.form2.get("totalAlumnoGrado3").value);
    let d=Number(this.form2.get("totalAlumnoGrado4").value);
    let e=Number(this.form2.get("totalAlumnoGrado5").value);

    this.total.alumnos=(isNaN(a)?0:a)+(isNaN(b)?0:b)+(isNaN(c)?0:c)+(isNaN(d)?0:d)+(isNaN(e)?0:e);
    a=b=c=d=e=0;
    a=Number(this.form2.get("totalSeccionGrado1").value);
    b=Number(this.form2.get("totalSeccionGrado2").value);
    c=Number(this.form2.get("totalSeccionGrado3").value);
    d=Number(this.form2.get("totalSeccionGrado4").value);
    e=Number(this.form2.get("totalSeccionGrado5").value);

    this.total.secciones=(isNaN(a)?0:a)+(isNaN(b)?0:b)+(isNaN(c)?0:c)+(isNaN(d)?0:d)+(isNaN(e)?0:e);

    this.total.horasClase=this.calculoHoraClase.grado1+this.calculoHoraClase.grado2+
                          this.calculoHoraClase.grado3+this.calculoHoraClase.grado4+
                          this.calculoHoraClase.grado5;
    
}
private configCatch(e: any) { 
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
} 