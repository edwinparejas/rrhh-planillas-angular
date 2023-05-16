import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { findParam } from './find-param';

import { CargaMasivaModel } from 'app/core/model/carga-masiva.model';
import { DataService } from '../data.service';
import { UtilService } from '../services/util.service';
import { RestangularService } from '../services/restangular.service';

@Injectable({
  providedIn: 'root'
})
export class CargaMasivaBaseService {
    constructor(
        private router: Router,
        private restangular: RestangularService,
        private messageService: UtilService
    ) { }
}

 

@Injectable({
    providedIn: 'root',
})
export class CargaMasivaResolverService implements Resolve<any> {

    constructor(private cargaMasivaService: CargaMasivaBaseService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const param = findParam('codigo', route);
        const parametro = param;        
        const cargaMasiva = parametro;
        return cargaMasiva;
    }
}

