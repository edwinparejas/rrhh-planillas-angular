import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'minedu-informacion-accion-personal-popup',
    templateUrl: './informacion-accion-personal-popup.component.html',
    styleUrls: ['./informacion-accion-personal-popup.component.scss']
})
export class InformacionAccionPersonalPopupComponent implements OnInit {

    accionPersonal: any;
    esEliminar: boolean;

    constructor(
        public matDialogRef: MatDialogRef<InformacionAccionPersonalPopupComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dataService: DataService) { }

    ngAfterViewInit(): void { }

    ngOnDestroy(): void { }

    ngOnInit(): void {
        this.accionPersonal = this.data.accionPersonalData;
        this.esEliminar = this.data.esEliminar;
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }

    handleEliminar = () => {
        const data = { idAccionPersonal: this.accionPersonal?.datosAccion?.idAccionPersonal };

        this.dataService.Message().msgConfirm('¿ESTA SEGURO QUE DESEA ELIMINAR ESTE REGISTRO?', () => {
            this.dataService.Spinner().show("sp6");
            const _response = this.dataService.AccionesPersonal().eliminarAccionPersonal(data).pipe(
                catchError((e) => { return of(null); }),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6")
                })
            ).toPromise();

            _response.then(response => {
                if (response == 0) {
                    this.dataService.Message().msgAutoCloseSuccessNoButton('OPERACIÓN REALIZADA DE FORMA EXITOSA.', 3000, () => {
                        this.handleCancelar({ isSuccess: true });
                    });
                }
            });
        }, () => {
            return;
        });

    }
    handleCancelar(data?: any) {
        this.matDialogRef.close(data);
    }
}
