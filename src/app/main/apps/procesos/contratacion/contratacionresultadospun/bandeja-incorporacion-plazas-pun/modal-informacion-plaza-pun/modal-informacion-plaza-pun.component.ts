import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-modal-informacion-plaza-pun',
    templateUrl: './modal-informacion-plaza-pun.component.html',
    styleUrls: ['./modal-informacion-plaza-pun.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalInformacionPlazaPUNComponent implements OnInit {

    plaza: PlazasPublicacionInformacionResponseModel = null;
    dialogTitle = 'Información Completa de Plaza';
    working = false;
    idPlaza: number;
    idEtapaProceso: number;
    anio:number;

    constructor(
        public matDialogRef: MatDialogRef<ModalInformacionPlazaPUNComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.idPlaza = this.data.idPlaza;
        this.anio = this.data.anio;
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.obtenerDatosPlaza(this.idPlaza);
    }

    obtenerDatosPlaza = (idPlaza: number) => {
        const request = {
            idPlaza : this.idPlaza,
            anio: this.anio
        };

        this.dataService.Contrataciones().postBuscarPlazaContratacionDirecta(request).pipe(catchError(() => of([])),
                finalize(() => {
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response) {
                    this.plaza = response;
                }
            });
    }

    handleCancel = () => { this.matDialogRef.close(); }

}
