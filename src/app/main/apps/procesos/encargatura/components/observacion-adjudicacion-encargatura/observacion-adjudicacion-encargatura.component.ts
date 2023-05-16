import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: 'minedu-observacion-adjudicacion-encargatura',
    templateUrl: './observacion-adjudicacion-encargatura.component.html',
    styleUrls: ['./observacion-adjudicacion-encargatura.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ObservacionAdjudicacionEncargaturaComponent implements OnInit {
    idAdjudicacion: number;
    adjudicacion: any;
    
    constructor(
        public dialogRef: MatDialogRef<ObservacionAdjudicacionEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idAdjudicacion = this.data.idAdjudicacion;
    }

    ngOnInit(): void {
        this.loadCalificacion();
    }

    loadCalificacion() {
        const request = {
            idAdjudicacion: this.idAdjudicacion
        }
        this.dataService.Encargatura().buscarObsAdjudicacionEncargatura(request).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.adjudicacion = {                    
                    detalleObservacionAccion: result.detalleObservacionAccion
                }
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}