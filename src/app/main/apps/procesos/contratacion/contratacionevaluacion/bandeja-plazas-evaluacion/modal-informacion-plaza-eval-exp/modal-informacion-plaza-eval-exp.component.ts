import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-modal-informacion-plaza-eval-exp',
    templateUrl: './modal-informacion-plaza-eval-exp.component.html',
    styleUrls: ['./modal-informacion-plaza-eval-exp.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalInformacionPlazaEvalExpComponent implements OnInit {

    plaza: any = null;
    dialogTitle = 'Información Completa de Plaza';
    working = false;
    idPlaza: number;
    idEtapaProceso: number;

    constructor(
        public matDialogRef: MatDialogRef<ModalInformacionPlazaEvalExpComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.idPlaza = this.data.idPlaza;
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.obtenerDatosPlaza(this.idPlaza);
    }

    obtenerDatosPlaza = (idPlaza: number) => {
        const request = {
            idPlaza : this.idPlaza
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
