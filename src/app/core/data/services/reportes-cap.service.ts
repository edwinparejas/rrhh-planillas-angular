import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestangularBasePath } from '../base-path/restangular-base-path';

@Injectable({
  providedIn: 'root'
})
export class ReportesCAPService {

  constructor(
    private _http: HttpClient,
    private basePath: RestangularBasePath
    ) {}
  

  entidadPassport = (pCodigoSede: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoEntidadSede", pCodigoSede);
    let url = this.basePath.reportesCAPApi + "/entidades";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getInstancias(activo: any): Observable<any> {
    let queryParam = new HttpParams();
    if (activo !== null) queryParam = queryParam.append("activo", activo);

    var url = this.basePath.reportesCAPApi + "/instancias";
    return this._http.get<any>(url, { params: queryParam });    
  }

  getSubInstancias(idInstancia, activo): Observable<any> {
    let queryParam = new HttpParams();
      if (idInstancia !== null) queryParam = queryParam.append("idInstancia", idInstancia);
      if (activo !== null) queryParam = queryParam.append("activo", activo);

    const url = this.basePath.reportesCAPApi + `/subinstancias`;
    return this._http.get<any>(url, { params: queryParam });
  }
  
  getTipoCentroTrabajo = (codigoNivelInstancia: any, activo: any): Observable<any> => {
    let queryParam = new HttpParams();
    if (codigoNivelInstancia !== null && codigoNivelInstancia > 0) queryParam = queryParam.append("codigoNivelInstancia", codigoNivelInstancia);
    if (activo !== null) queryParam = queryParam.append("activo", activo);

    const url = this.basePath.reportesCAPApi + "/tiposcentrotrabajo";
    return this._http.get<any>(url, { params: queryParam });
  }  

  getModalidadesEducativas(pIdTipoCentroTrabajo, pEsDre) {
    let queryParam: HttpParams = new HttpParams()
        .set("idTipoCentroTrabajo", pIdTipoCentroTrabajo)
        .set("esDre", pEsDre);
    const url = this.basePath.reportesCAPApi + "/modalidadeseducativas";
    return this._http.get<any>(url, { params: queryParam });
  }

  getNivelesEducativos(pIdModalidadEducativa) {
    let queryParam = new HttpParams();
      if (pIdModalidadEducativa !== null) queryParam = queryParam.append("idModalidadEducativa", pIdModalidadEducativa);
    const url = this.basePath.reportesCAPApi + "/niveleseducativos";
    return this._http.get<any>(url, { params: queryParam });
  }

  listarCentroTrabajo(data: any, pageIndex, pageSize) {
    let queryParam = new HttpParams();
    if (data.codigoNivelInstancia !== null && data.codigoNivelInstancia > 0) {
        queryParam = queryParam.set(
            "codigoNivelInstancia",
            data.codigoNivelInstancia
        );
    }
    if (data.idInstancia !== null && data.idInstancia > 0) {
        queryParam = queryParam.set("idInstancia", data.idInstancia);
    }
    if (data.idSubinstancia !== null && data.idSubinstancia > 0) {
        queryParam = queryParam.set("idSubinstancia", data.idSubinstancia);
    }
    if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
        queryParam = queryParam.set(
            "idTipoCentroTrabajo",
            data.idTipoCentroTrabajo
        );
    }
    if ((data.institucionEducativa || "").trim().length !== 0) {
        queryParam = queryParam.set(
            "institucionEducativa",
            data.institucionEducativa
        );
    }
    if (data.registrado !== null) {
        queryParam = queryParam.set("registrado", data.registrado);
    }


    if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) {
        queryParam = queryParam.set(
            "idModalidadEducativa",
            data.idModalidadEducativa
        );
    }
    if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) {
        queryParam = queryParam.set(
            "idNivelEducativo",
            data.idNivelEducativo
        );
    }

    queryParam = queryParam.set("paginaActual", pageIndex);
    queryParam = queryParam.set("tamanioPagina", pageSize);
    let url = this.basePath.reportesCAPApi + "/centrostrabajo";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getRegimenesLaborales = (pCodigoRolPassport: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoRolPassport", pCodigoRolPassport);
    let url = this.basePath.reportesCAPApi + "/regimeneslaborales";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getAreaDesempenioCargos = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.reportesCAPApi + `/maestroprocesos/${pIdMaestroProceso}/alcanceareadesempeniocargo`;
    return this._http.get<any>(`${url}`);
  }

  getAreasDesempenio = (pIdRegimenLaboral: any, pActivo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idRegimenLaboral", pIdRegimenLaboral)
      .set("activo", pActivo);
    let url = this.basePath.reportesCAPApi + "/areasdesempenio";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }  

  getTiposCargo = (pIdRegimenLaboral: any, pIdAreaDesempenioLaboral: any, pActivo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idRegimenLaboral", pIdRegimenLaboral)
      .set("idAreaDesempenioLaboral", pIdAreaDesempenioLaboral)
      .set("activo", pActivo);
    let url = this.basePath.reportesCAPApi + "/tiposcargo";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getCargos = (pIdRegimenLaboral: any, pIdAreaDesempenioLaboral: any, pIdTipoCargo: any, pActivo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idRegimenLaboral", pIdRegimenLaboral)
      .set("idAreaDesempenioLaboral", pIdAreaDesempenioLaboral)
      .set("idTipoCargo", pIdTipoCargo)
      .set("activo", pActivo);
    let url = this.basePath.reportesCAPApi + "/cargos";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  consultarCuadroAsignacionPersonal(data: any, pageIndex, pageSize) {
    let queryParam = new HttpParams();
    if (data.anio !== null && data.anio > 0) { queryParam = queryParam.set('anio', data.anio); }
    if (data.idOtraInstancia !== null && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
    if (data.idInstancia !== null) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
    if (data.idSubinstancia !== null) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
    if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) queryParam = queryParam.set("idTipoCentroTrabajo", data.idTipoCentroTrabajo);
    if (data.codigoNivelInstancia !== null && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
    if (data.codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede); }
    if (data.codigoSede) { queryParam = queryParam.set('codigoSede', data.codigoSede); }
    if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
    if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) { queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo); }
    if (data.codigoCentroTrabajo) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
    if (data.idRegimenLaboral !== null && data.idRegimenLaboral > 0) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
    if (data.idAreaDesempenioLaboral !== null && data.idAreaDesempenioLaboral > 0) { queryParam = queryParam.set('idAreaDesempenioLaboral', data.idAreaDesempenioLaboral); }
    if (data.idTipoCargo !== null && data.idTipoCargo > 0) { queryParam = queryParam.set('idTipoCargo', data.idTipoCargo); }
    if (data.idCargo !== null && data.idCargo > 0) { queryParam = queryParam.set('idCargo', data.idCargo); }
    
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);
    let url = this.basePath.reportesCAPApi + "/plazas/cuadroasignacionpersonal";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }
  
  exportarCuadroAsignacionPersonal = (
    data: any
  ): Observable<any> => {
    let url = this.basePath.reportesCAPApi + "/plazas/cuadroasignacionpersonal";
    return this._http.post<any>(`${url}`, data);
  }

  obtenerIdReporteCAPExistenteEnMes(data: any) {
    let url = this.basePath.reportesCAPApi + "/reportescap/existereportemes";
    return this._http.post<any>(`${url}`, data);
  }

  GenerarReporteCAP(data: any) {    
    let url = this.basePath.reportesCAPApi + "/reportescap";
    return this._http.post<any>(`${url}`, data);
  }
  
  consultarHistorialReportesCAP (data, pageIndex, pageSize) {
    let queryParam = new HttpParams();    
    queryParam = queryParam.set('codigoTipoReporteCAP', data.codigoTipoReporteCAP);
    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
    queryParam = queryParam.set('idDre', data.idDre);
    queryParam = queryParam.set('idUgel', data.idUgel);
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);
    let url = this.basePath.reportesCAPApi + "/reportescap";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }
  
  consultarConsolidadoCentroRegimen(data: any, pageIndex, pageSize) {
    let queryParam = new HttpParams();
    if (data.anio !== null && data.anio > 0) { queryParam = queryParam.set('anio', data.anio); }
    if (data.idOtraInstancia !== null && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
    if (data.idInstancia !== null) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
    if (data.idSubinstancia !== null) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
    if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) queryParam = queryParam.set("idTipoCentroTrabajo", data.idTipoCentroTrabajo);
    if (data.codigoNivelInstancia !== null && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
    if (data.codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede); }
    if (data.codigoSede) { queryParam = queryParam.set('codigoSede', data.codigoSede); }
    if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
    if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) { queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo); }
    if (data.codigoCentroTrabajo) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
    
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);
    let url = this.basePath.reportesCAPApi + "/plazas/consolidadocentroregimen";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  exportarConsolidadoCentroRegimen = (
    data: any
  ): Observable<any> => {
    let url = this.basePath.reportesCAPApi + "/plazas/consolidadocentroregimen";
    return this._http.post<any>(`${url}`, data);
  }

  consultarConsolidadoCentroCargo(data: any, pageIndex, pageSize) {
    let queryParam = new HttpParams();
    if (data.anio !== null && data.anio > 0) { queryParam = queryParam.set('anio', data.anio); }
    if (data.idOtraInstancia !== null && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
    if (data.idInstancia !== null) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
    if (data.idSubinstancia !== null) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
    if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) queryParam = queryParam.set("idTipoCentroTrabajo", data.idTipoCentroTrabajo);
    if (data.codigoNivelInstancia !== null && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
    if (data.codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede); }
    if (data.codigoSede) { queryParam = queryParam.set('codigoSede', data.codigoSede); }
    if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
    if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) { queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo); }
    if (data.codigoCentroTrabajo) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
    
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);
    let url = this.basePath.reportesCAPApi + "/plazas/consolidadocentrocargo";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  exportarConsolidadoCentroCargo = (
    data: any
  ): Observable<any> => {
    let url = this.basePath.reportesCAPApi + "/plazas/consolidadocentrocargo";
    return this._http.post<any>(`${url}`, data);
  }
}