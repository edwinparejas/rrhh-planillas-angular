import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { TablaPermisos } from 'app/core/model/types';

@Component({
    selector: 'minedu-detalle-observacion',
    templateUrl: './detalle-observacion.component.html',
    styleUrls: ['./detalle-observacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class DetalleObservacionComponent implements OnInit {

    dialogTitle = 'Detalle de observaciones';
    working = false;
    permisos = {
        autorizadoAgregar: false,
        autorizadoModificar: false,
        autorizadoEliminar: false,
        autorizadoEnviar: false,
        autorizadoExportar: false
    };
    currentSession: SecurityModel = new SecurityModel();
    idResumenPlaza: number;
    adjudicacion: any;
    comboLists = {
        listMotivo: []
    }
    constructor(
        public matDialogRef: MatDialogRef<DetalleObservacionComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
    ) {
        this.idResumenPlaza = data.idResumenPlaza
        this.adjudicacion= data.AdjuncacionRow;
    }

    ngOnInit(): void {
       // this.buildForm();
        this.buildSeguridad();
    }
    buildSeguridad = () => {
        this.permisos.autorizadoAgregar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Agregar);
        this.permisos.autorizadoModificar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Modificar);
        this.permisos.autorizadoEliminar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        // this.permisos.autorizadoEnviar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoExportar = this.dataService.Storage().tienePermisoAccion(TablaPermisos.Eliminar);
        this.permisos.autorizadoEnviar = true;
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }



/*     buildForm(): void {
        this.form = this.formBuilder.group({
            observaciones: [null],
            idMotivo: [null, Validators.required]
        });
    } */

    handleCancel = () => {
        this.matDialogRef.close();
    }
}
