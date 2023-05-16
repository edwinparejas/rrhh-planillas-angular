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
  selector: 'minedu-editar-incentivo-estudios',
  templateUrl: './editar-incentivo-estudios.component.html',
  styleUrls: ['./editar-incentivo-estudios.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarIncentivoEstudiosComponent implements OnInit {
    disabled:boolean = true;
    @Input() form:FormGroup;
    constructor(
      
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
    ngOnInit() {
        
      
        this.form.get("guardar").valueChanges.subscribe(x => {
            if(x)
                this.guardar();
         })
         this.form.get("validarGenerarProyecto").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.IncentivoEstudios){
                if(this.validarGuardar()){
                    this.form.patchValue({ 
                        //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                        generarProyecto:true
                    });
                    
                }
            }
         });
         this.form.get("validarEnviarAccionesGrabadas").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.IncentivoEstudios){
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
  onKeyPressImporteBeneficio(e: any): boolean {
    const reg = /[0-9]|[.]/;
    const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
    if (!reg.test(pressedKey)) {
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
                    .guardarEditarBeneficioIncentivoEstudios(
                        generarFormDataUtil(this.form.value)
                    ).pipe(
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
        if(!this.form.get('importeBeneficio').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M27, 3000, () => {

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
            
            this.dataService.Beneficios().guardarEditarBeneficioIncentivoEstudios(generarFormDataUtil(this.form.value)).pipe(
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
            let factorCalculo = parseInt(this.form.get("factorCalculo").value);
            
            let aniosTiempoServicio = this.form.get("aniosTiempoServicio").value;

            let indexAnio = aniosTiempoServicio.indexOf('año',0);
            let tiempoServicio = parseInt(aniosTiempoServicio.substring(0,indexAnio).trim(),10);

            let tiempoServicioTexto = tiempoServicio+' año(s)';
    
            let factorCalculoValue = (factorCalculo==0)?100:factorCalculo;
            let factorCalculoformula = (factorCalculo==0)?1:factorCalculo/100;
            console.log(baseCalculo+" "+factorCalculoformula+" "+tiempoServicio);
            let importeBeneficio = baseCalculo*factorCalculoformula*tiempoServicio;
            if(importeBeneficio.toString().length>=9){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL IMPORTE DEL BENEFICIO."', 3000, () => {
                    this.form.patchValue({ 
                        baseCalculo : 0
                        });
                });
            }else{
                this.form.patchValue({ 
                    factorCalculo : factorCalculoValue,
                    tiempoServicioCalculo:tiempoServicioTexto,
                    importeBeneficio:importeBeneficio
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
