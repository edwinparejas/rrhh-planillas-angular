import { Component, OnInit, ViewEncapsulation, Inject } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'minedu-modal-ver-subsanacion',
    templateUrl: './modal-ver-subsanacion.component.html',
    styleUrls: ['./modal-ver-subsanacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalVerSubsanacionComponent implements OnInit {

    form: FormGroup;
    adjudicacion: any;
    dialogRef: any;
    working = true;
    isMobile = false;

    constructor(
        public matDialogRef: MatDialogRef<ModalVerSubsanacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) { }

    ngOnInit(): void {
        this.adjudicacion = this.data;
        this.working = false;
        this.handleResponsive();
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
