import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: 'minedu-detalle-subsanacion-adjudicacion-encargatura',
    templateUrl: './detalle-subsanacion-adjudicacion-encargatura.component.html',
    styleUrls: ['./detalle-subsanacion-adjudicacion-encargatura.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class DetalleSubsanacionAdjudicacionEncargaturaComponent implements OnInit {
    idAdjudicacion: number;
    adjudicacion: any;
    
    constructor(
        public dialogRef: MatDialogRef<DetalleSubsanacionAdjudicacionEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idAdjudicacion = data.idAdjudicacion;
    }

    ngOnInit(): void {
        console.log("idAdjudicacion : " + this.idAdjudicacion);
        this.loadSubsanacionObservacion();
    }

    loadSubsanacionObservacion() {
        const request = {
            idAdjudicacion: this.idAdjudicacion
        }
        this.dataService.Encargatura().buscarSubsanarObsAdjudicacionEncargatura(request).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.adjudicacion = {
                    detalleSubsanacion: result.detalleSubsanacion
                }
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}