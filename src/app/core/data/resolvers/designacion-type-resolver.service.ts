import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DataService } from '../data.service';
import { MessageService } from '../services/message.service';
import { CONFIGURACION_PROCESO_MESSAGE, SNACKBAR_BUTTON } from 'app/core/model/messages-error';
import { DesignacionProcesosRestangularService } from '../services/resources/designacion-procesos-restangular.service';

@Injectable({
    providedIn: 'root'
})
export class DesignacionBaseService {
    constructor(
        private router: Router,
        private restangular: DesignacionProcesosRestangularService,
        private messageService: MessageService
    ) {
    }
}

@Injectable({
    providedIn: 'root'
})
export class EstadosDesignacionResolverService implements Resolve<any> {

    constructor(private dataService: DataService) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
        return this.dataService
            .Designacion()
            .getComboEstadosDesignacion()
            .pipe(
                catchError(() => { this.dataService.SnackBar().msgError(CONFIGURACION_PROCESO_MESSAGE.ESTADOS_PROCESO, SNACKBAR_BUTTON.CLOSE); return of(null); }),
                map((response: any) => response)
            );
    }
}