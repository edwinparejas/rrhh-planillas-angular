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
  selector: 'minedu-editar-credito-devengado',
  templateUrl: './editar-credito-devengado.component.html',
  styleUrls: ['./editar-credito-devengado.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class EditarCreditoDevengadoComponent implements OnInit {
    disabled:boolean = true;
    @Input() form:FormGroup;
    comboLists = {
        listTipoCreditoDevengado: [],
    };
    constructor(
      
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
    ngOnInit() {
        
    this.loadCombos();
         this.form.get("totalLiquidacionDevengado").valueChanges.subscribe(x => {
            this.loadCreditoDevengado();
         })
         this.form.get("pagadoDevengado").valueChanges.subscribe(x => {
            this.loadCreditoDevengado();
         })
         this.form.get("interesLegalDevengado").valueChanges.subscribe(x => {
            this.loadCreditoDevengado();
         })
        
        this.form.get("guardar").valueChanges.subscribe(x => {
            if(x)
                this.guardar();
         })
         this.form.get("validarGenerarProyecto").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.CreditoDevengado){
                if(this.validarGuardar()){
                    this.form.patchValue({ 
                        //listaVacacionesTruncas: this.dataSource.obtenerDataSource(),
                        generarProyecto:true
                    });
                    
                }
            }
         });
         this.form.get("validarEnviarAccionesGrabadas").valueChanges.subscribe(x => {
            if(x && this.form.get('tipoFormularioBeneficio').value==TipoFormularioBeneficioEnum.CreditoDevengado){
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
    onKeyPressDecimal(e: any): boolean {
        const reg = /[0-9]|[.]/;
        const pressedKey = String.fromCharCode(!e.charCode ? e.which : e.charCode);
        if (!reg.test(pressedKey)) {
        e.preventDefault();
        return false;
        }  
    }
    loadCombos() {
        
        this.loadTipoCreditoDevengado();
    };
    /**
    * Métodos Integración Back*/
     loadTipoCreditoDevengado() {
        this.dataService.Beneficios().getComboTipoCreditoDevengado().pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                if(result.length == 0)
                {
                    this.dataService.Message().msgInfo(
                        "NO HAY REGISTROS DE TIPO CRÉDITO DEVENGADO", () => {
                        
                    });
                }
                this.comboLists.listTipoCreditoDevengado = result.map((x) => ({
                    ...x,
                    value: x.idTipoCreditoDevengado,
                    label: x.descripcionTipoCreditoDevengado
                }));
            }
            
        });
    }
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
                    .guardarEditarBeneficioCreditoDevengado(
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
        if(!this.form.get('idTipoCreditoDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M21, 3000, () => {
            });
            return false;
        }
        if(!this.form.get('fechaInicioCreditoDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M22, 3000, () => {
            });
            return false;
        }
        if(!this.form.get('fechaFinCreditoDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M23, 3000, () => {
            });
            return false;
        }
        if(!this.form.get('totalLiquidacionDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M24, 3000, () => {
            });
            return false;
        }
        if(!this.form.get('pagadoDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M25, 3000, () => {
            });
            return false;
        }
        if(!this.form.get('interesLegalDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M26, 3000, () => {
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
            
            this.dataService.Beneficios().guardarEditarBeneficioCreditoDevengado(generarFormDataUtil(this.form.value)).pipe(
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

      loadCreditoDevengado(){
        if(this.form.get("aniosTiempoServicio").value!=null){
            let totalLiquidacionDevengado = parseFloat(this.form.get("totalLiquidacionDevengado").value);
            let pagadoDevengado = parseFloat(this.form.get("pagadoDevengado").value);
            let interesLegalDevengado = parseFloat(this.form.get("interesLegalDevengado").value);
            
            let totalDeudaDevengado = totalLiquidacionDevengado- pagadoDevengado;
            let porPagarDevengado = totalDeudaDevengado+interesLegalDevengado;
            if(totalLiquidacionDevengado.toString().length>8){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL VALOR DE TOTAL LIQUIDACIÓN."', 3000, () => {
                    this.form.patchValue({ 
                        totalLiquidacionDevengado : 0
                        });
                });
            }
            if(pagadoDevengado.toString().length>8){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL VALOR DE PAGADO."', 3000, () => {
                    this.form.patchValue({ 
                        pagadoDevengado : 0
                        });
                });
            }
            if(interesLegalDevengado.toString().length>8){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL VALOR DE INTERESES LEGALES."', 3000, () => {
                    this.form.patchValue({ 
                        interesLegalDevengado : 0
                        });
                });
            }
            this.form.patchValue({ 
                totalDeudaDevengado:totalDeudaDevengado.toFixed(2),
                porPagarDevengado:porPagarDevengado.toFixed(2),
                });
        }
    }
}
