import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TablaEquivalenciaSede } from '../types/Enums';
import { EntidadSedeService } from './entidad-sede.service';

@Injectable({
    providedIn: 'root'
})
export class EntidadPassportService {

    constructor(
        private entidadSedeService: EntidadSedeService,
        private dataService: DataService) { }

    async actualizarEntidadSede() {

        const entidadSede = { ...this.entidadSedeService.entidadSede };
        if (!entidadSede) return;

        let codigoTipoSede = entidadSede?.codigoTipoSede;
        const response = await this.ObtenerEntidadPassport(entidadSede.codigoSede);

        if (!response) return;

        const _response = response?.filter(x => x.idNivelInstancia <= 3);
        if (_response?.length == 1 && _response[0].idNivelInstancia == 3)
            codigoTipoSede = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        this.entidadSedeService.entidadSede = {
            ...entidadSede,
            idDre: response[0]?.idDre ?? null,
            idUgel: response[0]?.idUgel == 0 ? null : response[0]?.idUgel,
            codigoTipoSede
        };
    }

    async ObtenerEntidadPassport(codSede) {
        const response = await this.dataService.AccionesPlazaEspejo().entidadPassport(codSede).pipe(
            catchError((error: HttpErrorResponse) => {
                this.dataService.Message().msgWarning(error.error.messages[0]);
                return of(null);
            })
        ).toPromise();

        return response;
    }
}
