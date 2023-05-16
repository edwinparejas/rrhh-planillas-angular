import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { GlobalUtil } from "./global";


import {
    InstanciaModel
} from "app/main/apps/procesos/contratacion/models/contratacion.model";

@Injectable({
    providedIn: "root",
})
export class PersonalHistorialService{
    constructor(
        // private restangular: ContratacionesRestangularService,
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private global: GlobalUtil,
    ) { }

    getCatalogoItem = (param: any) : Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/catalogoitem/obtenerporcodigocatalogo?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getPersonaHistorialPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/Historial/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getVacacionesHistorialPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/Historial/vacacionespaginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getConsolidadoCabecera = (param: any): Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/Historial/obtenerConsolidadoCabecera?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getConsolidadoPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/Historial/consolidadoPaginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getdetalleValorHistorial = (param: any): Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/Historial/obtenerDetalleValorHistorial?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getHistorialPersonalExcel = (body: any): Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/Historial/excel`;
        return this._http.post<any>(url, body);
    }

    generarHistorialPDF = (data: any): Observable<Response> => {
        let url = `${this.basePath.personalHistorialApi}/Historial/generarHistorialPDF`;
        return this._http.post<any>(url, data);
    }

    getComboRegimenLaboral = (param: any): Observable<any> => {
        let url = `${this.basePath.personalHistorialApi}/regimeneslaboral/obtenertodos?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }



}