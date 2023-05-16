import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChild } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { MensajesSolicitud } from "../../../_utils/constants";

@Component({
    selector: 'minedu-modal-registrar-reclamo',
    templateUrl: './modal-registrar-reclamo.component.html',
    styleUrls: ['./modal-registrar-reclamo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalRegistrarReclamoComponent implements OnInit {

    form: FormGroup;
    postulante: any;
    dialogRef: any;
    working = true;
    isMobile = false;
   
    request = {
        idCalificacionDetalle: null,
        idCalificacion: null,
        reclamo: null,
        idFlujoEstado: null
    };

    constructor(
        public matDialogRef: MatDialogRef<ModalRegistrarReclamoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.postulante = this.data;
        this.working = false;
        this.buildForm();
        this.handleResponsive();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            reclamo: [null, Validators.required]
        });
    }

    setRequest(): void {
        const formulario = this.form.getRawValue();
        let reclamo = formulario.reclamo;
        
        this.request = {
            idCalificacionDetalle: this.postulante.id_calificacion_detalle,
	    idCalificacion: this.postulante.id_calificacion,
            reclamo: reclamo,
            idFlujoEstado: this.postulante.idFlujoEstado
        };
    }

    handleGuardar() {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning(MensajesSolicitud.M08, () => { });

            Object.keys(this.form.controls).forEach(field => {
                const control = this.form.get(field);
                control.markAsTouched({ onlySelf: true });
            });
            return;
        }

        this.setRequest();
        this.dataService.Message().msgConfirm(MensajesSolicitud.M02, () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().putReclamoPUN(this.request).pipe(
                catchError(() => of([])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response) {
                        this.handleCancelar(response);
                    } else {
                        this.dataService.Message().msgWarning(MensajesSolicitud.ERROR, () => {});
                    }
                });
        }, () => {});
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
