import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { iteratee } from 'lodash';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlazaResponseModel } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-informacion-plaza',
    templateUrl: './informacion-plaza.component.html',
    styleUrls: ['./informacion-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionPlazaComponent implements OnInit {
    plaza: PlazaResponseModel = null;
    dialogTitle = 'Información completa de plaza';
    working = false;
    idPlaza: 0;
    constructor(
        public matDialogRef: MatDialogRef<InformacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.idPlaza = this.data.idPlaza;
        this.obtenerDatosPlaza(this.idPlaza);

    }


    obtenerDatosPlaza = (idPlaza: number) => {
        this.dataService
            .Contrataciones()
            .getPlazaById(idPlaza)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.working = false;
                })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.plaza = response.data;
                }
            });
    }

    handleCancel = () => { this.matDialogRef.close(); }

}
