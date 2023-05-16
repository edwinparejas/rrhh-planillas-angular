import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders, HttpRequest, HttpEvent, } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Router } from '@angular/router';
import { RestangularBasePath } from '../base-path/restangular-base-path';
import { EncryptDecryptService } from './encrypt-decrypt.service';

@Injectable({
  providedIn: 'root'
})
export class RestangularService {
  private plazaUrl: string;
  private documentoUrl: string;
  private historicoUrl: string;
  private cargamasivaUrl: string;
  private passportUrl: string;
  private kongAuthUrl: string;
  private actividadesApi: string;
  private aprobacionesApi: string;

  constructor(
    private _http: HttpClient,
    private router: Router,
    private cifrado: EncryptDecryptService,
    private basePath: RestangularBasePath
  ) {
    this.passportUrl = basePath.passportApi;
    this.kongAuthUrl = basePath.kongAuthApi;
    this.documentoUrl = basePath.documentosApi;

    this.cargamasivaUrl = basePath.cargaMasivaApi;
    this.historicoUrl = basePath.historialApi;
    this.actividadesApi  = basePath.actividadesApi;
    this.aprobacionesApi  = basePath.aprobacionesApi
  }

  get http() {
    return this._http;
  }

  /***************************************************************************************************
  * Servicios Genericos BASE PATH.
  ***************************************************************************************************/
  get path() {
    return this.plazaUrl;
  }

  one(path: string, id: string): RestangularService {
    const restangular = this.clone();
    restangular.plazaUrl += (path ? "/" + path : "") + "/" + id;
    return restangular;
  }

  all(path: string): RestangularService {
    const restangular = this.clone();
    restangular.plazaUrl = restangular.plazaUrl + "/" + path;
    return restangular;
  }

