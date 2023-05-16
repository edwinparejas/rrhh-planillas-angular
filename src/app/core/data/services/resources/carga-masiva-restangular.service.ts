import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpParams,
    HttpErrorResponse,
    HttpHeaders,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { RestangularBasePath } from "../../base-path/restangular-base-path";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { convertObjectToGetParams } from "@minedu/functions/http.helpers";

@Injectable({
    providedIn: "root",
})
export class CargaMasivaRestangularService {
    private cargamasivaUrl: string;

    constructor(
        private _http: HttpClient,
        private router: Router,
        private basePath: RestangularBasePath
    ) {
        this.cargamasivaUrl = basePath.cargaMasivaApi;
    }

    get http() {
        return this._http;
    }

    get path() {
        return this.cargamasivaUrl;
    }

   /***************************************************************************************************
  * Servicio cargamasiva
  ***************************************************************************************************/
  get pathCargaMasiva() {
    return this.cargamasivaUrl;
  }

  oneCargaMasiva(path: string, id: string): CargaMasivaRestangularService {
    const restangular = this.clone();
    restangular.cargamasivaUrl += (path ? "/" + path : "") + "/" + id;
    return restangular;
  }

  allCargaMasiva(path: string): CargaMasivaRestangularService {
    debugger
    const restangular = this.clone();
    restangular.cargamasivaUrl = restangular.cargamasivaUrl + "/" + path;
    return restangular;
  }
  
  getCargaMasiva(queryParams?: HttpParams): Observable<Response> {
    debugger
    return this._http.get(this.cargamasivaUrl, { params: queryParams }).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  getCargaMasivaFile(queryParams?: HttpParams): Observable<Blob> {
    return this._http.get<Blob>(this.cargamasivaUrl,      
    {
      headers: new HttpHeaders({
        'accept': 'application/octec-stream',
        'content-type': 'application/json'
      }),
      params: queryParams,
      responseType: 'blob' as 'json'
    });
  }

  postCargaMasiva(obj?: any): Observable<Response> {
    return this._http.post(this.cargamasivaUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }
  
  patchCargaMasiva(obj?: any): Observable<Response> {
    return this._http.patch(this.cargamasivaUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  putCargaMasiva(obj: any): Observable<Response> {
    const clone = Object.assign({}, obj);
    delete clone['_restangular'];
    return this._http.put(this.cargamasivaUrl, clone).pipe(
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

    clone(): CargaMasivaRestangularService {
        return new CargaMasivaRestangularService(this._http, this.router, {
            cargaMasivaApi: this.cargamasivaUrl,
        } as RestangularBasePath);
    }

    handleError(response: HttpErrorResponse) {
        let errorMessage = response.error;
        return throwError(errorMessage);
    }
}
