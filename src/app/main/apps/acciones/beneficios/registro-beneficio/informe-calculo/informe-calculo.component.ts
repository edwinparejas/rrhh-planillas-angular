import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { TipoFormularioBeneficioEnum, TipoMotivoAccionEnum } from '../../_utils/constants';

@Component({
  selector: 'minedu-informe-calculo',
  templateUrl: './informe-calculo.component.html',
  styleUrls: ['./informe-calculo.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InformeCalculoComponent implements OnInit {
    disabled:boolean = true;
    @Input() form:FormGroup;
    
   currentSession: SecurityModel = new SecurityModel();
    constructor(
      
      private formBuilder: FormBuilder,
      private dataService: DataService,
    ) { }
  
    ngOnInit() {
        console.log('InformeCalculoComponent');
        //this.form.controls['numeroInformeCalculo'].disable();
        //this.form.controls['conInformeCalculo'].disable();
        this.form.get("idMotivoAccion").valueChanges.subscribe(x => {
            this.loadFactorCalculo();
        });
    }
    
/**
    * Métodos Internos*/
 
    esVisiblects29944(){
        //ID_MOTIVO_ACCION	CODIGO_MOTIVO_ACCION	DESCRIPCION_MOTIVO_ACCION
        //5	5	OTORGAR COMPENSACIÓN POR TIEMPO DE SERVICIOS
        var listMotivoAccion = [5];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var administrativo = this.form.get("administrativo").value;
        var re = false;
        if(administrativo)
            re = false;
        else if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.CTS29944
            });
        }
        return re;
    }
    esVisiblects276(){
        //ID_MOTIVO_ACCION	CODIGO_MOTIVO_ACCION	DESCRIPCION_MOTIVO_ACCION
        //5	5	OTORGAR COMPENSACIÓN POR TIEMPO DE SERVICIOS
        var listMotivoAccion = [5];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var administrativo = this.form.get("administrativo").value;
        var re = false;
        if(!administrativo)
            re = false;
        else if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.CTS276
            });
        }
            
        return re;
    }
    esVisibleCreditoDevengado(){
        
        var listMotivoAccion = [13];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else{
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.CreditoDevengado
            });
        } 
            
        return re;
    }
    esVisibleSubsidioFamiliar(){
        
        var listMotivoAccion = [7,8];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.SubsidioFamiliar,
                tipoMotivoAccion: TipoMotivoAccionEnum.SubsidioFamiliar
            });
        }
        return re;
    }
    
    esVisibleVacacionesTruncas(){
        
        var listMotivoAccion = [16];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else{
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.VacacionesTruncas,
                tipoMotivoAccion: TipoMotivoAccionEnum.VacacionesTruncas
            });
        } 
           
        return re;
    }
    
    esVisibleats25(){
        var listMotivoAccion = [9];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.ATS25
            });
        }
            
        return re;
    }
    esVisibleats30(){
        var listMotivoAccion = [10];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else{
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.ATS30
            });
        } 
            
        return re;
    }
    esVisiblegts25(){
        var listMotivoAccion = [203,204];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.GST25
            });
        }
            
        return re;
    }
    esVisibleBonificacionFamiliar(){
        var listMotivoAccion = [11];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.BonificacionFamiliar,
                tipoMotivoAccion: TipoMotivoAccionEnum.BonificacionFamiliar
            });
        }
            
        return re;
    }
    esVisibleBonificacionPersonal(){
        var listMotivoAccion = [12];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.BonificacionPersonal
            });
        }
            
        return re;
    }
    esVisibleIncentivoProfesional(){
        var listMotivoAccion = [15];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.IncentivoProfesional
            });
        }
            
        return re;
    }
    esVisibleIncentivoEstudios(){
        var listMotivoAccion = [14];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.IncentivoEstudios
            });
        }
            
        return re;
    }
    esVisiblePremioAnual(){
        var listMotivoAccion = [123];
        var idMotivoAccion = this.form.get("idMotivoAccion").value;
        var re = false;
        if(!(listMotivoAccion.includes(idMotivoAccion)))
            re = false
        else {
            re = true;
            this.form.patchValue({ 
                tipoFormularioBeneficio: TipoFormularioBeneficioEnum.PremioAnual
            });
        }
            
        return re;
    }
    addParam(queryParam:HttpParams,param,value){
        if(value)
            queryParam = queryParam.set(param, value);
        return queryParam
    }
    getValueOrNullFromCero(value){
        return value==0?null:value;
      }
      getValueOrNullFromEmpy(value){
        return value==""?null:value;
      }
    /**
    * Métodos Integración Back*/
     loadFactorCalculo() {
        if(!this.form.get("idMotivoAccion").value)
            return;
        console.log('InformeCalculoComponent',this.form.get("idMotivoAccion").value);
        
        let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoRol', this.getValueOrNullFromEmpy(this.form.get('codigoTipoSede').value));
        queryParam = this.addParam(queryParam,'idRegimenLaboral', this.getValueOrNullFromCero(this.form.get('idRegimenLaboral').value));
        queryParam = this.addParam(queryParam,'idAccion', this.getValueOrNullFromCero(this.form.get('idAccion').value));
        queryParam = this.addParam(queryParam,'idMotivoAccion', this.getValueOrNullFromCero(this.form.get('idMotivoAccion').value));
        this.dataService.Beneficios().getFactorCalculo(queryParam).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                this.setFormResponse(result);
            }
        });
    }

    /**
    * Métodos Util */
     setFormResponse(data){
        console.log('data',data);
         //var factorCalculo = parseInt((data.factorCalculo==0)?100:data.factorCalculo);
        // var tiempoServicioCalculoTexto =data.aniosTiempoServicio.substring(0,9); 

        // var tiempoServicioCAnios = parseInt(data.aniosTiempoServicio.substring(0,2));  
        // var baseCalculo = parseFloat(data.baseCalculo);
        // var importeBeneficio = tiempoServicioCAnios*(factorCalculo/100)*baseCalculo;
        this.form.patchValue({ 
            baseCalculo: data.baseCalculo,
            factorCalculo:data.factorCalculo,
            //tiempoServicioCalculo:tiempoServicioCalculoTexto,
            //importeBeneficio:importeBeneficio
            });
           
        }

}
