import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TablaProcesosConfiguracionAcciones } from 'app/core/model/action-buttons/action-types';
import { PassportAutorizacionModel } from 'app/core/model/security/passport-autorizacion.model';
import { PassportBootModel } from 'app/core/model/security/passport-boot.model';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RestangularBasePath } from '../base-path/restangular-base-path';
import { HandlerService } from '../handler.service';
import { EncryptDecryptService } from './encrypt-decrypt.service';
import { PassportRestangularService } from './resources/passport-restangular.service';

@Injectable({
  providedIn: 'root'
})
export class PassportService {

  constructor(private restangular: PassportRestangularService,
    private _http: HttpClient,
    private basePath: RestangularBasePath,
    private cifrado: EncryptDecryptService,
    private handlerService: HandlerService) { }

  getSistemasUsuario(data: any): Observable<any> {
    var uri = this.basePath.passportApi + "/authorization/SistemasPermisoUsuarioData";
    return this._http.post(uri, data).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map((response) => {
        let data = response as any;
        if (data) {
          return (this.cifrado.PassportDecode(data) || null);
        }
        return null;
      })
    );
  }

  getSesionUsuario(data: any): Observable<any> {
    var uri = this.basePath.passportApi + "/authorization/SesionData";

    return this._http.post(uri, data).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map((response) => {
        let data = response as any;
        if (data) {
          return (this.cifrado.PassportDecode(data) || null);
        }
        return null;
      })
    );
  }

  getInformacionUsuario(data: any): Observable<any> {
    var uri = this.basePath.passportApi + "/authorization/UsuarioData";

    return this._http.post(uri, data).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map((response) => {
        let data = response as any;
        if (data) {
          return (this.cifrado.PassportDecode(data) || null);
        }
        return null;
      })
    );
  }

  getOperacionesMenu(data: any): Observable<any> {
    var uri = this.basePath.passportApi + "/authorization/MenuData";

    return this._http.post(uri, data).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map((response) => {
        let data = response as any;
        if (data) {
          return (this.cifrado.PassportDecode(data) || null);
        }
        return null;
      })
    );
  }

  getRolesUsuario(data: any): Observable<any> {
    var uri = this.basePath.passportApi + "/authorization/RolUsuarioData";
    return this._http.post(uri, data).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map((response) => {
        let data = response as any;
        if (data) {
          return (this.cifrado.PassportDecode(data) || null);
        }
        return null;
      })
    );
  }

  getAccionesUsuario(data: any): Observable<any> {
    var uri = this.basePath.passportApi + "/authorization/AccionData";
    return this._http.post(uri, data).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map((response) => {
        let data = response as any;
        if (data) {
          return (this.cifrado.PassportDecode(data) || null);
        }
        else {
         
        }
        return null;
      })
    );
  }

  getAutorizacion(data: any): Observable<PassportAutorizacionModel> {
    var result = this.basePath.passportApi + "/authorization/IsAuthorized";
    return this._http.post<any>(result, data).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map(response => {
        if (response) {
          // debugger;
          if (response == undefined)
            debugger;
          if (response == null)
            debugger;
          let serialize = this.cifrado.PassportDecode(response);
          return (<PassportAutorizacionModel>serialize || null);
        }
        else {
          debugger;
        }
        return null;
      }));
  }

  boot(): Observable<PassportBootModel> {
    var boot = this.basePath.passportApi + "/seguridad/control/Boot";
    return this._http.post<any>(boot, null).pipe(
      catchError(this.handlerService.handleErrorPassport),
      map((response: any) => {
        let data = JSON.parse(response);
        if (data) {
          return (data || null);
        }
        return null;
      }));
  }

}
