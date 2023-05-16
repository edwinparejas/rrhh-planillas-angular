import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {mineduAnimations} from '../../../../../../../@minedu/animations/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DataService} from '../../../../../../core/data/data.service';
import {catchError, finalize} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
    selector: 'minedu-motivo-cancelacion-etapa-proceso-encargatura',
    templateUrl: './motivo-cancelacion-etapa-proceso-encargatura.component.html',
    styleUrls: ['./motivo-cancelacion-etapa-proceso-encargatura.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class MotivoCancelacionEtapaProcesoEncargaturaComponent implements OnInit {
    idEtapaProceso: number;
    idDesarrolloProceso: number;

    motivoCancelacion: any;

    constructor(
        public dialogRef: MatDialogRef<MotivoCancelacionEtapaProcesoEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idEtapaProceso = data.idEtapaProceso;
        this.idDesarrolloProceso = data.idDesarrolloProceso;
    }
    ngOnInit(): void {
        this.loadEtapaProceso();
    }

    loadEtapaProceso() {
        const request = {
            idEtapaProceso: this.idEtapaProceso,
            idDesarrolloProceso: this.idDesarrolloProceso
        }
        this.dataService.Encargatura().getEtapaProcesoEncargatura(request).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.motivoCancelacion = result.motivoCancelacion 
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}