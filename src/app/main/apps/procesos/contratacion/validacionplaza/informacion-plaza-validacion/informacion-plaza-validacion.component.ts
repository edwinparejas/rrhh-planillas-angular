import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazasPublicacionInformacionResponseModel } from '../../models/contratacion.model';
import { informacionPlaza } from '../../models/informacionPlaza.model';

@Component({
    selector: 'minedu-informacion-plaza-validacion',
    templateUrl: './informacion-plaza-validacion.component.html',
    styleUrls: ['./informacion-plaza-validacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionPlazaValidacionComponent implements OnInit {

    plaza: PlazasPublicacionInformacionResponseModel = null;
    dialogTitle = 'Información Completa de la Plaza';
    working = false;
    idPlaza: number;
    idEtapaProceso: number;
    anio: number;
    informacionPlazaModel:informacionPlaza = new informacionPlaza();

    constructor(
        public matDialogRef: MatDialogRef<InformacionPlazaValidacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.idPlaza = this.data.idPlaza;
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.anio = this.data.anio;
        this.obtenerDatosPlaza();
    }

    obtenerDatosPlaza = () => {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: this.idPlaza,
            anio: this.anio
        };

        this.dataService
            .Contrataciones()
            .getValidacionPublicacionPlazaById(request)
            .pipe(catchError(() => of([])),
                finalize(() => {
                    this.working = false;
                })
            ).subscribe((response: any) => {
                if (response) {
                    this.plaza = response;
                }
            });
    }

    handleCancel = () => { this.matDialogRef.close(); }

}
