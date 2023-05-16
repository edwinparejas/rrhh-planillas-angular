import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { EstadoActividadEnum } from '../../types/Enums';

@Component({
    selector: 'minedu-modal-observacion',
    templateUrl: './modal-observacion.component.html',
    styleUrls: ['./modal-observacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ModalObservacionComponent implements OnInit {
    form: FormGroup;
    constructor(
        public matDialogRef: MatDialogRef<ModalObservacionComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            idEstado: [-1],
            motivoObservacion: [null, Validators.required]
        });

        this.form.controls["idEstado"].disable();
    }

    private get currentSession() {
        return this.dataService.Storage().getInformacionUsuario();
    }

    handleGuardarObservacion = () => {
        // var dataFrom = this.form.getRawValue();
        if (!this.form.valid) {
            this.form.get('motivoObservacion').setErrors({ required: true })
            this.form.get('motivoObservacion').markAsTouched();
            this.dataService.Message().msgWarning('"VERIFICAR SI ALGÚN DATO OBLIGATORIO NO HA SIDO INGRESADO."', () => { });
            return false;
        }
        this.dataService
            .Message()
            .msgConfirm('¿ESTÁ SEGURO QUE DESEA GUARDAR LA OBSERVACIÓN?',
                async () => {
                    const nombreCompleto = this.currentSession?.nombreCompleto;
                    const nombreUsuario = this.currentSession?.nombreUsuario;

                    let dataForm = this.form.getRawValue();
                    let request = {
                        ...dataForm,
                        idEstadoActividad: EstadoActividadEnum.RECHAZADO,
                        idActividad: this.data.idActividad,
                        nombreCompleto,
                        nombreUsuario
                    };
                    const response = await this.dataService.AccionesPlazaEspejo()
                        .observarActividad(request)
                        .pipe(
                            catchError(() => {
                                this.dataService.Message().msgWarning('"OCURRIÓ UN ERROR AL TRATAR DE REGISTRAR LA ACCIÓN."',
                                    () => { });
                                return of(null);
                            }),
                            finalize(() => { })
                        ).toPromise();

                    if (response > 0) {
                        this.dataService
                            .Message()
                            .msgAutoCloseSuccessNoButton('"SE REGISTRO CORRECTAMENTE."'
                                , 3000
                                , () => {
                                    this.matDialogRef.close({ desdeAtencion: this.data?.desdeAtencion, refrescar: true });
                                    return;
                                });
                    }
                });
    }

    handleCancelar() {
        this.matDialogRef.close();
    }
}
