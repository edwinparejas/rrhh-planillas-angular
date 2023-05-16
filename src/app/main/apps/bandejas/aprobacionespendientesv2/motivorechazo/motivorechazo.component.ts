import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { mineduAnimations } from "@minedu/animations/animations";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: "minedu-motivorechazo",
    templateUrl: "./motivorechazo.component.html",
    styleUrls: ["./motivorechazo.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class MotivorechazoComponent implements OnInit {
    form: FormGroup;
    working: boolean = false;
    constructor(
        @Inject(MAT_DIALOG_DATA) private data: any,
        public matDialogRef: MatDialogRef<MotivorechazoComponent>,
        private formBuilder: FormBuilder
    ) {}

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            tipoDocumento: [{ value: this.data.motivoRechazo[0].tipoDocumento, disabled: true }],
            numeroDocumento: [{ value: this.data.motivoRechazo[0].numeroDocumento, disabled: true }],
            primerApellido: [{ value: this.data.motivoRechazo[0].apePaterno, disabled: true }],
            segundoApellido: [{ value: this.data.motivoRechazo[0].apeMaterno, disabled: true }],
            nombres: [{ value: this.data.motivoRechazo[0].nombres, disabled: true }],
            motivoRechazo: [{ value: this.data.motivoRechazo[0].motivo, disabled: true }],
        });
    }

    cancelar() {
        this.matDialogRef.close();
    }
}
