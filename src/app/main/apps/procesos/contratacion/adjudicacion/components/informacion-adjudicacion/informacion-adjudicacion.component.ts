import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CustomAdjudicacionResponse } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-informacion-adjudicacion',
    templateUrl: './informacion-adjudicacion.component.html',
    styleUrls: ['./informacion-adjudicacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class InformacionAdjudicacionComponent implements OnInit {
    dialogTitle = 'Información de adjudicación'
    working = false
    adjudicaciones: CustomAdjudicacionResponse
    idAdjudicacion: number



    constructor(
        public matDialogRef: MatDialogRef<InformacionAdjudicacionComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) { }

    ngOnInit(): void {
        this.idAdjudicacion = this.data.idAdjudicacion;
        this.loadCalificacion()
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    loadCalificacion = () => {
        this.dataService.Contrataciones()
            .getAdjudicacionCustom(this.idAdjudicacion)
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    this.adjudicaciones = response.data;
                    //     this.obtenerEtapa(this.calificacion.idEtapa)
                }
            });
    }

}
