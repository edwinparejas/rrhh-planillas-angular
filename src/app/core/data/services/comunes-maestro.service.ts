import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ComunesRestangularService } from './resources/comunes-restangular.service';
import { RestangularBasePath } from '../base-path/restangular-base-path';

@Injectable({
  providedIn: 'root'
})
export class ComunesMaestroService {

  constructor(private restangular: ComunesRestangularService,    
    private _http: HttpClient,
    private basePath: RestangularBasePath) {
  }

  getTiposDocumentoIdentidad() {
    return this.restangular.all("TiposDocumentoIdentidad").one("abc",'').get();
  }

  getDres() {
    return this.restangular.all("DireccionesRegionalesEducacion").get();
  }

  getUgeles(pIdDre: any) {
    let queryParam: HttpParams = new HttpParams()
      .set('idDre', pIdDre);
    return this.restangular.all("Ugeles").get(queryParam);
  }

  getInstanciasAgrupadas(): Observable<any> {  
    let url = this.basePath.comunesApi + "/instancias/agrupado";
    return this._http.get<any>(`${url}`);
  }

}
