import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { SecurityModel } from 'app/core/model/security/security.model';
import { ResultadoOperacionEnum } from 'app/core/model/types';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EstadoValidacionPlazaEnum, MENSAJES } from '../../../_utils/constants';

@Component({
    selector: 'minedu-registrar-rechazo',
    templateUrl: './registrar-rechazo.component.html',
    styleUrls: ['./registrar-rechazo.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
})
export class RegistrarRechazoComponent implements OnInit {
    dialogTitle = 'Rechazar solicitud de aprobación';
    working = false;
    form: FormGroup;
    request: any = {};
    currentSession: SecurityModel = new SecurityModel();
    fecha = new Date();

    constructor(public matDialogRef: MatDialogRef<RegistrarRechazoComponent>,
                private dataService: DataService,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private formBuilder: FormBuilder) {
        this.request = data.request
    }

    ngOnInit(): void {
        this.buildForm();
        this.currentSession = this.dataService.Storage().getInformacionUsuario();
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    buildForm(): void {
        this.form = this.formBuilder.group({
            observaciones: [null, Validators.required]
        });
    }

    handleRechazarPlazas = () => {
        const detalle = this.form.get('observaciones').value;
        this.request.estadoAprobacion = EstadoValidacionPlazaEnum.RECHAZADO;
        this.request.detalleRechazo = detalle;

        if (detalle === '' || detalle === null) {
            this.dataService.Message().msgError('"INGRESE UNA DESCRIPCIÓN DEL MOTIVO DE RECHAZO DE LAS PLAZAS."', () => { });
            return;
        }

        this.dataService.Message().msgConfirm('¿ESTÁ SEGURO QUE DESEA RECHAZAR EL LISTADO DE LAS PLAZAS?', 
            () => {
                this.dataService.Spinner().show("sp6");
                this.dataService.Reasignaciones().rechazarConsolidadoPlazas(this.request).pipe(
                    catchError((e) => of(e)),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6")
                    })
                )
                .subscribe(response => {
                    if (response) {
                        this.dataService.Message().msgAutoCloseSuccessNoButton(MENSAJES.MENSAJE_EXITO, MENSAJES.DURACION, () => {});               
                        this.matDialogRef.close({ grabado: true });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.NotFound) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else if (response && response.statusCode === ResultadoOperacionEnum.UnprocessableEntity) {
                        this.dataService.Message().msgWarning(response.messages[0], () => { });
                    } else {
                        this.dataService.Message().msgError('"OCURRIERON PROBLEMAS AL TRATAR DE RECHAZAR EL LISTADO DE PLAZAS."', () => { });
                    }
                });
            }, (error) => { }
        );
    }
}
