import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazasPublicacionInformacionResponseModel } from '../../models/contratacion.model';

@Component({
  selector: 'minedu-bandeja-incorporacion-plazas',
  templateUrl: './informacion-plaza30493.component.html',
  styleUrls: ['./informacion-plaza30493.component.scss']
})
export class InformacionPlaza30493Component implements OnInit {

 
    plaza: PlazasPublicacionInformacionResponseModel = null;
    dialogTitle = 'Información Completa de Plaza';
    working = false;
    idPlaza: number;
    idEtapaProceso: number;

    constructor(
        public matDialogRef: MatDialogRef<InformacionPlaza30493Component>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.working = true;
        this.idPlaza = this.data.idPlaza;
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.obtenerDatosPlaza();
    }

    obtenerDatosPlaza = () => {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: this.idPlaza
        };

        this.dataService.Contrataciones().getValidacionPublicacionPlazaById(request).pipe(catchError(() => of([])),
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
