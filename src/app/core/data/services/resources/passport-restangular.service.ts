import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RestangularBasePath } from '../../base-path/restangular-base-path';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EncryptDecryptService } from '../encrypt-decrypt.service';

@Injectable({
    providedIn: 'root'
})
export class PassportRestangularService {

    private baseUrl: string;

    constructor(
        private _http: HttpClient,
        private router: Router,
        private cifrado: EncryptDecryptService,
        private basePath: RestangularBasePath
    ) {
        this.baseUrl = this.basePath.passportApi;
    }

    get http() {
        return this._http;
    }

    get path() {
        return this.baseUrl;
    }

    one(path: string, id: string): PassportRestangularService {
        const restangular = this.clone();
        restangular.baseUrl += (path ? "/" + path : "") + "/" + id;
        return restangular;
    }

    all(path: string): PassportRestangularService {
        const restangular = this.clone();
        restangular.baseUrl = restangular.baseUrl + "/" + path;
        return restangular;
    }

    get(queryParams?: HttpParams): Observable<Response> {
        return this._http.get(this.baseUrl, { params: queryParams }).pipe(
            catchError(this.handleError),
            map((response) => {
                let data = response as any;
                if (data) {
                    return (this.cifrado.PassportDecode(data) || null);
                }
                return null;
            })
        );
    }

    post(obj?: any, queryParams?: HttpParams): Observable<Response> {
        return this._http.post(this.baseUrl, obj, { params: queryParams }).pipe(
            catchError(this.handleError),
            map((response) => {
                let data = response as any;
                if (data) {
                    return (this.cifrado.PassportDecode(data) || null);
                }
                return null;
            })
        );
    }

    postBoot(obj?: any): Observable<Response> {
        return this._http.post(this.baseUrl, obj).pipe(
            catchError(this.handleError),
            map(response => {
                let data = response as any;
                if (data) {
                    return (data || null);
                }
                return null;
            })
        );
    }

    /***************************************************************************************************
     *
     * Seccion de errores y reinyeccion de servicio.
     *
     ***************************************************************************************************/

    clone(): PassportRestangularService {
        return new PassportRestangularService(this._http, this.router, this.cifrado, { passportApi: this.baseUrl } as RestangularBasePath);
    }

    handleError(response: HttpErrorResponse) {
        let errorMessage = response.error;
        return throwError(errorMessage);
    }
}
