import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: 'minedu-motivo-rechazo-consolidado-plaza-encargatura',
    templateUrl: './motivo-rechazo-consolidado-plaza-encargatura.component.html',
    styleUrls: ['./motivo-rechazo-consolidado-plaza-encargatura.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class MotivoRechazoConsolidadoPlazaEncargaturaComponent implements OnInit {
    idPlazaEncargatura: number;

    detalleMotivoRechazo: any;

    constructor(
        public dialogRef: MatDialogRef<MotivoRechazoConsolidadoPlazaEncargaturaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService
    ) {
        this.idPlazaEncargatura = data.idPlazaEncargatura;
    }

    ngOnInit(): void {
        this.loadMotivoRechazoPlazaEncargatura();
    }

    loadMotivoRechazoPlazaEncargatura() {
        const request = {
            idPlazaEncargatura: this.idPlazaEncargatura
        }
        this.dataService.Encargatura().getMotivoRechazoPlazaEncargatura(request).pipe(catchError(() => of([])), finalize(() => {})).subscribe((result: any) => {
            if (result) {
                this.detalleMotivoRechazo = result.detalleMotivoRechazo 
            }
        });
    }

    handleCancel() {
        this.dialogRef.close();
    }
}