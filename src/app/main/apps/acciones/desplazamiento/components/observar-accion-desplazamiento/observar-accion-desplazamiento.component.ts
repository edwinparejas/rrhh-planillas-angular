import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { accionPersonalRegistro, EstadoDesplazamientoEnum } from '../../_utils/constants';

@Component({
    selector: 'minedu-observar-accion-desplazamiento',
    templateUrl: './observar-accion-desplazamiento.component.html',
    styleUrls: ['./observar-accion-desplazamiento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ObservarAccionDesplazamientoComponent implements OnInit {
    form: FormGroup;
    working: boolean = false;

    constructor(
        public matDialogRef: MatDialogRef<ObservarAccionDesplazamientoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.buildForm();
        if (this.data) {

        }
    }

    buildForm() {
        this.form = this.formBuilder.group({
            observacion: [null, Validators.required]
        });

    }
    handleGuardar() {
        // debugger;
        if (this.form.value.observacion) {
            this.data.info.detalleObservacionAdjudicacion = this.form.value.observacion;
            this.data.info.estado = EstadoDesplazamientoEnum.OBSERVADO;
            this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar la observación.?'.toUpperCase(), () => {
                this.dataService.Spinner().show("sp6");
                this.working = true;

                const data = this.data.info;
                this.dataService.AccionesPersonal()
                    .registrarAccionPersonal(data)
                    .pipe(
                        catchError(({error}) => {
                            this.dataService.Message().msgWarning('"' + error.messages[0].toUpperCase() + '"');
                            return of(null);
                        }),
                        finalize(() => { this.dataService.Spinner().hide("sp6"); this.working = false; })
                    )
                    .subscribe(response => {
                        if (response) {
                            this.dataService.Message().msgSuccess('Se genero el registro con la observación de forma exitosa.', () => { this.handleCancelar({ reload: true }); });
                        } else if (response && (response.statusCode === 422 || response.statusCode === 404)) {
                            this.dataService.Message().msgWarning('Error, no se pudo crear el registro con la observación.', () => { });
                        }
                    });
            }, () => { });
        }
        else {
            this.dataService.Message().msgWarning('PARA GUARDAR SE NECESITA UNA OBSERVACION.', () => {
            });
            return;
        }
    }

    handleCancelar(data?: any) {
        this.matDialogRef.close(data);

    }
}
