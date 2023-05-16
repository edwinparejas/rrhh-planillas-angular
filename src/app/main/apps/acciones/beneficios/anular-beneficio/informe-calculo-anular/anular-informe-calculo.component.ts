import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DataService } from 'app/core/data/data.service';
import { TipoFormularioBeneficioEnum } from '../../_utils/constants';

@Component({
  selector: 'minedu-anular-informe-calculo',
  templateUrl: './anular-informe-calculo.component.html',
  styleUrls: ['./anular-informe-calculo.component.scss']
})
export class AnularInformeCalculoComponent implements OnInit {
    @Input() form:FormGroup;
    constructor(
      
        private formBuilder: FormBuilder,
        private dataService: DataService,
      ) { }

  ngOnInit() {
    
  }
  esVisiablects29944(){
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
    else 
        re = true;
    return re;
}
esVisiablects276(){
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
    else 
        re = true;
    return re;
}
esVisiableCreditoDevengado(){
    
    var listMotivoAccion = [13];
    var idMotivoAccion = this.form.get("idMotivoAccion").value;
    var re = false;
    if(!(listMotivoAccion.includes(idMotivoAccion)))
        re = false
    else 
        re = true;
    return re;
}
esVisiableSubsidioFamiliar(){
    
    var listMotivoAccion = [7,8];
    var idMotivoAccion = this.form.get("idMotivoAccion").value;
    var re = false;
    if(!(listMotivoAccion.includes(idMotivoAccion)))
        re = false
    else 
        re = true;
    return re;
}

esVisiableVacacionesTruncas(){
    
    var listMotivoAccion = [16];
    var idMotivoAccion = this.form.get("idMotivoAccion").value;
    var re = false;
    if(!(listMotivoAccion.includes(idMotivoAccion)))
        re = false
    else 
        re = true;
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
            //tipoMotivoAccion: TipoMotivoAccionEnum.BonificacionFamiliar
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
}
