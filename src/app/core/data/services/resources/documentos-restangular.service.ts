import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpParams,
    HttpErrorResponse,
    HttpRequest,
    HttpHeaders,
    HttpEvent,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { RestangularBasePath } from "../../base-path/restangular-base-path";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
    providedIn: "root",
})
export class DocumentosRestangularService {
    private baseUrl: string;

    constructor(
        private _http: HttpClient,
        private router: Router,
        private basePath: RestangularBasePath
    ) {
        this.baseUrl = basePath.documentosApi;
    }

    get http() {
        return this._http;
    }

    get path() {
        return this.baseUrl;
    }

    one(path: string, id: string): DocumentosRestangularService {
        const restangular = this.clone();
        restangular.baseUrl +=
            (restangular.baseUrl ? "/" + path : "") + "/" + id;
        return restangular;
    }

    all(path: string): DocumentosRestangularService {
        const restangular = this.clone();
        restangular.baseUrl = restangular.baseUrl + "/" + path;
        return restangular;
    }

    allDocumento(path: string): DocumentosRestangularService {
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

    postDocumento(obj?: any): Observable<Response> {
        return this._http.post(this.baseUrl, obj).pipe(
            catchError(this.handleError),
            map((response) => {
                return response as any;
            })
        );
    }

    getDocumentoFormato(): Observable<HttpEvent<Blob>> {
        return this._http.request(
            new HttpRequest("GET", this.baseUrl, null, {
                reportProgress: true,
                responseType: "blob",
            })
        );
    }

    // postDocumento(obj?: any): Observable<Response> {
    //   obj.forEach((value, key) => {
    //     console.log("key %s: value %s", key, value);
    //   })
    //   const httpOptions = {
    //     headers: new HttpHeaders({
    //       'Access-Control-Allow-Origin': '*',
    //       'Access-Control-Allow-Headers': '*',
    //       'Access-Control-Allow-Credentials': '*',
    //       'Access-Control-Expose-Headers': 'x-access-token',
    //       'Content-Type': 'application/json; multipart/form-data',
    //       'enctype': 'application/json; multipart/form-data'
    //     })
    //   }
    //   return this._http.post(this.baseUrl, obj, httpOptions).pipe(
    //     catchError(this.handleError),
    //     map((response) => {
    //       return response as any;
    //     })
    //   );
    // }

    download(obj?: any, queryParams?: HttpParams): Observable<Response> {
        return this._http
            .get(this.baseUrl, { params: queryParams, responseType: "blob" })
            .pipe(
                catchError(this.handleError),
                map((response) => {
                    return response as any;
                })
            );
    }

    preview(obj?: any, queryParams?: HttpParams): Observable<Response> {
        return this._http
            .get(this.baseUrl, {
                params: queryParams,
                responseType: "arraybuffer",
            })
            .pipe(
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

    clone(): DocumentosRestangularService {
        return new DocumentosRestangularService(this._http, this.router, {
            documentosApi: this.baseUrl,
        } as RestangularBasePath);
    }

    handleError(response: HttpErrorResponse) {
        let errorMessage = response.error;
        return throwError(errorMessage);
    }
}
