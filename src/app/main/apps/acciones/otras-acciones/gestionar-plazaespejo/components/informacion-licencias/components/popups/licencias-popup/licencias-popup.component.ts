import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EstadoActividadEnum } from '../../../../../types/Enums';
import { ModalObservacionComponent } from '../../../../modal-observacion/modal-observacion.component';

@Component({
    selector: 'minedu-licencias-popup',
    templateUrl: './licencias-popup.component.html',
    styleUrls: ['./licencias-popup.component.scss']
})
export class LicenciasPopupComponent implements OnInit {

    actividadResolucion: any;
    licencia: any;
    form: FormGroup;

    dialogRef: any;
    esVer = false;

    constructor(public matDialogRef: MatDialogRef<LicenciasPopupComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private fb: FormBuilder,
        private dataService: DataService,
        private materialDialog: MatDialog
    ) { }

    ngOnInit(): void {
        this.actividadResolucion = this.data?.actividadResolucion ?? null;
        this.licencia = this.data?.datoRegistro ?? null;
        this.esVer = this.data?.esVer;
        this.createForm();
    }

    private get currentSession() {
        return this.dataService.Storage().getInformacionUsuario();
    }

    private mapearRequest = (dataFrom: any) => {
        const nombreCompleto = this.currentSession?.nombreCompleto;
        const nombreUsuario = this.currentSession?.nombreUsuario;

        let request = {
            nombreCompleto,
            nombreUsuario,
            idTipoCargo: dataFrom.idTipoCargo,
            idCargoNuevo: dataFrom.idCargo,
            idJornadaNueva: dataFrom.idJornadaLaboral,
            idActividadResolucion: this.data?.idActividadResolucion,
            idActividad: this.data?.idActividad,
            idEstadoActividad: EstadoActividadEnum.ATENDIDO,
            codigoTipoPlaza: this.actividadResolucion?.codigoTipoPlazaOrigen,
            codigoPlaza: this.actividadResolucion?.codigoPlazaOrigen,
            itemPlaza: this.actividadResolucion?.idItemPlazaOrigen,
            fechaInicio: this.actividadResolucion?.fechaInicio,
            fechaFin: this.actividadResolucion?.fechaFin
        };
        return request;
    }


    private createForm() {
        this.form = this.fb.group({
            idTipoCargo: [null, [Validators.required]],
            idCargo: [null, [Validators.required]],
            idJornadaLaboral: [null],
            limpiar: [null]
        });
    }

    handleGenerar() {
        this.dataService
            .Message()
            .msgConfirm('¿ESTÁ SEGURO QUE DESEA GENERAR LA ACTIVIDAD?',
                async () => {
                    const request = this.mapearRequest(this.form.value);
                    const response = await this.dataService.AccionesPlazaEspejo()
                        .registrarActividad(request)
                        .pipe(
                            catchError(() => of(null)),
                            finalize(() => { })
                        ).toPromise();

                    if (response > 0) {
                        this.dataService
                            .Message()
                            .msgAutoCloseSuccessNoButton('"SE REGISTRO CORRECTAMENTE LA ACCIÓN."'
                                , 3000
                                , () => { this.matDialogRef.close({ refrescar: true }); });
                    } else {
                        this.dataService
                            .Message()
                            .msgWarning('"OCURRIÓ UN ERROR AL TRATAR DE REGISTRAR LA ACCIÓN."',
                                () => { });
                    }
                });


    }

    handleObservar() {

        this.dialogRef = this.materialDialog.open(ModalObservacionComponent, {
            panelClass: "minedu-modal-observacion",
            width: "600px",
            disableClose: true,
            data: {
                idActividad: this.data?.idActividad,
                desdeAtencion: true
            },
        });

        this.dialogRef
            .afterClosed()
            .subscribe((resp) => {
                if (resp.desdeAtencion) {
                    this.matDialogRef.close({ refrescar: true });
                }
            });
    }

    handleLimpiar() {
        this.form.patchValue({
            idTipoCargo: null,
            idCargo: null,
            idJornadaLaboral: null,
            limpiar: true
        })
    }

}
