import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-anular-cts-276',
  templateUrl: './anular-cts-276.component.html',
  styleUrls: ['./anular-cts-276.component.scss'],
  encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class Anularcts276Component implements OnInit {
    @Input() form:FormGroup;
  constructor() { }

    ngOnInit() {
        this.loadImporteBeneficio();
    }
    loadImporteBeneficio(){
        if(this.form.get("tiempoServicioOficiales").value!=null){
            let aniosTiempoServicio = this.form.get("tiempoServicioOficiales").value;
            //3 año(s) 1 mes(es) 23 día(s)
            
            let indexAnio = aniosTiempoServicio.indexOf('año',0);
            let valorAnio = parseInt(aniosTiempoServicio.substring(0,indexAnio).trim(),10);
            aniosTiempoServicio = aniosTiempoServicio.substring(indexAnio+6);
            let indexMes = aniosTiempoServicio.indexOf('mes',0);
            let valorMes = parseInt(aniosTiempoServicio.substring(0,indexMes).trim(),10);
            aniosTiempoServicio = aniosTiempoServicio.substring(indexAnio+7);
            let indexDia = aniosTiempoServicio.indexOf('día',0);
            let valorDia = parseInt(aniosTiempoServicio.substring(0,indexDia).trim(),10);


            let tiempoServicioCalculoAnioTexto = valorAnio+' año(s)';//this.form.get("aniosTiempoServicio").value.substring(0,9);
            let tiempoServicioCalculoMesTexto = valorMes+' mes(es)';//this.form.get("aniosTiempoServicio").value.substring(10,19);
            let tiempoServicioCalculoDiaTexto =  valorDia+' día(s)';//this.form.get("aniosTiempoServicio").value.substring(20);
            

            this.form.patchValue({ 

                tiempoServicioCalculoAnioTexto:tiempoServicioCalculoAnioTexto,
                tiempoServicioCalculoMesTexto:tiempoServicioCalculoMesTexto,
                tiempoServicioCalculoDiaTexto:tiempoServicioCalculoDiaTexto
                });
            }
    }
}
