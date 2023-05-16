import { Component, OnInit, ViewEncapsulation, Inject } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { MensajesSolicitud } from "../../../_utils/constants";

@Component({
    selector: 'minedu-modal-subsanar-observacion',
    templateUrl: './modal-subsanar-observacion.component.html',
    styleUrls: ['./modal-subsanar-observacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalSubsanarObservacionComponent implements OnInit {

    form: FormGroup;
    adjudicacion: any;
    comboLists = {
        listEstado: []
    };
    dialogRef: any;
    working = true;
    isMobile = false;
   
    request = {
        idAdjudicacion: null,
        idEstado: null,
        detalleSubsanacion: null,
        usuarioModificacion: null
    };

    constructor(
        public matDialogRef: MatDialogRef<ModalSubsanarObservacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.adjudicacion = this.data;
        this.buildForm();
        this.iniCombos();
        this.obtenerInformación();
        this.handleResponsive();
    }

    iniCombos(): void{
        this.loadMotivo(); 
    }
    
    obtenerInformación = () => {
        let d = {
            idAdjudicacion: this.adjudicacion.id_adjudicacion
        }
        this.dataService.Contrataciones().getObtenerAdjudicacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.form.get('anotaciones').setValue(response.detalleSubsanacion);
            }
        });
    }

    loadMotivo = () => {
        let d = {};
        this.dataService.Contrataciones().getEstadoAdjudicacion(d).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
            if (response) {             
                const data = response.map(x => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcion}`
                }));
                this.comboLists.listEstado = data;
            }
            this.working = false;
        });
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idEstado: [null, Validators.required],
            anotaciones: [null, Validators.required]
        });
    }

    setRequest(): void {
        const formulario = this.form.getRawValue();

        let idEstado = formulario.idEstado ? formulario.idEstado : null;
        let anotaciones = formulario.anotaciones;
       
        this.request = {
            idAdjudicacion: this.adjudicacion.id_adjudicacion,
            idEstado: idEstado,
            detalleSubsanacion: anotaciones,
            usuarioModificacion: "ADMIN"
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
            this.dataService.Contrataciones().putSubsanarObservacion(this.request).pipe(
                catchError((e) => of([e])),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                }))
                .subscribe((response: any) => {
                    if (response > -1) {
                        this.dataService.Message().msgSuccess(MensajesSolicitud.M07, () => {});
                        this.handleCancelar(response);
                    } else {
                        let r = response[0];
                        if (r.status == ResultadoOperacionEnum.InternalServerError) {
                            this.dataService.Message().msgWarning(r.error.developerMessage, () => { });
                        } else if (r.status == ResultadoOperacionEnum.NotFound) {
                            this.dataService.Message().msgWarning(r.message, () => { });
                        } else if (r.status == 401 || r.error == MISSING_TOKEN.INVALID_TOKEN) {
                            this.dataService.Message().msgInfo(PASSPORT_MESSAGE.SESION_END, () => { this.dataService.Storage().passportUILogin(); });
                        } else {
                            this.dataService.Message().msgError(MensajesSolicitud.ERROR, () => { });
                        }
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
