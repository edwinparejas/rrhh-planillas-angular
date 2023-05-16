import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MISSING_TOKEN } from 'app/core/model/types';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { MensajesSolicitud, TipoFormularioBeneficioEnum } from '../../../_utils/constants';
import { generarFormDataUtil } from '../../../_utils/formDataUtil';

@Component({
  selector: 'minedu-cts-276',
  templateUrl: './cts-276.component.html',
  styleUrls: ['./cts-276.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class cts276Component implements OnInit {
    disabled:boolean = true;
    @Input() form:FormGroup;
    constructor(
      
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
    ngOnInit() {
        
        this.form.get("aniosTiempoServicio").valueChanges.subscribe(x => {
            this.loadImporteBeneficio();
         })
         this.form.get("baseCalculo").valueChanges.subscribe(x => {
            this.loadImporteBeneficio();
         })
        this.form.get("guardar").valueChanges.subscribe(x => {
            if(x)
                this.guardar();
         })
         this.form.get("validarGenerarProyecto").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.CTS276){
                if(this.validarGuardar()){
                    this.form.patchValue({ 
                        //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                        generarProyecto:true
                    });
                    
                }
            }
         });
         this.form.get("validarEnviarAccionesGrabadas").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.CTS276){
                this.EnviarAccionesGrabadas();
            }
         });
    }
