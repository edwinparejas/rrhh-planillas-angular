import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { RestangularBasePath } from "../../base-path/restangular-base-path";


@Injectable({
    providedIn: "root",
})
export class AccionesGrabadasRestangularService {
    private baseUrl: string;

    constructor(
        private _http: HttpClient,
        private router: Router,
        private basePath: RestangularBasePath
    ) {
        this.baseUrl = basePath.accionesGrabadasApi;
    }

    get http() {
        return this._http;
    }
    /***************************************************************************************************
     *
     * Servicios Genericos BASE PATH ACCIONES GRABADAS.
     *
     ***************************************************************************************************/
    get path() {
        return this.baseUrl;
    }

    one(path: string, id: string): AccionesGrabadasRestangularService {
        const restangular = this.clone();
        restangular.baseUrl += (path ? "/" + path : "") + "/" + id;
        return restangular;
    }

    all(path: string): AccionesGrabadasRestangularService {
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
        ;
    }

    getData(queryParams?: any): Observable<Response> {
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

    /***************************************************************************************************
     *
     * Seccion de errores y reinyeccion de servicio.
     *
     ***************************************************************************************************/

    clone(): AccionesGrabadasRestangularService {
        return new AccionesGrabadasRestangularService(this._http, this.router, {
            accionesGrabadasApi: this.baseUrl,
        } as RestangularBasePath);
    }

    handleError(response: HttpErrorResponse) {
        let errorMessage = response.error;
        return throwError(errorMessage);
    }
}
