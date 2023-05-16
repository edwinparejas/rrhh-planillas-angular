import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { findParam } from './find-param';

import { RatificacionModel } from 'app/core/model/ratificacion.model';
import { RestangularService } from '../services/restangular.service';
import { MessageService } from '../services/message.service';

@Injectable({
  providedIn: 'root'
})
export class RatificacionBaseService {
    constructor(
        private router: Router,
        private restangular: RestangularService,
        private messageService: MessageService
    ) { }

    findConfiguracionRatificacion(parametro: string): Observable<RatificacionModel> {    
        const configuracionRatificacionRestangular = this.restangular.one('ratificaciones', parametro);
        return configuracionRatificacionRestangular
        .get()
        .pipe(
            catchError(error => {
                const codigo = new RatificacionModel(configuracionRatificacionRestangular);
                return of(Object.assign(codigo, {}));
            }),
            map((response: any) => {
                if (response.result) {
                    const data = response.data;
                    const codigo = new RatificacionModel(configuracionRatificacionRestangular);
                    return Object.assign(codigo, data);
                } else {
                    this.messageService.msgWarning('Error al acceder al servidor, actualize la pagina dentro de unos segundos.', () => { });
                }
            })
        );
    }
}

@Injectable({
    providedIn: 'root',
})
export class RatificacionResolverService implements Resolve<any> {

    constructor(private ratificacionService: RatificacionBaseService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const param = findParam('codigo', route);
        const parametro = param.slice(11);
        const ratificacion = this.ratificacionService.findConfiguracionRatificacion(parametro);
        return ratificacion;
    }
}

@Injectable({
    providedIn: 'root',
})
export class CargaMasivaResolverService implements Resolve<any> {

    constructor(private ratificacionService: RatificacionBaseService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const param = findParam('codigo', route);
        const parametro = param;
        // const ratificacion = this.ratificacionService.findConfiguracionRatificacion(parametro);
        const ratificacion = parametro;
        return ratificacion;
    }
}

@Injectable({
    providedIn: 'root',
})
export class ApruebaPlazaResolverService implements Resolve<any> {
    
    constructor(private ratificacionService: RatificacionBaseService) { }
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const param = findParam('codigo', route);
        const parametro = param;
        const ratificacion = parametro;
        return ratificacion;
    }
}
