import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { mineduAnimations } from "@minedu/animations/animations";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { FormType } from "../../util/enum";
import { MESSAGE_CUADRO_30512 } from "../../util/messages";

@Component({
    selector: "minedu-modal-cancelar-vigencia-plan",
    templateUrl: "./modal-cancelar-vigencia-plan.component.html",
    styleUrls: ["./modal-cancelar-vigencia-plan.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalCancelarVigenciaPlanComponent implements OnInit {
    name: string;
    form: FormGroup;
    modal = {
        icon: "",
        title: "",
        action: FormType.REGISTRAR,
        disabled: false,
    };
    working = false;
    formTypeRegistrar = FormType.REGISTRAR;
    formTypeConsultar = FormType.CONSULTAR;
    constructor(
        public matDialogRef: MatDialogRef<ModalCancelarVigenciaPlanComponent>,
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
            idPlanEstudio: [this.data.idPlanEstudio, Validators.required],
            idEstadoPlanEstudio: [this.data.idEstadoPlanEstudio, Validators.required],
            usuarioRegistro: user.NUMERO_DOCUMENTO,
            motivoNoVigencia: [
                null,
                [Validators.required, Validators.maxLength(500)],
            ],
        });
    };

    private initialize = () => {
        this.modal = this.data.modal;
        if (this.modal.action == FormType.CONSULTAR) {
            this.form.patchValue({
                motivoNoVigencia: this.data.motivoNoVigencia,
            });
        }
    };

    handleGuardar = () => {
        if (!this.form.valid) {
            this.dataService
                .Message()
                .msgWarning(MESSAGE_CUADRO_30512.M08, () => {});
            return;
        }
        this.cancelarVigenciaPlanPruebas();
    };

    private cancelarVigenciaPlanPruebas = () => {
        const form = this.form.value;

        this.dataService.Message().msgConfirm(
            MESSAGE_CUADRO_30512.M05,
            () => {
                this.dataService.Spinner().show("sp6");
                this.working = true;
                this.dataService
                    .CuadroHoras30512Service()
                    .cancelarVigenciaPlanEstudio(form)
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