  get(queryParams?: HttpParams): Observable<Response> {
    return this._http.get(this.plazaUrl, { params: queryParams }).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  file(queryParams?: HttpParams): Observable<Blob> {
    return this._http.get<Blob>(this.plazaUrl,      
      {
        headers: new HttpHeaders({
          'accept': 'application/octec-stream',
          'content-type': 'application/json'
        }),
        params: queryParams,
        responseType: 'blob' as 'json'
      });
  }

  post(obj?: any): Observable<Response> {
    return this._http.post(this.plazaUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  
  patch(obj?: any): Observable<Response> {
    return this._http.patch(this.plazaUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  put(obj: any): Observable<Response> {
    const clone = Object.assign({}, obj);
    delete clone['_restangular'];
    return this._http.put(this.plazaUrl, clone).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  delete(): Observable<Response> {
    return this._http.delete(this.plazaUrl).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  /***************************************************************************************************
  * Servicio documentos
  ***************************************************************************************************/
  get pathDocumento() {
    return this.documentoUrl;
  }

  oneDocumento(path: string, id: string): RestangularService {
    const restangular = this.clone();
    restangular.documentoUrl += (restangular.documentoUrl ? "/" + path : "") + "/" + id;
    return restangular;
  }

  allDocumento(path: string): RestangularService {
    const restangular = this.clone();
    restangular.documentoUrl = restangular.documentoUrl + "/" + path;
    return restangular;
  }
  
  getDocumento(queryParams?: HttpParams): Observable<Response> {
    return this._http.get(this.documentoUrl, { params: queryParams }).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  download(obj?: any, queryParams?: HttpParams): Observable<Response> {
    return this._http.get(this.documentoUrl, { params: queryParams, responseType: 'blob' }).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }
  
  getDocumentoFormato(): Observable<HttpEvent<Blob>> {
  return this._http.request(new HttpRequest(
    'GET',
    this.documentoUrl,
    null,
    {
      reportProgress: true,
      responseType: 'blob'
    }));
  }

  getDescargar(): Observable<HttpEvent<Blob>> {  
    return this._http.request(new HttpRequest(
      'GET',
      this.documentoUrl,
      null,
      {
        reportProgress: true,
        responseType: 'blob'
      }));
  }

  postDocumento(obj?: any): Observable<Response> {
    return this._http.post(this.documentoUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }
  
  patchDocumento(obj?: any): Observable<Response> {
    return this._http.patch(this.documentoUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  putDocumento(obj: any): Observable<Response> {
    const clone = Object.assign({}, obj);
    delete clone['_restangular'];
    return this._http.put(this.documentoUrl, clone).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  /***************************************************************************************************
  * Servicio historico
  ***************************************************************************************************/
  get pathHistorico() {
    return this.historicoUrl;
  }

  oneHistorico(path: string, id: string): RestangularService {
    const restangular = this.clone();
    restangular.historicoUrl += (path ? "/" + path : "") + "/" + id;
    return restangular;
  }

  allHistorico(path: string): RestangularService {
    const restangular = this.clone();
    restangular.historicoUrl = restangular.historicoUrl + "/" + path;
    return restangular;
  }
  
  getHistorico(queryParams?: HttpParams): Observable<Response> {
    return this._http.get(this.historicoUrl, { params: queryParams }).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  getHistoricoFile(queryParams?: HttpParams): Observable<Blob> {
    return this._http.get<Blob>(this.historicoUrl,      
      {
        headers: new HttpHeaders({
          'accept': 'application/octec-stream',
          'content-type': 'application/json'
        }),
        params: queryParams,
        responseType: 'blob' as 'json'
      });
  }

  postHistorico(obj?: any): Observable<Response> {
    return this._http.post(this.historicoUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }
  
  patchHistorico(obj?: any): Observable<Response> {
    return this._http.patch(this.historicoUrl, obj).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  putHistorico(obj: any): Observable<Response> {
    const clone = Object.assign({}, obj);
    delete clone['_restangular'];
    return this._http.put(this.historicoUrl, clone).pipe(
      catchError(this.handleError),
      map((response) => {
        return response as any;
      })
    );
  }

  /***************************************************************************************************
  * Servicio cargamasiva
  ***************************************************************************************************/
  get pathCargaMasiva() {
    return this.cargamasivaUrl;
  }

  oneCargaMasiva(path: string, id: string): RestangularService {
    const restangular = this.clone();
    restangular.cargamasivaUrl += (path ? "/" + path : "") + "/" + id;
    return restangular;
  }

  allCargaMasiva(path: string): RestangularService {
    const restangular = this.clone();
    restangular.cargamasivaUrl = restangular.cargamasivaUrl + "/" + path;
    return restangular;
  }
  
  getCargaMasiva(queryParams?: HttpParams): Observable<Response> {
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
  * Servicios PASSPORT.
  ***************************************************************************************************/
  get pathPassport() {
    return this.passportUrl;
  }

  onePassport(path: string, id: string): RestangularService {
    const restangular = this.clone();
    restangular.passportUrl += (path ? "/" + path : "") + "/" + id;
    return restangular;
  }

  allPassport(path: string): RestangularService {
    const restangular = this.clone();
    restangular.passportUrl = restangular.passportUrl + "/" + path;
    return restangular;
  }

  getPassport(queryParams?: HttpParams): Observable<Response> {
    return this._http.get(this.passportUrl, { params: queryParams }).pipe(
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

  postPassport(obj?: any): Observable<Response> {
    return this._http.post(this.passportUrl, obj).pipe(
        catchError(this.handleError),
        map(response => {
            let data = response as any;            
            if (data) {
                return (this.cifrado.PassportDecode(data) || null);
            }
            return null;
        })
    );
  }

  postPassportNoCypher(obj?: any): Observable<Response> {
    return this._http.post(this.passportUrl, obj).pipe(
        catchError(this.handleError),
        map(response => {
            let data = response as any;
            if (data) {
                return (JSON.parse(data) || null);
            }
            return null;
        })
    );
  }

  postBootPassport(obj?: any): Observable<Response> {
    return this._http.post(this.passportUrl, obj).pipe(
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
  * Servicios Kong.
  ***************************************************************************************************/
  get pathKongAuth() {
    return this.kongAuthUrl;
  }

  oneKongAuth(path: string, id: string): RestangularService {
    const restangular = this.clone();
    restangular.kongAuthUrl += (path ? "/" + path : "") + "/" + id;
    return restangular;
  }

  allKongAuth(path: string): RestangularService {
    const restangular = this.clone();
    restangular.kongAuthUrl = restangular.kongAuthUrl + "/" + path;
    return restangular;
  }

  postKongAuth(obj?: any, queryParams?: HttpParams, headers?: HttpHeaders): Observable<Response> {
    return this._http.post(this.kongAuthUrl, obj, { params: queryParams, headers: headers }).pipe(
        catchError(this.handleError),
        map(response => {
            let data = response as any;
            return data;
        })
    );
  }

    /***************************************************************************************************
  * Servicios Aprobaciones.
  ***************************************************************************************************/
     get pathAprobaciones() {
      return this.aprobacionesApi;
    }
    
    oneAprobaciones(path: string, id: string): RestangularService {
      const restangular = this.clone();
      restangular.aprobacionesApi += (path ? "/" + path : "") + "/" + id;
      return restangular;
    }
    
    allAprobaciones(path: string): RestangularService {
      const restangular = this.clone();
      restangular.aprobacionesApi = restangular.aprobacionesApi + "/" + path;
      return restangular;
    }
    
    getAprobaciones(queryParams?: HttpParams): Observable<Response> {
      return this._http.get(this.aprobacionesApi, { params: queryParams }).pipe(
        catchError(this.handleError),
        map((response) => {
          return response as any;
        })
      );
    }
    postAprobaciones(obj?: any, queryParams?: HttpParams, headers?: HttpHeaders): Observable<Response> {
      return this._http.post(this.aprobacionesApi, obj, { params: queryParams, headers: headers }).pipe(
          catchError(this.handleError),
          map(response => {
              let data = response as any;
              return data;
          })
      );
    }
    
    downloadAprobacion(queryParams?: HttpParams): Observable<Blob> {
      return this._http.get<Blob>(this.aprobacionesApi,      
        {
          headers: new HttpHeaders({
            'accept': 'application/octec-stream',
            'content-type': 'application/json'
          }),
          params: queryParams,
          responseType: 'blob' as 'json'
        });
    }
  /***************************************************************************************************
  * Seccion de errores y reinyeccion de servicio.
  ***************************************************************************************************/
  clone(): RestangularService {
    return new RestangularService(this._http, this.router, this.cifrado, {   
      passportApi: this.passportUrl,
      kongAuthApi: this.kongAuthUrl,
      documentosApi: this.documentoUrl, 
           
      historialApi: this.historicoUrl,
      cargaMasivaApi: this.cargamasivaUrl,

      actividadesApi: this.actividadesApi,
    } as RestangularBasePath);
  }

  handleError(response: HttpErrorResponse) {
    let errorMessage = response.error;
    return throwError(errorMessage);
  }
}

