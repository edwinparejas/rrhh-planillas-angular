import { Component, OnInit, ViewEncapsulation, Inject } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";

@Component({
    selector: 'minedu-modal-ver-observacion',
    templateUrl: './modal-ver-observacion.component.html',
    styleUrls: ['./modal-ver-observacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVerObservacionAdjudicacionComponent implements OnInit {

    form: FormGroup;
    adjudicacion: any;
    request: any;
    dialogRef: any;
    working = true;
    isMobile = false;

    constructor(
        public matDialogRef: MatDialogRef<ModalVerObservacionAdjudicacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.request = this.data;
        this.obtenerInformación();
        this.handleResponsive();
    }

    obtenerInformación = () => {
        let d = {
            idAdjudicacion: this.request.id_adjudicacion
        }
        this.dataService.Contrataciones().getObtenerAdjudicacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.adjudicacion = response;
            }
        });
    }

    handleCancelar(data?: any) {
        if (data) {
            this.matDialogRef.close({ data: data });
        } else {
            this.matDialogRef.close();
        }        
    }

    handleResponsive(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };
    }

    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

}
