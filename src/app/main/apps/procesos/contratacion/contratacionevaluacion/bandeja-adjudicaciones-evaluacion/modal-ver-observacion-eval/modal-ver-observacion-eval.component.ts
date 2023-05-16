import { Component, OnInit, ViewEncapsulation, Inject, QueryList, ViewChild } from "@angular/core";
import { mineduAnimations } from "@minedu/animations/animations";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from "app/core/data/data.service";
import { of } from "rxjs";
import { catchError, finalize, tap } from "rxjs/operators";
import { CatalogoItemEnum } from '../../../_utils/constants';
import { ResultadoOperacionEnum, MISSING_TOKEN } from 'app/core/model/types';
import { PASSPORT_MESSAGE } from 'app/core/model/messages-error';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';

@Component({
  selector: 'minedu-modal-ver-observacion-eval',
  templateUrl: './modal-ver-observacion-eval.component.html',
  styleUrls: ['./modal-ver-observacion-eval.component.scss']
})
export class ModalVerObservacionEvalComponent implements OnInit {


    form: FormGroup;
    adjudicacion: any;
    dialogRef: any;
    working = true;
    isMobile = false;

    constructor(
        public matDialogRef: MatDialogRef<ModalVerObservacionEvalComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {
        this.adjudicacion = this.data;
        this.buildForm();
        this.iniCombos();
        this.obtenerInformación();
        this.handleResponsive();
    }

    ngAfterViewInit() {
    }

    iniCombos(): void{
        
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
                this.form.get('observadoPor').setValue("Vinculacion");//.setValue(response.observadoPor); // Nombre de usuario
                this.form.get('detalle').setValue(response.detalleObservacionAccion);
            }
        });
    }
    
    buildForm(): void {
        this.form = this.formBuilder.group({
            observadoPor: [null, Validators.required],
            detalle: [null]
        });
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
