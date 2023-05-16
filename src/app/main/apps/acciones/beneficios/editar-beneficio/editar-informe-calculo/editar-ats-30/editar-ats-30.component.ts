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
  selector: 'minedu-editar-ats-30',
  templateUrl: './editar-ats-30.component.html',
  styleUrls: ['./editar-ats-30.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarAts30Component implements OnInit {
    disabled:boolean = true;
    @Input() form:FormGroup;
    constructor(
      
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
    ngOnInit() {
        this.form.get("factorCalculo").valueChanges.subscribe(x => {
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
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.ATS30){
                if(this.validarGuardar()){
                    this.form.patchValue({ 
                        //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                        generarProyecto:true
                    });
                    
                }
            }
         });
         this.form.get("validarEnviarAccionesGrabadas").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.ATS30){
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
                    .guardarEditarBeneficioATS30(
                        generarFormDataUtil(this.form.value)
                    )
                    .pipe(
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
        if(!this.form.get('baseCalculo').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M20, 3000, () => {

            });
            return false;
        }else if(this.form.get('baseCalculo').value == "0")
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
            
            this.dataService.Beneficios().guardarEditarBeneficioATS30(generarFormDataUtil(this.form.value)).pipe(
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
        if(this.form.get("factorCalculo").value!=null){
            let baseCalculo = parseFloat(this.form.get("baseCalculo").value);
            let factorCalculo = parseInt(this.form.get("factorCalculo").value);
            let factorCalculoformula = (factorCalculo==0)?1:factorCalculo/100;
            let importeBeneficio = baseCalculo*factorCalculoformula;
            if(importeBeneficio.toString().length>=9){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL IMPORTE DEL BENEFICIO."', 3000, () => {
                    this.form.patchValue({ 
                        baseCalculo : 0
                        });
                });
            }else{
                this.form.patchValue({ 
                    factorCalculo : factorCalculo,
                    importeBeneficio:importeBeneficio
                    });
            }
        }
    }

}
