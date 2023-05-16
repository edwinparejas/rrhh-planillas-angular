import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpParams,
    HttpErrorResponse,
    HttpHeaders,
    HttpRequest,
    HttpEvent,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map, retry } from "rxjs/operators";
import { Router } from "@angular/router";
import { RestangularBasePath } from "../../base-path/restangular-base-path";

@Injectable({
    providedIn: "root",
})
export class AprobacionesRestangularService {
    private aprobacionesApi: string;

    constructor(
        private _http: HttpClient,
        private router: Router,
        private basePath: RestangularBasePath
    ) {
        this.aprobacionesApi = basePath.aprobacionesApi;
    }

    /***************************************************************************************************
     * Servicios Aprobaciones.
     ***************************************************************************************************/
    get pathAprobaciones() {
        return this.aprobacionesApi;
    }

    oneAprobaciones(path: string, id: string): AprobacionesRestangularService {
        const restangular = this.clone();
        restangular.aprobacionesApi += (path ? "/" + path : "") + "/" + id;
        return restangular;
    }

    allAprobaciones(path: string): AprobacionesRestangularService {
        const restangular = this.clone();
        restangular.aprobacionesApi = restangular.aprobacionesApi + "/" + path;
        return restangular;
    }

    getAprobaciones(queryParams?: HttpParams): Observable<Response> {
        return this._http
            .get(this.aprobacionesApi, { params: queryParams })
            .pipe(
                catchError(this.handleError),
                map((response) => {
                    return response as any;
                })
            );
    }
    postAprobaciones(
        obj?: any,
        queryParams?: HttpParams,
        headers?: HttpHeaders
    ): Observable<Response> {
        return this._http
            .post(this.aprobacionesApi, obj, {
                params: queryParams,
                headers: headers,
            })
            .pipe(
                catchError(this.handleError),
                map((response) => {
                    let data = response as any;
                    return data;
                })
            );
    }

    putAprobaciones(obj: any): Observable<Response> {
        const clone = Object.assign({}, obj);
        delete clone["_restangular"];
        return this._http.put(this.aprobacionesApi, clone).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    patchAprobaciones(obj?: any): Observable<Response> {
        return this._http.patch(this.aprobacionesApi, obj).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    deleteAprobaciones(): Observable<Response> {
        return this._http.delete(this.aprobacionesApi).pipe(
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

    clone(): AprobacionesRestangularService {
        return new AprobacionesRestangularService(this._http, this.router, {
            aprobacionesApi: this.aprobacionesApi,
        } as RestangularBasePath);
    }

    handleError(response: HttpErrorResponse) {
        let errorMessage = response.error;
        return throwError(errorMessage);
    }
}
