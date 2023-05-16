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
  selector: 'minedu-credito-devengado',
  templateUrl: './credito-devengado.component.html',
  styleUrls: ['./credito-devengado.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class CreditoDevengadoComponent implements OnInit {
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

        this.form.patchValue({ 
            totalLiquidacionCreditoDevengado : 0,
            pagadoCreditoDevengado : 0,
            interesesLegalesCreditoDevengado : 0,
            totalDeudaCreditoDevengado:0,
            porPagarCreditoDevengado:0,
        });

         this.form.get("totalLiquidacionCreditoDevengado").valueChanges.subscribe(x => {
            this.loadCreditoDevengado();
         })
         this.form.get("pagadoCreditoDevengado").valueChanges.subscribe(x => {
            this.loadCreditoDevengado();
         })
         this.form.get("interesesLegalesCreditoDevengado").valueChanges.subscribe(x => {
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
                    .guardarBeneficioCreditoDevengado(
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
        if(!this.form.get('totalLiquidacionCreditoDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M24, 3000, () => {
            });
            return false;
        }
        if(!this.form.get('pagadoCreditoDevengado').value)
        {
            this.dataService.Message().msgAutoCloseWarning(MensajesSolicitud.M25, 3000, () => {
            });
            return false;
        }
        if(!this.form.get('interesesLegalesCreditoDevengado').value)
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
            
            this.dataService.Beneficios().guardarBeneficioCreditoDevengado(generarFormDataUtil(this.form.value)).pipe(
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
            let totalLiquidacionCreditoDevengado = parseFloat(this.form.get("totalLiquidacionCreditoDevengado").value);
            let pagadoCreditoDevengado = parseFloat(this.form.get("pagadoCreditoDevengado").value);
            let interesesLegalesCreditoDevengado = parseFloat(this.form.get("interesesLegalesCreditoDevengado").value);
            
            let totalDeudaCreditoDevengado = totalLiquidacionCreditoDevengado- pagadoCreditoDevengado;
            let porPagarCreditoDevengado = totalDeudaCreditoDevengado+interesesLegalesCreditoDevengado;
            if(totalLiquidacionCreditoDevengado.toString().length>8){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL VALOR DE TOTAL LIQUIDACIÓN."', 3000, () => {
                    this.form.patchValue({ 
                        totalLiquidacionCreditoDevengado : 0
                        });
                });
            }
            if(pagadoCreditoDevengado.toString().length>8){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL VALOR DE PAGADO."', 3000, () => {
                    this.form.patchValue({ 
                        pagadoCreditoDevengado : 0
                        });
                });
            }
            if(interesesLegalesCreditoDevengado.toString().length>8){
                this.dataService.Message().msgAutoCloseWarning('"SE HA EXÉDIDO EL LÍMITE DEL VALOR DE INTERESES LEGALES."', 3000, () => {
                    this.form.patchValue({ 
                        interesesLegalesCreditoDevengado : 0
                        });
                });
            }
            this.form.patchValue({ 
                totalDeudaCreditoDevengado:totalDeudaCreditoDevengado.toFixed(2),
                porPagarCreditoDevengado:porPagarCreditoDevengado.toFixed(2),
                });
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

        idTipoCreditoDevengado:dataForm.idTipoCreditoDevengado,
        fechaInicioCreditoDevengado:dataForm.fechaInicioCreditoDevengado,
        fechaFinCreditoDevengado:dataForm.fechaFinCreditoDevengado,
        totalLiquidacionCreditoDevengado:parseFloat(dataForm.totalLiquidacionCreditoDevengado),
        pagadoCreditoDevengado:parseFloat(dataForm.pagadoCreditoDevengado),
        totalDeudaCreditoDevengado:parseFloat(dataForm.totalDeudaCreditoDevengado),
        interesesLegalesCreditoDevengado:parseFloat(dataForm.interesesLegalesCreditoDevengado),
        porPagarCreditoDevengado:parseFloat(dataForm.porPagarCreditoDevengado),
        
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
