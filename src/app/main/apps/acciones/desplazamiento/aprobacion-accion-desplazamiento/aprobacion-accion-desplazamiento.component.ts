import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { catchError, finalize } from 'rxjs/operators';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ObservacionDesaprobarDesplazamientoComponent } from '../components/observacion-desaprobar-desplazamiento/observacion-desaprobar-desplazamiento.component';
import { EstadoDesplazamientoEnum } from '../_utils/constants';


@Component({
    selector: 'minedu-aprobacion-accion-desplazamiento',
    templateUrl: './aprobacion-accion-desplazamiento.component.html',
    styleUrls: ['./aprobacion-accion-desplazamiento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class AprobacionAccionDesplazamientoComponent implements OnInit /*, OnDestroy, AfterViewInit*/ {
    verInformacion: boolean = false;
    form: FormGroup;
    idAccionPersonal: number;
    accionPersonal: any;

    aprobarAccionPersonalRequest: any;
    PENDIENTE_AUTORIZACION = EstadoDesplazamientoEnum.PENDIENTE_AUTORIZACION;

    constructor(
        private activeRoute: ActivatedRoute,
        private dataService: DataService,
        private router: Router,
        private materialDialog: MatDialog
    ) { }

    ngAfterViewInit(): void { }
    ngOnDestroy(): void { }

    ngOnInit(): void {
        this.idAccionPersonal = this.activeRoute.snapshot.params.id;
        this.detalleAccionPersonal(this.idAccionPersonal);
        this.verInformacion = null;
    }

    get currentSession() {
        return this.dataService.Storage().getInformacionUsuario();
    }

    private detalleAccionPersonal = async (idAccionPersonal: number) => {
        if (!idAccionPersonal) return;

        this.dataService.Spinner().show("sp6");
        const response = await this.dataService.AccionesPersonal()
            .getInformacionPersonalAccion(idAccionPersonal)
            .pipe(
                catchError(() => of(null)),
                finalize(() => {
                    this.dataService.Spinner().hide("sp6");
                })
            ).toPromise();

        if (!response) return;
        this.accionPersonal = response;
    }



    private actualizarEstado(aprobado = true) {
        const aprobadoStr = aprobado ? 'APROBAR' : 'DESAPROBAR';
        this.dataService.Message().msgConfirm(`¿ESTÁ SEGURO DE QUE DESEA ${aprobadoStr} LA INFORMACIÓN?`, () => {
            this.dataService.Spinner().show("sp6");
            let isSuccess = true;
            const _response = this.dataService.AccionesPersonal().aprobarAccionPersonal(this.aprobarAccionPersonalRequest)
                .pipe(
                    catchError(({error}) => {
                        this.dataService.Message().msgWarning('"' + error.messages[0].toUpperCase() + '"');
                        isSuccess = false;
                        return of(null);
                    }),
                    finalize(() => {
                        this.dataService.Spinner().hide("sp6")
                    })
                ).toPromise();

            _response.then(response => {
                if (isSuccess && response) {
                    this.dataService.Message().msgSuccess('OPERACIÓN REALIZADA DE FORMA EXITOSA.', () => {
                        this.handleCancelar();
                    });
                }
            });
        });
    }
    //http://localhost:4200/ayni/personal/acciones/desplazamiento/aprobacion-accion-desplazamiento/196747
    handleCancelar() {
        this.router.navigate(['ayni/personal/bandejas/aprobacionespendientes']);
    }

    handleAprobar = () => {
        const codigoSede = this.currentSession.codigoSede;
        const codigoRol = this.currentSession.codigoRol;

        this.aprobarAccionPersonalRequest = {
            idAccionPersonal: +this.idAccionPersonal,
            aprobado: true,
            codigoSede,
            codigoRol
        };
        this.actualizarEstado();
    }

    handleDesaprobar() {
        var dialogRef = this.materialDialog.open(ObservacionDesaprobarDesplazamientoComponent, {
            panelClass: 'Minedu-observacion-desaprobar-desplazamiento',
            width: '980px',
            disableClose: true,
            data: { idAccionPersonal: +this.idAccionPersonal }
        });

        dialogRef.afterClosed()
            .subscribe((response: any) => {
                if (response?.isSuccess) {
                    this.handleCancelar();
                }
            });
    }
}