import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazasPublicacionInformacionResponseModel } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-modal-informacion-plaza',
    templateUrl: './modal-informacion-plaza.component.html',
    styleUrls: ['./modal-informacion-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalInformacionPlazaComponent implements OnInit {

    plaza: PlazasPublicacionInformacionResponseModel = null;
    dialogTitle = 'Información Completa de la Plaza';
    working = false;
    idPlaza: number;
    anio: number;

    constructor(
        public matDialogRef: MatDialogRef<ModalInformacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.idPlaza = this.data.idPlaza;
        this.anio = this.data.anio;
        this.obtenerDatosPlaza();
    }

    obtenerDatosPlaza = () => {
        const request = {
            idPlaza : this.idPlaza,
            anio:this.anio
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
    valorNoEncontrado = (valor:any):string => {
	return (valor||null)==null?'NO REGISTRADO':valor;
    }
}
