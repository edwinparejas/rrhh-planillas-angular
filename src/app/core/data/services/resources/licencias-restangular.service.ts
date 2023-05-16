import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpParams,
    HttpErrorResponse,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { RestangularBasePath } from "../../base-path/restangular-base-path";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class LicenciasRestangularService {
    private baseUrl: string;

    constructor(
        private _http: HttpClient,
        private router: Router,
        private basePath: RestangularBasePath
    ) {
        this.baseUrl = basePath.licenciasApi;
    }

    get http() {
        return this._http;
    }

    get path() {
        return this.baseUrl;
    }

    one(path: string, id: string): LicenciasRestangularService {
        const restangular = this.clone();
        restangular.baseUrl += (path ? "/" + path : "") + "/" + id;
        return restangular;
    }

    all(path: string): LicenciasRestangularService {
        const restangular = this.clone();
        restangular.baseUrl = restangular.baseUrl + "/" + path;
        return restangular;
    }

    get(queryParams?: HttpParams): Observable<Response> {
        return this._http.get(this.baseUrl, { params: queryParams }).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    post(obj?: any, queryParams?: HttpParams): Observable<Response> {
        return this._http.post(this.baseUrl, obj, { params: queryParams }).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    download(obj?: any, queryParams?: HttpParams): Observable<Response> {
        return this._http
            .post(this.baseUrl, obj, {
                params: queryParams,
                responseType: "blob",
            })
            .pipe(
                catchError(this.handleError),
                map((response) => {
                    return response as any;
                })
            );
    }

    put(obj: any): Observable<Response> {
        const clone = Object.assign({}, obj);
        delete clone["_restangular"];
        return this._http.put(this.baseUrl, clone).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    delete(): Observable<Response> {
        return this._http.delete(this.baseUrl).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    patch(obj?: any): Observable<Response> {
        return this._http.patch(this.baseUrl, obj).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    /***************************************************************************************************
     *
     * Seccion de errores y reinyeccion de servicio.
     *
     ***************************************************************************************************/

    clone(): LicenciasRestangularService {
        return new LicenciasRestangularService(this._http, this.router, {
            licenciasApi: this.baseUrl,
        } as RestangularBasePath);
    }

    handleError(response: HttpErrorResponse) {
        let errorMessage = response.error;
        return throwError(errorMessage);
    }
}
