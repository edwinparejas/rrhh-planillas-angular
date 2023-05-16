import { Component, OnInit, ViewEncapsulation, Inject, ViewChild } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { ActivoFlagEnum } from '../../../_utils/constants';

@Component({
    selector: 'minedu-modal-sancion-postulante',
    templateUrl: './modal-sancion-postulante.component.html',
    styleUrls: ['./modal-sancion-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalSancionPostulanteComponent implements OnInit {

    form: FormGroup;
    working = false;
    isMobile = false;
    nowDate = new Date();
    datos: any = {};

    modal = {
        title: "",
        action: "",
        postulante: {}
    }

    dialogRef: any;
    dataSourceSancionesAdministrativas: any[] = [];

    displayedColumnsSanciones: string[] = [
        "registro",
        "tipo_sancion",
        "resolucion",
        "fecha_inicio",
        "fecha_fin",
        "dias",
        "estado"
    ];

    constructor(
      public matDialogRef: MatDialogRef<ModalSancionPostulanteComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.initialize();
    }
    
    initialize() {
        this.modal = this.data;
        this.datos = this.modal.postulante;
        this.dataSourceSancionesAdministrativas = this.datos.sancionesAdministrativas;
    }

    handleCancelar(data?: any) {
        data = ActivoFlagEnum.INACTIVO;
        this.matDialogRef.close(data);
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

}
