import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { convertObjectToGetParams } from "@minedu/functions/http.helpers";
import * as moment from "moment";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { AccionesPlazaEspejoRestangularService } from './resources/acciones-plazaespejo-restangular.service';
import { GlobalUtil } from "./global";

@Injectable({
    providedIn: "root",
})
export class AccionesPlazaEspejoService {
    constructor(
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private global: GlobalUtil
    ) { }

    buscarPlaza(data: any, pageIndex, pageSize): Observable<any> {
        data.paginaActual = pageIndex;
        data.tamanioPagina = pageSize;

        const url = `${this.basePath.plazaEspejoApi}/plaza`;
        return this._http.get(url, { params: data });
    }


    buscarServidorPublicoTransversal = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.plazaEspejoApi + "/servidorespublicos/transversal";
        return this._http.post<any>(`${url}`, filtroPaginado);
    };


    getCatalogoItem(request) {
        let queryParam = new HttpParams();
        queryParam = queryParam.append("activo", request.activo);
        queryParam = queryParam.append("codigoCatalogo", request.codigoCatalogo);
        let url = this.basePath.plazaEspejoApi + `/catalogo/estado`;
        return this._http.get<any>(url, { params: queryParam });
    }

    getCatalogos(codigos: number[]): Observable<any> {
        let queryParam = new HttpParams();
        for (let codigo of codigos) {
            queryParam = queryParam.append("codigo", codigo.toString());
        }

        let url = this.basePath.plazaEspejoApi + "/catalogo/porcodigos";
        return this._http.get<any>(url, { params: queryParam });
    }
    getRegimenLaboral(codigoRol, codigoTipoSede): Observable<any> {

        let queryParam = new HttpParams();
        queryParam = queryParam.append("codigoRol", codigoRol);
        queryParam = queryParam.append("codigoTipoSede", codigoTipoSede);

        let url = this.basePath.plazaEspejoApi + "/regimenlaboral/todo";
        return this._http.get<any>(url, { params: queryParam });
    }

    getTipoActividad(): Observable<any> {
        let url = this.basePath.plazaEspejoApi + "/tipoactividad";
        return this._http.get<any>(url, { params: null });
    }

    getGrupoAccionPorIdRegimenLaboral(codigoRol: string, codigoTipoSede: string, idTipoActividad: number, idRegimenLaboral: number): Observable<any> {
        let url = this.basePath.plazaEspejoApi + `/grupoaccion/regimenlaboral/${codigoRol}/${codigoTipoSede}/${idTipoActividad}/${idRegimenLaboral}`;
        return this._http.get<any>(url, { params: null });
    }

    getGrupoAccion(): Observable<any> {
        let url = this.basePath.plazaEspejoApi + "/grupoaccion/todo";
        return this._http.get<any>(url, { params: null });
    }

    getAccionPorRegimenYGrupoAccion(
        codigoRol: string,
        codigoTipoSede: string,
        idTipoActividad: number,
        idRegimenLaboral: number,
        idGrupoAccion: number
    ): Observable<any> {
        let url = this.basePath.plazaEspejoApi + `/accion/regimenlaboral/${codigoRol}/${codigoTipoSede}/${idTipoActividad}/${idRegimenLaboral}/grupoaccion/${idGrupoAccion}`;
        return this._http.get<any>(url, { params: null });
    }

    getMotivoAccionPorRegimenYGrupoAccionYAccion(
        codigoRol: string,
        codigoTipoSede: string,
        idTipoActividad: number,
        idRegimenLaboral: number,
        idGrupoAccion: number,
        idAccion
    ): Observable<any> {
        let url = this.basePath.plazaEspejoApi + `/motivoaccion/regimenlaboral/${codigoRol}/${codigoTipoSede}/${idTipoActividad}/${idRegimenLaboral}/grupoaccion/${idGrupoAccion}/accion/${idAccion}`;
        return this._http.get<any>(url, { params: null });
    }

    getActividaPaginado(request: any): Observable<any> {
        // let queryParam = new HttpParams({ fromObject: request });
        let url = this.basePath.plazaEspejoApi + "/actividad/paginado";
        return this._http.post<any>(url, request);
    }

    exportarActividad(request: any): Observable<any> {
        let url = this.basePath.plazaEspejoApi + "/actividad/exportar";
        return this._http.post<any>(url, request);
    }

    getActividad(idActividadResolucion: number): Observable<any> {
        let queryParam = new HttpParams();
        queryParam = queryParam.append("idActividadResolucion", idActividadResolucion.toString());
        let url = this.basePath.plazaEspejoApi + `/actividad`;
        return this._http.get<any>(url, { params: queryParam });
    }

    getCargosPoIdeRegimenLaboral(idRegimenLaboral: number, idTipoCargo: number): Observable<any> {
        let url = this.basePath.plazaEspejoApi + `/cargo/regimenlaboral/${idRegimenLaboral}/tipocargo/${idTipoCargo}`;
        return this._http.get<any>(url, { params: null });
    }

    getJornadasLaborales(idTipoCargo: number, idCargo: number): Observable<any> {
        let url = this.basePath.plazaEspejoApi + `/jornadalaboral/tipocargo/${idTipoCargo}/cargo/${idCargo}`;
        return this._http.get<any>(url, { params: null });
    }
    registrarActividad = (request: any): Observable<any> => {
        let url = this.basePath.plazaEspejoApi + "/actividad/registrar";
        return this._http.post<any>(`${url}`, request);
    };
    observarActividad = (request: any): Observable<any> => {
        let url = this.basePath.plazaEspejoApi + "/actividad/observar";
        return this._http.post<any>(`${url}`, request);
    };


    obtenerCentroTrabajoPorCodigoSede = (data: any): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        let url = this.basePath.plazaEspejoApi + "/centrotrabajo/centrotrabajoporcodigosede";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboInstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        var url = this.basePath.plazaEspejoApi + "/instancias/filtroInstancia";
        return this._http.get<any>(url, { params: queryParam });
    }

    getComboSubinstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);
        if (data.idInstancia !== null) queryParam = queryParam.append("idInstancia", data.idInstancia);

        const url = this.basePath.plazaEspejoApi + `/instancias/filtroSubInstancia`;
        return this._http.get<any>(url, { params: queryParam });
    }

    getTipoCentroTrabajo = (idNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.plazaEspejoApi + "/centrotrabajo/tipos";
        return this._http.get<any>(url, { params: queryParam });
    };

    getModalidadEducativa = (): Observable<any> => {
        const url = this.basePath.plazaEspejoApi + "/modalidadeseducativa";
        return this._http.get<any>(url);
    };

    getNivelEducativo = (idModalidadEducativa: any): Observable<any> => {

        const url = this.basePath.plazaEspejoApi + "/niveleducativo/" + idModalidadEducativa;
        return this._http.get<any>(url);
    };

    getDatosDesplazamiento = (numResolucion: any): Observable<any> => {

        const url = this.basePath.plazaEspejoApi + "/desplazamiento?numResolucion=" + numResolucion;
        return this._http.get<any>(url);
    };

    getCentroTrabajoPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.plazaEspejoApi}/centrotrabajo/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    entidadPassport = (pCodigoSede: any): Observable<any> => {
        let queryParam = new HttpParams()
            .set("codigoEntidadSede", pCodigoSede);
        let url = this.basePath.plazaEspejoApi + "/entidades";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
}



