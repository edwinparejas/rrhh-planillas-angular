import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: 'minedu-observacion-calificacion-encargatura',
    templateUrl: './observacion-calificacion-encargatura.component.html',
    styleUrls: ['./observacion-calificacion-encargatura.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ObservacionCalificacionEncargaturaComponent implements OnInit {
    idCalificacion: number;
    calificacion: any;
    
    constructor(
        public dialogRef: MatDialogRef<ObservacionCalificacionEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idCalificacion = data.idCalificacion;
    }

    ngOnInit(): void {
        this.loadCalificacion();
    }

    loadCalificacion() {
        this.dataService.Encargatura().getCalificacion(this.idCalificacion).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.calificacion = {
                    idCalificacion: result.idCalificacion,
                    descripcionMotivoObservacion: result.descripcionMotivoObservacion,
                    anotacionesObservacion: result.anotacionesObservacion,
                    conReclamo: result.conReclamo,
                    detalleReclamo: result.detalleReclamo,
                    anotacionesCalificacion: result.anotacionesCalificacion
                }
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}