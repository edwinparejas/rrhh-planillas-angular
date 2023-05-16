import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize, tap } from "rxjs/operators";


@Component({
  selector: 'minedu-modal-observacion-bandeja',
  templateUrl: './modal-observacion-bandeja.component.html',
  styleUrls: ['./modal-observacion-bandeja.component.scss']
})
export class ModalObservacionBandejaComponent implements OnInit {

    form: FormGroup;
    // adjudicacion: any;

    motivoObservacion: any;
    
    dialogRef: any;
    working = true;
    isMobile = false;

    constructor(
        public matDialogRef: MatDialogRef<ModalObservacionBandejaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private materialDialog: MatDialog,
        private dataService: DataService,
    ) { }

    ngOnInit(): void {

        // this.adjudicacion = this.data;
        this.motivoObservacion = this.data
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
        this.form.get('detalle').setValue(this.motivoObservacion);
        
        /*let d = {
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
        });*/
    }
    
    buildForm(): void {
        this.form = this.formBuilder.group({
            observadoPor: [null],
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
