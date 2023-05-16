import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SecurityModel } from '../../../../../../../core/model/security/security.model';
import { CalificacionResponse } from '../../../models/contratacion.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../../../../../core/data/data.service';
import { ResultadoOperacionEnum } from '../../../../../../../core/model/types';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { mineduAnimations } from '../../../../../../../../@minedu/animations/animations';

@Component({
    selector: 'minedu-registrar-reclamo',
    templateUrl: './registrar-reclamo.component.html',
    styleUrls: ['./registrar-reclamo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistrarReclamoComponent implements OnInit {
    dialogTitle = 'Registrar reclamo';
    working = false;
    form: FormGroup;
    currentSession: SecurityModel = new SecurityModel();
    idCalificacion: number;
    calificacion: CalificacionResponse;

    constructor(
        public matDialogRef: MatDialogRef<RegistrarReclamoComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder) {
        this.idCalificacion = data.idCalificacion
        this.calificacion = data.calificacion;
        this.currentSession = data.currentSession
    }

    ngOnInit(): void {
        this.buildForm();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            detalleReclamo: [null, Validators.required]
        });
    }

    handleSave = () => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Completar los datos requeridos.', () => { });
            return;
        }

        const request = {
            idCalificacion: this.calificacion.idCalificacion,
            detalleReclamo: this.form.get('detalleReclamo').value,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgConfirm('¿Está seguro de que desea adjudicar la plaza?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().registrarReclamoCalificacion(request).pipe(
                catchError((e) => of(e)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                })
            ).subscribe(response => {
                if (response && response.result) {
                    this.dataService.Message().msgInfo(resultMessage, () => { });
                    this.matDialogRef.close({ grabado: true });
                } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                    this.dataService.Message().msgWarning(response.messages[0], () => { });
                } else {
                    this.dataService.Message().msgError('Ocurrieron algunos problemas al envíar consolizado plaza.', () => { });
                }
            });
        }, (error) => { });
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }
}
