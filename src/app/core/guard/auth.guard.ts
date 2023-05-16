import { DataService } from 'app/core/data/data.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KONG_MESSAGE, PASSPORT_MESSAGE } from '../model/messages-error';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private _dataService: DataService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let experid = this._dataService.Storage().isTokenExpired();
    let experid_before = this._dataService.Storage().isTokenExpiredBefore();
    if (experid) {
      this.notAuthorize();
    } else if (experid_before) {
      const jwtExpired = this._dataService.Storage().isJwtTokenExpired();
      if (jwtExpired) {
        this.notAuthorize();
      }
    }
    return !experid;
  }


  notAuthorize() {
    this._dataService.Message().msgAutoCloseWarning("Su sesión ha expirado, ud. será redirigido a la página de inicio de sesión", 4000,
      () => {
        this.passportLogin();
      });
  }

  passportLogin() {
    this._dataService.Storage().passportUILogin();
  }
}
