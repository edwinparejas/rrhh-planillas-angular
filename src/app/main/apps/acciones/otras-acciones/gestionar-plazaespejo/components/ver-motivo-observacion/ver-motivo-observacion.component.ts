import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'minedu-ver-motivo-observacion',
    templateUrl: './ver-motivo-observacion.component.html',
    styleUrls: ['./ver-motivo-observacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class VerMotivoObservacionComponent implements OnInit {

    actividad: any;

    constructor(
        public matDialogRef: MatDialogRef<VerMotivoObservacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any) { }

    ngOnInit(): void {
        this.actividad = this.data?.actividad ?? null;
    }

    handleCancelar() {
        this.matDialogRef.close();
    }

}
