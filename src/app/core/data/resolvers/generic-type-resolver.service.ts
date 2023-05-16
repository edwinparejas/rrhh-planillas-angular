import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DataService } from '../data.service';

@Injectable({
  providedIn: 'root'
})
export class TiposDocumentoIdentidadResolverService implements Resolve<any> {

  constructor(private dataService: DataService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
    return this.dataService
      .Maestro()
      .getTiposDocumentoIdentidad()
      .pipe(
        catchError(() => of([])),
        map((response: any) => response)
      );
  }
}

@Injectable({
  providedIn: 'root'
})
export class DresResolverService implements Resolve<any> {

  constructor(private dataService: DataService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
    return this.dataService
      .Maestro()
      .getDres()
      .pipe(
        catchError(() => of([])),
        map((response: any) => response)
      );
  }
}
