import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { accionPersonalRegistro } from '../../_utils/constants';

@Component({
    selector: 'minedu-observacion-desaprobar-desplazamiento',
    templateUrl: './observacion-desaprobar-desplazamiento.component.html',
    styleUrls: ['./observacion-desaprobar-desplazamiento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class ObservacionDesaprobarDesplazamientoComponent implements OnInit {
    form: FormGroup;
    working: boolean = false;
    aprobarAccionPersonalRequest: any;

    constructor(
        public matDialogRef: MatDialogRef<ObservacionDesaprobarDesplazamientoComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService
    ) { }

    ngOnInit(): void {
        this.working = true;
        this.buildForm();
        console.log(this.data)
    }

    get currentSession() {
        return this.dataService.Storage().getInformacionUsuario();
    }

    buildForm() {
        this.form = this.formBuilder.group({
            observacion: [null, Validators.required]
        });

    }
    handleGuardar() {
        if (this.form.value.observacion) {
            const codigoSede = this.currentSession.codigoSede;
            const codigoRol = this.currentSession.codigoRol;

            this.aprobarAccionPersonalRequest = {
                codigoSede,
                codigoRol,
                idAccionPersonal: this.data.idAccionPersonal,
                aprobado: false,
                detalleObservacion: this.form.value.observacion
            }
            this.actualizarEstado(false);
        }
        else {
            this.dataService.Message().msgWarning('PARA GUARDAR SE NECESITA UNA OBSERVACION.', () => {
            });
            return;
        }
    }

    private actualizarEstado(aprobado = true) {

        const aprobadoStr = aprobado ? 'APROBAR' : 'DESAPROBAR';

        this.dataService.Message().msgConfirm(`¿ESTÁ SEGURO DE QUE DESEA ${aprobadoStr} LA INFORMACIÓN?`, async () => {
            this.dataService.Spinner().show("sp6");
            let isSuccess = true;
            await this.dataService.AccionesPersonal().aprobarAccionPersonal(this.aprobarAccionPersonalRequest)
                .pipe(
                    catchError((e) => {
                        this.dataService.Message().msgWarning('Error, no se pudo registrar la observación.', () => { });
                        isSuccess = false;
                        return of(e);
                    }),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6")
                    })
                ).toPromise();

            if (isSuccess) {
                this.dataService.Message().msgSuccess('Operación realizada de forma exitosa.', () => {
                    this.handleCancelar({ isSuccess });
                });
            }
        }, () => { });

    }


    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
    }
}
