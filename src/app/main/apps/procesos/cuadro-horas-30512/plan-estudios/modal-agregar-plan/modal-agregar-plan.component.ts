import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { MESSAGE_CUADRO_30512 } from "../../util/messages";

@Component({
    selector: "minedu-modal-agregar-plan",
    templateUrl: "./modal-agregar-plan.component.html",
    styleUrls: ["./modal-agregar-plan.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalAgregarPlanComponent implements OnInit {
    name: string;
    form: FormGroup;
    modal = {
        icon: "",
        title: "",
        action: "",
        disabled: false,
    };
    working = false;
    constructor(
        public matDialogRef: MatDialogRef<ModalAgregarPlanComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) {}

    ngOnInit(): void {
        this.buildForm();
        this.initialize();
    }

    private buildForm = () => {
        const user = this.dataService.Storage().getPassportUserData();
        this.form = this.formBuilder.group({
            idEstadoPlanEstudio: [
                this.data.idEstadoPlanEstudio,
                Validators.required,
            ],
            usuarioRegistro: user.NUMERO_DOCUMENTO,
            nombrePlanEstudio: [null, Validators.required],
            descripcionPlan: [null, Validators.maxLength(500)],
        });
    };
    private initialize = () => {
        this.modal = this.data.modal;
    };

    handleGuardar = () => {
        if (!this.form.valid) {
            this.dataService
                .Message()
                .msgWarning(MESSAGE_CUADRO_30512.M08, () => {});
            return;
        }
        this.registrarPlanPruebas();
    };

    private registrarPlanPruebas = () => {
        const form = this.form.value;

        this.dataService.Message().msgConfirm(
            MESSAGE_CUADRO_30512.M02,
            () => {
                this.dataService.Spinner().show("sp6");
                this.working = true;
                this.dataService
                    .CuadroHoras30512Service()
                    .guardarPlanEstudio(form)
                    .pipe(
                        catchError((error: HttpErrorResponse) => {
                            this.dataService
                                .Message()
                                .msgWarning(error.error.messages[0]);
                            return of(null);
                        }),
                        finalize(() => {
                            this.dataService.Spinner().hide("sp6");
                            this.working = false;
                        })
                    )
                    .subscribe((response) => {
                        if (response && response > 0) {
                            this.dataService
                                .Message()
                                .msgSuccess(MESSAGE_CUADRO_30512.M07, () => {
                                    this.handleCancelar({ reload: true });
                                });
                        }
                    });
            },
            () => {}
        );
    };

    handleCancelar = (data?: any) => {
        this.matDialogRef.close(data);
    };
}
