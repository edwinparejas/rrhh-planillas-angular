import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { DataService } from "../data.service";



@Injectable({
    providedIn: "root",
  })
  export class TiposDocumentoIdentidadResolverService implements Resolve<any> {
    constructor(private dataService: DataService) {}
  
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> {
        return this.dataService
            .AccionesGrabadas() 
            .getTiposDocumentoIdentidad()
            .pipe(
                catchError(() => {         
                    return of({ data: [], result: false });
                }),
                map((response: any) => response)
            );
    }
  }

  @Injectable({
    providedIn: "root",
})
export class AniosAperturadosResolverService implements Resolve<any> {
    constructor(private dataService: DataService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> {
        return this.dataService
            .AccionesGrabadas() //Resolucion
            .getAniosAperturados()
            .pipe(
                catchError(() => {                   
                    return of({ data: [], result: false });
                }),
                map((response: any) => response)
            );
    }
}


@Injectable({
    providedIn: "root",
})
export class RegimenesLaboralesResolverService implements Resolve<any> {
    constructor(private dataService: DataService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> {
        return this.dataService
            .AccionesGrabadas()
            .getRegimenesLaborales()
            .pipe(
                catchError(() => {                   
                    return of({ data: [], result: false });
                }),
                map((response: any) => response)
            );
    }
}

@Injectable({
    providedIn: "root",
})
export class EstadosAccionesGrabadasResolverService implements Resolve<any> {
    constructor(private dataService: DataService) {}

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> {
        return this.dataService
            .AccionesGrabadas()
            .getEstadosAccionesGrabadas()
            .pipe(
                catchError(() => {
                    return of({ data: [], result: false });
                }),
                map((response: any) => response)
            );
    }
}


