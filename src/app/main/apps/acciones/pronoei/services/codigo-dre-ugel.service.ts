import { Injectable } from '@angular/core';
import { DataService } from '../../../../../core/data/data.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IEntidadSedeResponse } from '../interfaces/entidad-sede.interface';
import { IPassportResponse } from '../interfaces/passport.interface';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { codigoAreaDesempenioLaboral } from '../../desplazamiento/_utils/constants';
import { TablaEquivalenciaSede } from '../../gestionar-vinculacion/models/vinculacion.model';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class CodigoDreUgelService {

    passportModel: IPassportResponse;
    codigoDreUgel$: Observable<IEntidadSedeResponse>;
    private codigoDreUgelSubject = new BehaviorSubject<IEntidadSedeResponse>(null);

    constructor(private dataService: DataService, private router: Router) {
        this.codigoDreUgel$ = this.codigoDreUgelSubject.asObservable();
        this.passportModel = (this.dataService.Storage().getPassportRolSelected() as IPassportResponse);
    }

    getCodigoDreUgel() {
        return this.codigoDreUgelSubject.value;
    }

    complete() {
        this.codigoDreUgelSubject.complete();
    }

    private setCodigoDreUgel(codigoDreUgelData) {
        this.codigoDreUgelSubject.next(codigoDreUgelData);
    }

    get passportInstanciaModel() {
        return (this.dataService.Storage().getInstanciaSelected());
    }

    async getCodigoDreUgelFromServiceInit() {
        console.log(this.passportModel);
        console.log(this.passportInstanciaModel);

        this.passportModel = (this.dataService.Storage().getPassportRolSelected() as IPassportResponse);

        let codSede = this.passportModel.CODIGO_SEDE;        
        
        if (this.passportModel.CODIGO_ROL == 'AYNI_019' && this.passportInstanciaModel) {
            codSede = this.passportInstanciaModel.codigoInstancia;
            this.passportModel.CODIGO_TIPO_SEDE = this.passportInstanciaModel.codigoTipoSede
        }

        const response = await this.ObtenerEntidadPassport(codSede);

        return response;
    }

    async ObtenerEntidadPassport(codSede) {
        const response = await this.dataService.AccionesVinculacion().entidadPassport(codSede).pipe(
            catchError((error: HttpErrorResponse) => {
                this.dataService.Message().msgWarning(error.error.messages[0]);
                return of([]);
            })
        ).toPromise();

        if (!response ) return;
        const _response = response?.entidades?.filter(x => x.idNivelInstancia <= 3);

        if (_response?.length == 1 && _response[0].idNivelInstancia == 3)
            this.passportModel.CODIGO_TIPO_SEDE = TablaEquivalenciaSede.CODIGO_TIPO_SEDE_UGEL;

        const entidadSede: IEntidadSedeResponse = {
            idDre: response?.idDre,
            idUgel: response?.idUgel,
            codigoTipoSede: this.passportModel.CODIGO_TIPO_SEDE,
            codigoSede: codSede
        };

        this.setCodigoDreUgel(entidadSede);

        return entidadSede;
    }
}
