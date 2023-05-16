import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Modelo } from './base-model-carga';
import { RestangularService } from '../data/services/restangular.service';


export class RatificacionModel  extends Modelo {
    parametro: string;    

    constructor(restangular: RestangularService) {
        super(restangular);
    }

    build(): RatificacionModel {
        return new RatificacionModel(this.restangular);
    }

    // getRatificacion = (idPlazaRatificada: any): Observable<any> => {
    //     return this.restangular.one('ratificaciones', idPlazaRatificada).get();
    // }
}

