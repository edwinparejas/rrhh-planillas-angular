import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'minedu-accion-personal',
  templateUrl: './accion-personal.component.html',
  styleUrls: ['./accion-personal.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AccionPersonalComponent implements OnInit {

    @Input() form:FormGroup;
    
   currentSession: SecurityModel = new SecurityModel();
  constructor(
    
    private formBuilder: FormBuilder,
    private dataService: DataService,
  ) { }
   /**
    * Métodos  */
  ngOnInit() {
    this.form.patchValue({
        mandatoJudicial:false
      });
    this.buildSeguridad();
    this.passport();
    this.loadCombos();

}
passport() {
    this.form.patchValue({
        codigoRol: this.currentSession.codigoRol,
        codigoSede: this.currentSession.codigoSede,
        codigoTipoSede: this.currentSession.codigoTipoSede,
      });
  }
buildSeguridad() {
    this.currentSession = this.dataService.Storage().getInformacionUsuario();
};
/**
    * Variables HTML*/
 comboLists = {
    listRegimenLaboral: [],
    listAccion: [],
    listMotivoAccion:[],
    listTipoDocumentoIdentidad:[],
};

/**
    * Métodos HTML*/
 
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
selectRegimenLaboral(idRegimenLaboral) {
    this.resetFormRegimenLaboral();
    var regimenLaboral= this.comboLists.listRegimenLaboral.filter(x=>x.value == idRegimenLaboral)[0];
    this.form.patchValue({ 
        administrativo : regimenLaboral.administrativo,
        regimenLaboralTexto: regimenLaboral.label
        });
        console.log('administrativo',regimenLaboral);
    
    let queryParam = new HttpParams();
    //queryParam = this.addParam(queryParam,'mandatoJudicial',this.form.get('mandatoJudicial').value);
    queryParam = this.addParam(queryParam,'codigoRol', this.getValueOrNullFromEmpy(this.form.get('codigoRol').value));
    queryParam = this.addParam(queryParam,'codigoSede', this.getValueOrNullFromEmpy(this.form.get('codigoSede').value));
    queryParam = this.addParam(queryParam,'codigoTipoSede', this.getValueOrNullFromEmpy(this.form.get('codigoTipoSede').value));
    queryParam = this.addParam(queryParam,'idRegimenLaboral', this.getValueOrNullFromCero(this.form.get('idRegimenLaboral').value));
    
   
    this.loadAccion(queryParam);
}
selectAccion(idAccion){
    this.resetFormAccion();
    var accion= this.comboLists.listAccion.filter(x=>x.value == idAccion)[0];
    this.form.patchValue({ 
        accionTexto: accion.label
        });
    let queryParam = new HttpParams();
    //queryParam = this.addParam(queryParam,'mandatoJudicial',this.form.get('mandatoJudicial').value);
    queryParam = this.addParam(queryParam,'codigoRol', this.getValueOrNullFromEmpy(this.form.get('codigoRol').value));
    queryParam = this.addParam(queryParam,'codigoSede', this.getValueOrNullFromEmpy(this.form.get('codigoSede').value));
    queryParam = this.addParam(queryParam,'codigoTipoSede', this.getValueOrNullFromEmpy(this.form.get('codigoTipoSede').value));
    queryParam = this.addParam(queryParam,'idRegimenLaboral', this.getValueOrNullFromCero(this.form.get('idRegimenLaboral').value));
    queryParam = this.addParam(queryParam,'idAccion', this.getValueOrNullFromCero(this.form.get('idAccion').value));

    this.loadMotivoAccion(queryParam);
}
selectMotivoAccion(idMotivoAccion){
    
    this.resetFormMotivoAccion();
    console.log('mandatoJudicial',this.form.get('mandatoJudicial').value);
    var motivoAccion= this.comboLists.listMotivoAccion.filter(x=>x.value == idMotivoAccion)[0];
    this.form.patchValue({ 
        motivoAccionTexto: motivoAccion.label
        });
    if(this.form.get('mandatoJudicial').value){
        let queryParam = new HttpParams();
        //queryParam = this.addParam(queryParam,'mandatoJudicial',this.form.get('mandatoJudicial').value);
    
        queryParam = this.addParam(queryParam,'idRegimenLaboral', this.getValueOrNullFromCero(this.form.get('idRegimenLaboral').value));
        queryParam = this.addParam(queryParam,'idAccion', this.getValueOrNullFromCero(this.form.get('idAccion').value));
        queryParam = this.addParam(queryParam,'idMotivoAccion', this.getValueOrNullFromCero(this.form.get('idMotivoAccion').value));
        queryParam = this.addParam(queryParam,'mandatoJudicial', this.form.get('mandatoJudicial').value+'');
        this.validarMandatoJudicial(queryParam);
    }
    
}
selectMandatoJudicial(){
    if(this.form.get('mandatoJudicial').value){
        if(this.form.get('idRegimenLaboral').value!=0
            && this.form.get('idAccion').value!=0
            && this.form.get('idMotivoAccion').value!=0
            ){
            let queryParam = new HttpParams();
            //queryParam = this.addParam(queryParam,'mandatoJudicial',this.form.get('mandatoJudicial').value);
            
            queryParam = this.addParam(queryParam,'idRegimenLaboral', this.getValueOrNullFromCero(this.form.get('idRegimenLaboral').value));
            queryParam = this.addParam(queryParam,'idAccion', this.getValueOrNullFromCero(this.form.get('idAccion').value));
            queryParam = this.addParam(queryParam,'idMotivoAccion', this.getValueOrNullFromCero(this.form.get('idMotivoAccion').value));
            queryParam = this.addParam(queryParam,'mandatoJudicial', this.form.get('mandatoJudicial').value+'');
            this.validarMandatoJudicial(queryParam);
        }
    }
    
}
/**
    * Métodos Internos*/

resetFormMandatoJudicial() {
    this.form.controls['idRegimenLaboral'].setValue(0);
    this.form.controls['idAccion'].setValue(0);
    this.form.controls['idMotivoAccion'].setValue(0);
    this.comboLists.listRegimenLaboral = [];
    this.comboLists.listAccion = [];
    this.comboLists.listMotivoAccion = [];
}

resetFormRegimenLaboral() {
    this.form.controls['idAccion'].setValue(0);
    this.form.controls['idMotivoAccion'].setValue(0);
    this.comboLists.listAccion = [];
    this.comboLists.listMotivoAccion = [];
}
resetFormAccion() {
    this.form.controls['idMotivoAccion'].setValue(0);
    this.comboLists.listMotivoAccion = [];
}
resetFormMotivoAccion() {
}
loadCombos() {
    // let dataLoadRegimenLaboral = {
    //     codigoRol:this.form.get('codigoRol').value,
    //     codigoSede:this.form.get('codigoSede').value,
    //     codigoTipoSede:this.form.get('codigoTipoSede').value
    // }
    this.loadRegimenLaboral();
};
/**
    * Métodos Integración Back*/
 loadRegimenLaboral() {
    let queryParam = new HttpParams();
        queryParam = this.addParam(queryParam,'codigoRol',this.form.get('codigoRol').value);
        queryParam = this.addParam(queryParam,'codigoSede',this.form.get('codigoSede').value);
        queryParam = this.addParam(queryParam,'codigoTipoSede',this.form.get('codigoTipoSede').value);
    this.dataService.Beneficios().getComboRegimenLaboralRegistro(queryParam).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            if(result.length == 0)
            {
                this.dataService.Message().msgInfo(
                    "NO HAY REGISTROS DE REGIMEN LABORAL", () => {
                    
                });
            }
            this.comboLists.listRegimenLaboral = result.map((x) => ({
                ...x,
                value: x.idRegimenLaboral,
                label: x.descripcionRegimenLaboral,
                administrativo:x.administrativo
            }));
        }
        
    });
}
loadAccion(data:HttpParams) {
    this.dataService.Beneficios().getComboAccionRegistro(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
        if (result) {
            if(result.length == 0)
            {
                this.dataService.Message().msgInfo(
                    "NO HAY REGISTROS DE ACCIÓN", () => {
                    
                });
            }            
            this.comboLists.listAccion = result.map((x) => ({
                ...x,
                value: x.idAccion,
                label: x.descripcionAccion
            }));
        }
    });
}

    loadMotivoAccion(data) {
        this.dataService.Beneficios().getComboMotivoAccionRegistro(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                if(result.length == 0)
                {
                    this.dataService.Message().msgInfo(
                        "NO HAY REGISTROS DE MOTIVO ACCIÓN", () => {
                        
                    });
                }            
                this.comboLists.listMotivoAccion = result.map((x) => ({
                    ...x,
                    value: x.idMotivoAccion,
                    label: x.descripcionMotivoAccion
                }));
            }
        });
    }
    validarMandatoJudicial(data) {
        this.dataService.Beneficios().validarMandatoJudicial(data).pipe(catchError(() => of([])), finalize(() => { })).subscribe((result: any) => {
            if (result) {
                if(result.length == 0)
                {
                    this.dataService.Message().msgInfo(
                        "MOTIVO NO CONFIGURADO PARA ACCIÓN POR MANDATO JUDICIAL", () => {
                        
                    });
                    this.form.patchValue({
                        idMotivoAccion:0
                      });
                }
            }
        });
    }
}
