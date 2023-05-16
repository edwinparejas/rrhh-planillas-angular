import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { RestangularBasePath } from '../../base-path/restangular-base-path';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComunesRestangularService {

  private baseUrl: string;

  constructor(
    private _http: HttpClient,
    private router: Router,
    private basePath: RestangularBasePath
  ) {
    this.baseUrl = basePath.comunesApi;
  }

  get http() {
    return this._http;
  }

  get path() {
    return this.baseUrl;
  }

  one(path: string, id: string): ComunesRestangularService {
    const restangular = this.clone();
    restangular.baseUrl += (path ? "/" + path : "") + "/" + id;
    return restangular;
  }

  all(path: string): ComunesRestangularService {
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

  /***************************************************************************************************
   *
   * Seccion de errores y reinyeccion de servicio.
   *
   ***************************************************************************************************/

  clone(): ComunesRestangularService {
    return new ComunesRestangularService(this._http, this.router, { comunesApi: this.baseUrl } as RestangularBasePath);
  }

  handleError(response: HttpErrorResponse) {
    let errorMessage = response.error;
    return throwError(errorMessage);
  }
}