/**
    * Métodos HTML*/
 onKeyPressnumeroInformeCalculo(e: any): boolean {
    var inp = String.fromCharCode(e.keyCode);
      if (/[a-zA-Z0-9]/.test(inp)) {
        return true;
      } else {
        e.preventDefault();
        return false;
      }
  }
  handleBuscarInformeCalculo(){
    
  }
  selectConInformeCalculo(){
    
    }
    onKeyPressBaseCalculo(e: any): boolean {
        const reg = /[0-9]|[.]/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
        }  
    }
    /**
    * Métodos Integración Back*/
     EnviarAccionesGrabadas =()=>{
        if(!this.validarGuardar())
            return;        
        this.form.patchValue({ 
            //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
            accionesGrabadas:true
        });
        let mensajeEnviar = "LA ACCION POR SENTENCIA JUDICIAL REQUIERE DE AUTORIZACION PARA GENERAR EL PROYECTO DE RESOLUCION ¿ESTÁ SEGURO DE QUE DESEA SOLICITAR AUTORIZACION PARA LA ACCION POR SENTENCIA JUDICIAL?";
        if(!this.form.get('mandatoJudicial').value){
            mensajeEnviar ="¿ESTÁ SEGURO QUE DESEA ENVIAR A ACCIONES GRABADAS?"; 
        }
        this.dataService.Message().msgConfirm(
            mensajeEnviar,
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService
                    .Beneficios()
                    .guardarBeneficioCTS276(
                        generarFormDataUtil(this.form.value)
                    )
                    .pipe(catchError((error) => {
                        
                        this.dataService.Message().msgWarning('"'+error.messages[0].toUpperCase()+'"');
                        return of(null);
                    }), finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })).subscribe((response) => {
                        
                        if (response) {
                                this.dataService
                                    .Util()
                                    .msgAutoCloseSuccess(
                                        "OPERACIÓN REALIZADA DE FORMA EXITOSA",
                                        2000,
                                        () => {
                                            this.form.patchValue({ 
                                                retornar: true
                                            }); 
                                        }
                                    );
                                //@aqui retornamos el response, para ver si en la vista de lista, lo recibe
                                return response;
                        } else if (
                            response &&
                            (response.statusCode === 422 ||
                                response.statusCode === 404)
                        ) {
                            this.dataService.Message().msgWarning('"'+response.messages[0]+'"', () => {});
                        } else if (
                            response &&
                            (response.statusCode === 401 ||
                                response.error === MISSING_TOKEN.INVALID_TOKEN)
                        ) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => {
                                    this.dataService
                                        .Storage()
                                        .passportUILogin();
                                });
                        } 
                        // else {
                        //     this.dataService
                        //         .Util()
                        //         .msgError(
                        //             "OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LOS DOCUMENTOS DE SUSTENTO, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS.",
                        //             () => {}
                        //         );
                        // }
                    });
            },
            () => {}
        );
    }
     validarGuardar(){
        if(!this.form.get('motivoBeneficio').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M33, 3000, () => {

            });
            return false;
        }
        if(!this.form.get('fechaBeneficio').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M19, 3000, () => {

            });
            return false;
        }
        if(!this.form.get('baseCalculo').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M20, 3000, () => {

            });
            return false;
        }
        return true;
    }
     guardar(){
        console.log('guardando');
        if(!this.validarGuardar())
            return;
        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?', () => {
            this.dataService.Spinner().show("sp6");
            
            this.dataService.Beneficios().guardarBeneficioCTS276(generarFormDataUtil(this.form.value)).pipe(
                catchError((response : HttpErrorResponse) =>{
                    this.dataService.Message().msgWarning(response.error.messages[0]);
                    return of(null);
                }),
                finalize(()=>{this.dataService.Spinner().hide("sp6");})
            ).subscribe(
              (response:any) => {
                if(response){
                    this.dataService.Message().msgAutoCloseSuccessNoButton('"OPERACIÓN REALIZADA DE FORMA EXITOSA."', 3000, () => {
                        this.form.patchValue({ 
                            retornar: true
                        });
                    });
                }
              });
          }, () => { });
          
     }
     /**
    * Métodos Util */

      loadImporteBeneficio(){
        if(this.form.get("aniosTiempoServicio").value!=null){
            let baseCalculo = parseFloat(this.form.get("baseCalculo").value);
            let aniosTiempoServicio = this.form.get("aniosTiempoServicio").value;
            //3 año(s) 1 mes(es) 23 día(s)
            
            let indexAnio = aniosTiempoServicio.indexOf('año',0);
            let valorAnio = parseInt(aniosTiempoServicio.substring(0,indexAnio).trim(),10);
            aniosTiempoServicio = aniosTiempoServicio.substring(indexAnio+6);
            console.log('aniosTiempoServicio',aniosTiempoServicio);
            let indexMes = aniosTiempoServicio.indexOf('mes',0);
            let valorMes = parseInt(aniosTiempoServicio.substring(0,indexMes).trim(),10);
            aniosTiempoServicio = aniosTiempoServicio.substring(indexAnio+ (valorMes<10)?11:10);
            console.log('aniosTiempoServicio',aniosTiempoServicio);
            let indexDia = aniosTiempoServicio.indexOf('día',0);
            let valorDia = parseInt(aniosTiempoServicio.substring(0,indexDia).trim(),10);
            console.log('valorDia',valorDia);

            let tiempoServicioCalculoAnioTexto = valorAnio+' año(s)';//this.form.get("aniosTiempoServicio").value.substring(0,9);
            let tiempoServicioCalculoMesTexto = valorMes+' mes(es)';//this.form.get("aniosTiempoServicio").value.substring(10,19);
            let tiempoServicioCalculoDiaTexto =  valorDia+' día(s)';//this.form.get("aniosTiempoServicio").value.substring(20);
            
            // let valorAnio = parseInt(this.form.get("aniosTiempoServicio").value.substring(0,2));
            // let valorMes = parseInt(this.form.get("aniosTiempoServicio").value.substring(10,1));
            // let valorDia = parseInt(this.form.get("aniosTiempoServicio").value.substring(20,1));

            let tiempoServicioCalculoAnio = valorAnio*baseCalculo;
            let tiempoServicioCalculoMes = valorMes*(baseCalculo/12);
            let tiempoServicioCalculoDia = (valorDia==0)?0:valorDia*(baseCalculo/365);

            let importeBeneficio = tiempoServicioCalculoAnio+tiempoServicioCalculoMes+tiempoServicioCalculoDia;
            importeBeneficio = parseFloat(importeBeneficio.toFixed(2));
            
            if(importeBeneficio.toString().length>10){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL IMPORTE DEL BENEFICIO."', 3000, () => {
                    this.form.patchValue({ 
                        baseCalculo : 0
                        });
                });
            }else{
                this.form.patchValue({ 
                    tiempoServicioCalculoAnio:tiempoServicioCalculoAnio.toFixed(2),
                    tiempoServicioCalculoMes:tiempoServicioCalculoMes.toFixed(2),
                    tiempoServicioCalculoDia:tiempoServicioCalculoDia.toFixed(2),
    
                    tiempoServicioCalculoAnioTexto:tiempoServicioCalculoAnioTexto,
                    tiempoServicioCalculoMesTexto:tiempoServicioCalculoMesTexto,
                    tiempoServicioCalculoDiaTexto:tiempoServicioCalculoDiaTexto,
    
                    importeBeneficio:importeBeneficio.toFixed(2)
                });
            }
            
        }
    }

      getData() {
        const usuario = this.dataService.Storage().getPassportUserData();
        const formatYmd = date => date.toISOString().slice(0, 10);
        let dataForm = this.form.value;
        console.log('dataForm',dataForm)
        let data = {
        //Rol
        codigoRol :dataForm.codigoRol,
        codigoSede:dataForm.codigoSede,
        //Acción Personal
        mandatoJudicial: dataForm.mandatoJudicial,
        idRegimenLaboral: dataForm.idRegimenLaboral,
        idAccion:dataForm.idAccion,
        idMotivoAccion:dataForm.idMotivoAccion,

        //Servidor Público
        idTipoDocumentoIdentidad:dataForm.idTipoDocumentoIdentidad,
        numeroDocumentoIdentidad:dataForm.numeroDocumentoIdentidad,
        idPersona:dataForm.idPersona,
        idServidorPublico:dataForm.idServidorPublico,
        codigoServidorPublico:dataForm.codigoServidorPublico,
        idNivelInstancia:dataForm.idNivelInstancia,
        idCentroTrabajo:dataForm.idCentroTrabajo,
        idSituacionLaboral:dataForm.idSituacionLaboral,
        idCondicionLaboral:dataForm.idCondicionLaboral,
        fechaInicioVinculacion:dataForm.fechaInicioVinculacion,
        fechaFinVinculacion:dataForm.fechaFinVinculacion,
        codigoPlaza:dataForm.codigoPlaza,
        idCategoriaRemunerativa:dataForm.idCategoriaRemunerativa,
        //Informe escalafonario
        numeroInformeEscalafonario:dataForm.numeroInformeEscalafonario,
        nombreDocumentoInformeEscalafonario :dataForm.nombreDocumentoInformeEscalafonario,
        documentoInformeEscalafonario:dataForm.documentoInformeEscalafonario,
        fechaInformeEscalafonario:dataForm.fechaInformeEscalafonario,
        fechaBeneficioInformeEscalafonario:dataForm.fechaBeneficioInformeEscalafonario,
        aniosTiempoServicio:dataForm.aniosTiempoServicio,
        aniosUltimoCargo:dataForm.aniosUltimoCargo,
        motivoBeneficio:dataForm.motivoBeneficio,

        //Informe cálculo
        numeroInformeCalculo:dataForm.numeroInformeCalculo,
        fechaBeneficio:dataForm.fechaBeneficio,
        conInformeCalculo:dataForm.conInformeCalculo,

        baseCalculo: parseFloat(dataForm.baseCalculo),
        
        tiempoServicioCalculoAnio:parseFloat(dataForm.tiempoServicioCalculoAnio),
        tiempoServicioCalculoMes:parseFloat(dataForm.tiempoServicioCalculoMes),
        tiempoServicioCalculoDia:parseFloat(dataForm.tiempoServicioCalculoDia),
        importeBeneficio:parseFloat(dataForm.importeBeneficio),
        
        //Anotacioens
        anotaciones:dataForm.anotaciones,

        //Auditoria
        fechaCreacion: new Date(),
        usuarioCreacion: usuario.NOMBRES_USUARIO+" "+usuario.APELLIDO_PATERNO+" "+usuario.APELLIDO_MATERNO,
        ipCreacion: "",
        }

        return data;
      }


}
