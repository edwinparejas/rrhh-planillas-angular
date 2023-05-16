import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazasPublicacionInformacionResponseModel } from '../../models/contratacion.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: "minedu-informacion-plaza",
    templateUrl: "./informacion-plaza30328.component.html",
    styleUrls: ["./informacion-plaza30328.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionPlaza30328Component implements OnInit {

    plaza: PlazasPublicacionInformacionResponseModel = null;
    dialogTitle = 'Información Completa de la Plaza';
    working = false;
    idPlaza: number;
    idEtapaProceso: number;
    anio: number;
    templateRL: string;

    constructor(
        public matDialogRef: MatDialogRef<InformacionPlaza30328Component>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.working = true;
        this.idPlaza = this.data.idPlaza;
        this.idEtapaProceso = this.data.idEtapaProceso;
        this.anio = this.data.anio;
	this.templateRL = this.generarNombreTemplateDatosPlaza(this.data.idRegimenLaboral);
        this.obtenerDatosPlaza();
    }

    generarNombreTemplateDatosPlaza = (idRegimenLaboral: any):string => {
	let templateRL = 'RL' + (idRegimenLaboral ||'OTRO').toString();
	return templateRL;
    }

    obtenerDatosPlaza = () => {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idPlaza: this.idPlaza,
            anio: this.anio
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
    valorNoEncontrado = (valor:any):string => {
	return (valor||null)==null?'NO REGISTRADO':valor;
    }
}
