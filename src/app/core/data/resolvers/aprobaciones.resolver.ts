import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { findParam } from './find-param';
import { DataService } from '../data.service';


@Injectable({
  providedIn: 'root'
})
export class AprobacionesResolver implements Resolve<any> {

  constructor(private dataService: DataService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> {
    
    const param = findParam("idAprobacion", route);
    return  param;
  }
}

