import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ResultadoOperacionEnum, TablaPermisos } from 'app/core/model/types';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CalificacionResponse } from '../../../models/contratacion.model';

@Component({
    selector: 'minedu-registrar-motivo',
    templateUrl: './registrar-motivo.component.html',
    styleUrls: ['./registrar-motivo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistrarMotivoComponent implements OnInit {
    dialogTitle = 'Registrar motivo de no adjudicación';
    working = false;
    form: FormGroup;
    currentSession: SecurityModel = new SecurityModel();
    idAdjudicacion: number;
    calificacion: CalificacionResponse;

    comboLists = {
        listMotivo: []
    }
    constructor(
        public matDialogRef: MatDialogRef<RegistrarMotivoComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
    ) {
        this.idAdjudicacion = data.idAdjudicacion
        this.calificacion = data.calificacion;
        this.currentSession = data.currentSession
    }

    ngOnInit(): void {
        this.buildForm();
        this.loadMotivo();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            observacionNoAdjudicacion: [null],
            idMotivoNoAdjudicacion: [null, Validators.required]
        });
    }

    loadMotivo = () => {
        this.dataService.Contrataciones()
            .getMotivoNoAdjudicacion()
            .pipe(
                catchError(() => of([])),
                finalize(() => { })
            )
            .subscribe((response: any) => {
                if (response && response.result) {
                    const data = response.data.map((x) => ({
                        ...x,
                        value: x.idCatalogoItem,
                        label: `${x.descripcionCatalogoItem}`,
                    }));
                    this.comboLists.listMotivo = data;
                }
            });
    }

    handleSave = () => {
        if (!this.form.valid) {
            this.dataService.Message().msgWarning('Completar los datos requeridos.', () => { });
            return;
        }

        const request = {
            idCalificacion: this.calificacion.idCalificacion,
            idMotivoNoAdjudicacion: this.form.get('idMotivoNoAdjudicacion').value,
            observacionNoAdjudicacion: this.form.get('observacionNoAdjudicacion').value,
            usuarioRegistro: this.currentSession.numeroDocumento
        };

        const resultMessage = 'Operación realizada de forma exitosa.';
        this.dataService.Message().msgConfirm('¿Está seguro de que desea guardar los cambios?', () => {
            this.dataService.Spinner().show("sp6");
            this.dataService.Contrataciones().noAdjudicarPlaza(request).pipe(
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
