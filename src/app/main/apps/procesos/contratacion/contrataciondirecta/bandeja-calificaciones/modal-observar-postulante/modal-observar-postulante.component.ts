import { Component, OnInit, ViewEncapsulation, Inject } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { CatalogoItemEnum, MensajesSolicitud } from '../../../_utils/constants';

@Component({
    selector: 'minedu-modal-observar-postulante',
    templateUrl: './modal-observar-postulante.component.html',
    styleUrls: ['./modal-observar-postulante.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalObservarPostulanteComponent implements OnInit {

    form: FormGroup;
    postulante: any;
    comboLists = {
        listMotivo: []
    };
    dialogRef: any;
    working = true;
    isMobile = false;
   
    request = {
        idCalificacionDetalle: null,
        idMotivo: null,
        anotaciones: null
    };

    constructor(
        public matDialogRef: MatDialogRef<ModalObservarPostulanteComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.postulante = this.data;
        this.buildForm();
        this.iniCombos();
        this.handleResponsive();
    }

    iniCombos(): void{
        this.loadMotivo(); 
    }
    
    loadMotivo = () => {
        this.dataService.Contrataciones().getComboCatalogoItem(CatalogoItemEnum.MOTIVO_NO_CALIFICACION).pipe(
            catchError(() => of([])),
            finalize(() => { 
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {             
                const data = response.map(x => ({
                    ...x,
                    value: x.id,
                    label: `${x.descripcion}`
                }));
                this.comboLists.listMotivo = data;
            }            
        });
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idMotivo: [null, Validators.required],
            anotaciones: [null]
        });
    }

    setRequest(): void {
        const formulario = this.form.getRawValue();
        let idMotivo = formulario.idMotivo ? formulario.idMotivo : null;
        let anotaciones = formulario.anotaciones;
        
        this.request = {
            idCalificacionDetalle: this.postulante.id_calificacion_detalle,
            idMotivo: idMotivo,
            anotaciones: anotaciones
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
        this.dataService.Message().msgConfirm(MensajesSolicitud.M02,
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Contrataciones().putObservarCalificacionPUN(this.request).pipe(
                    catchError(() => of([])),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6");
                    })
                )
                .subscribe((response: any) => {
                    if (response) {
                        this.handleCancelar(response);
                    } else {
                        this.dataService.Message().msgWarning(MensajesSolicitud.ERROR, () => {});
                    }
                });
            }, () => {}
        );
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
