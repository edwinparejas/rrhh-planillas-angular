import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Modelo } from './base-model-carga';
import { RestangularService } from '../data/services/restangular.service';


export class CargaMasivaModel  extends Modelo {
    parametro: string;    

    constructor(restangular: RestangularService) {
        super(restangular);
    }

    build(): CargaMasivaModel {
        return new CargaMasivaModel(this.restangular);
    }

    // getRatificacion = (idPlazaRatificada: any): Observable<any> => {
    //     return this.restangular.one('ratificaciones', idPlazaRatificada).get();
    // }
}

