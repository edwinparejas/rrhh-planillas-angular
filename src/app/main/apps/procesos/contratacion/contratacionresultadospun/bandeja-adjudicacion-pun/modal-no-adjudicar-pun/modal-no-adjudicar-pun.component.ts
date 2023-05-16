import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChild } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { CatalogoItemEnum, MensajesSolicitud } from '../../../_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';

@Component({
    selector: 'minedu-modal-no-adjudicar-pun',
    templateUrl: './modal-no-adjudicar-pun.component.html',
    styleUrls: ['./modal-no-adjudicar-pun.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class ModalNoAdjudicarPUNComponent implements OnInit {

    form: FormGroup;
    adjudicacion: any;
    comboLists = {
        listMotivo: []
    };
    dialogRef: any;
    working = true;
    isMobile = false;
   
    request = {
        idAdjudicacion: null,
        idMotivo: null,
        anotaciones: null,
        usuarioModificacion: null
    };

    private passport: SecurityModel = new SecurityModel();

    constructor(
        public matDialogRef: MatDialogRef<ModalNoAdjudicarPUNComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.adjudicacion = this.data;
        this.passport = this.dataService.Storage().getInformacionUsuario();
        this.buildForm();
        this.iniCombos();
        this.obtenerInformación();
        this.handleResponsive();
    }

    ngAfterViewInit() {
    }

    iniCombos(): void{
        this.loadMotivo(); 
    }

    obtenerInformación = () => {
        let d = {
            idAdjudicacion: this.adjudicacion.idAdjudicacion
        }
        this.dataService.Contrataciones().getObtenerAdjudicacion(d).pipe(catchError(() => of([])),
            finalize(() => {
                this.working = false;
            })
        )
        .subscribe((response: any) => {
            if (response) {
                this.form.get('idMotivo').setValue(response.idMotivoNoAdjudicacion);
                this.form.get('anotaciones').setValue(response.anotacionesNoAdjudicacion);
            }
        });
    }
    
    loadMotivo = () => {
        this.dataService.Contrataciones().getComboCatalogoItem(CatalogoItemEnum.MOTIVO_NO_ADJUDICACION).pipe(
            catchError(() => of([])),
            finalize(() => { })
        ).subscribe((response: any) => {
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
            idAdjudicacion: this.adjudicacion.idAdjudicacion,
            idMotivo: idMotivo,
            anotaciones: anotaciones,
            usuarioModificacion: this.passport.numeroDocumento
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
            this.dataService.Contrataciones().putNoAdjudicar(this.request).pipe(
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

    handleLimpiar(): void {
        this.resetForm();
    }

    resetForm = () => {
        this.form.reset();
    };

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
