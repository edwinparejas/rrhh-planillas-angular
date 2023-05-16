import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { RotacionModel } from 'app/core/model/rotacion.model';
import { TablaRolPassport } from 'app/core/model/types';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DataService } from '../data.service';
import { RotacionRestangularService } from '../services/resources/rotacion.restangular.service';
import { findParam } from './find-param';

@Injectable({
    providedIn: 'root',
})
export class CabeceraProcesoEtapaResolverService implements Resolve<any> {

    constructor(private restangular: RotacionRestangularService, private dataService: DataService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const pIdProceso = findParam("paramIdProceso", route);
        const pIdDesarrolloProceso = findParam("paramIdDesarrolloProceso", route);
        const rolSelected = this.dataService.Storage().getPassportRolSelected();

        var rotacionRestangular = this.restangular.one("etapasproceso/porAlcanceProceso", pIdDesarrolloProceso);
        return forkJoin([
            rotacionRestangular.get(),
            this.dataService.Rotacion().getCentroTrabajoUsuario()
        ]).pipe(
            catchError(error => {
                // const proceso = new RotacionModel(rotacionRestangular);
                // return of(Object.assign(proceso, {}));
                return of([]);
            }),
            map((response: any) => {
                if (response && response.length > 0) {
                    let proceso = new RotacionModel(rotacionRestangular);;
                    if (response[0]) {
                        const data = response[0];
                        if (response[1]) {
                            const centroTrabajo = response[1];
                            data.idCentroTrabajo = centroTrabajo.idCentroTrabajo;
                            data.codigoCentroTrabajo = centroTrabajo.codigoCentroTrabajo;
                            data.centroTrabajo = centroTrabajo.centroTrabajo;
                            data.descripcionDre = centroTrabajo.descripcionDre;
                            data.descripcionUgel = centroTrabajo.descripcionUgel;
                            // data.idAlcanceProceso = +pIdAlcanceProceso;
                            data.esRolMonitor = rolSelected.CODIGO_ROL === TablaRolPassport.MONITOR;
                        }
                        return Object.assign(proceso, data);
                    } else {
                        this.dataService.Message().msgWarning("Error al acceder al servidor, actualize la pagina dentro de unos segundos.", () => {
                            this.dataService.Storage().passportUILogin();
                        });
                    }
                } else {
                    this.dataService.Message().msgWarning("Error al acceder al servidor, actualize la pagina dentro de unos segundos.", () => {
                        this.dataService.Storage().passportUILogin();
                    });
                }
            })
        );

    }
}