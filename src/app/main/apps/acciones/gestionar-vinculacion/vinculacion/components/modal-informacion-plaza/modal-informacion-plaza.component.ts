import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';


@Component({
    selector: "minedu-modal-informacion-plaza-dialog",
    templateUrl: "./modal-informacion-plaza.component.html",
    styleUrls: ["./modal-informacion-plaza.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})

export class ModalInformacionPlaza implements OnInit {
    
    form: FormGroup;
    working: boolean = false;
    plaza: any = {};

    Valorclose = {
        observar: false
      };

    constructor(
        public matDialogRef: MatDialogRef<ModalInformacionPlaza>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private router: Router,
      ) { }

    ngOnInit(): void {
        
        if(this.data){
            console.log(this.data);
            this.plaza = {
                codigo_plaza: this.data.plaza.descripcion_regimen_laboral,
                regimen_laboral: this.data.plaza.descripcion_regimen_laboral,
                tipo_plaza: this.data.plaza.descripcion_regimen_laboral,
                cargo: this.data.plaza.descripcion_regimen_laboral,
                jornada_laboral: this.data.plaza.descripcion_regimen_laboral,
                area_curricular: this.data.plaza.descripcion_regimen_laboral,
                especialidad: this.data.plaza.descripcion_regimen_laboral,
                vigencia_inicio: this.data.plaza.descripcion_regimen_laboral,
                vigencia_fin: this.data.plaza.descripcion_regimen_laboral,
                motivo_vacante: this.data.plaza.descripcion_regimen_laboral,
                codigo_modular: this.data.plaza.descripcion_regimen_laboral,
                centro_trabajo: this.data.plaza.descripcion_regimen_laboral,
                instancia: this.data.plaza.descripcion_regimen_laboral,
                sub_instancia: this.data.plaza.descripcion_regimen_laboral,
                modalidad: this.data.plaza.descripcion_regimen_laboral,
                nivel_educativo: this.data.plaza.descripcion_regimen_laboral,
                tipo_ie: this.data.plaza.descripcion_regimen_laboral,
                dependencia: this.data.plaza.descripcion_regimen_laboral,
                modelo_servicio: this.data.plaza.descripcion_regimen_laboral,
                tipo_ruralidad: this.data.plaza.descripcion_regimen_laboral,
                eib: this.data.plaza.descripcion_regimen_laboral,
                forma_atencion: this.data.plaza.descripcion_regimen_laboral,
                lengua_ordinaria: this.data.plaza.descripcion_regimen_laboral,
                frontera: this.data.plaza.descripcion_regimen_laboral,
                vraem: this.data.plaza.descripcion_regimen_laboral
              }
    
          }        
    }
       
    handleCancelar() {
        debugger;
        this.matDialogRef.close(this.Valorclose);
      }
}