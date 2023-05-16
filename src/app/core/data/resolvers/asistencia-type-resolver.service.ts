import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { AsistenciaModel } from 'app/core/model/asistencia-model';
import { ASISTENCIA_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { Observable, of } from 'rxjs';
import { catchError , map} from 'rxjs/operators';
import { DataService } from '../data.service';
import { MessageService } from '../services/message.service';
import { AsistenciaRestangularService } from '../services/resources/asistencia-restangular.service';
import { findParam } from './find-param';


@Injectable({
    providedIn: 'root'
})
export class AsistenciaResolverBaseService {
    constructor(
        private router: Router,
        private restangular: AsistenciaRestangularService,
        private messageService: MessageService
    ) { }

    findConfiguracionRatificacion(parametro: string): Observable<AsistenciaModel> {    
        const configuracionAsistenciaRestangular = this.restangular.one('falta servicio para que carga aqui', parametro);
        return configuracionAsistenciaRestangular
        .get()
        .pipe(
            catchError(error => {
                const codigo = new AsistenciaModel(configuracionAsistenciaRestangular);
                return of(Object.assign(codigo, {}));
            }),
            map((response: any) => {
                if (response.result) {
                    const data = response.data;
                    const codigo = new AsistenciaModel(configuracionAsistenciaRestangular);
                    return Object.assign(codigo, data);
                } else {
                    this.messageService.msgWarning('Error al acceder al servidor, actualize la pagina dentro de unos segundos.', () => { });
                }
            })
        );
    }
}
export class AsistenciaBaseService {
    constructor(
        private router: Router,
        private restangular: AsistenciaRestangularService,
        private messageService: MessageService
    ) {
    }

    findAsistencia(idControlAsistencia: string): Observable<AsistenciaModel> {
        
        const AsistenciaRestangular = this.restangular.one("controlesasistencia", idControlAsistencia);
        return AsistenciaRestangular
            .get()
            .pipe(
                catchError(error => {
                    const asistenciaMensual = new AsistenciaModel(AsistenciaRestangular);
                    return of(Object.assign(asistenciaMensual, {}));
                }),
                map((response: any) => {
                    if (response.result) {
                        const data = response.data;
                        const asistenciaMensual = new AsistenciaModel(AsistenciaRestangular);
                        return Object.assign(asistenciaMensual, data);
                    } else {
                        this.messageService.msgWarning("Error al acceder al servidor, intente de nuevo por favor.", () => {
                    
                        });
                    }
                })
            );
    }
}



@Injectable({
    providedIn: 'root',
})
export class RegistroAsistenciaResolverService implements Resolve<any> {

    constructor(private asistenciaService: AsistenciaBaseService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const param = findParam("asistencia", route);
        const idControlAsistencia = param.slice(17);
        const asistencia = this.asistenciaService.findAsistencia(idControlAsistencia);
        return asistencia;
    }
}

@Injectable({
    providedIn: 'root'
  })

  export class EstadosControlAsistenciaResolverService   implements Resolve<any> {
      constructor( private dataService: DataService ) { }
      resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        return this.dataService
            .Asistencia()
            .getEstadoControl()
            .pipe(
                catchError(() => { this.dataService.SnackBar().msgError(ASISTENCIA_MESSAGE.ESTADOS_ASISTENCIA_MENSUAL_ERROR , SNACKBAR_BUTTON.CLOSE); return of(null); }),
                map((response: any) => response)
            );
    }  
  }
  @Injectable({
    providedIn: 'root',
  })
  export class AsistenciaResolverService implements Resolve<any> {

    constructor(private services: AsistenciaResolverBaseService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const param = findParam('codigo', route);
        const parametro = param;
        // const asistencia = this.services.findConfiguracionRatificacion(parametro);
        const asistencia = parametro;
        return asistencia;
    }
}
@Injectable({
    providedIn: 'root',
  })
  export class RegistraAsistenciaResolverService implements Resolve<any> {

    constructor(private services: AsistenciaResolverBaseService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        const param = findParam('codigo', route);
        const parametro = param;
        // const asistencia = this.services.findConfiguracionRatificacion(parametro);
        const asistencia = parametro;
        return asistencia;
    }
}
