import { Component, OnInit, ViewEncapsulation, Inject } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

@Component({
    selector: 'minedu-modal-ver-reclamo',
    templateUrl: './modal-ver-reclamo.component.html',
    styleUrls: ['./modal-ver-reclamo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVerReclamoComponent implements OnInit {

    postulante: any;
    dialogRef: any;
    working = true;
    isMobile = false;

    constructor(
        public matDialogRef: MatDialogRef<ModalVerReclamoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.postulante = this.data;
        this.obtenerInformación();
        this.handleResponsive();
    }

    obtenerInformación = () => {
        let d = {
            idCalificacion: this.data.id_calificacion
        }

        this.dataService.Contrataciones().getObtenerCalificacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.postulante = response;
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
