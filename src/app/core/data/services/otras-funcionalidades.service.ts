import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { GlobalUtil } from "./global";

@Injectable({
    providedIn: "root",
})

export class OtrasFuncionalidadesService {
    
    constructor(
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private global: GlobalUtil
        ) {}
    
  getCatalogoItem = (param: any): Observable<any> => {
    let url = `${this.basePath.otrasFuncionalidadesApi}/catalogoitem/obtenerporcodigocatalogo?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
  };

  getMotivoAccion = (param: any): Observable<any> => {
    let url = `${this.basePath.otrasFuncionalidadesApi}/motivoaccion/obtenermotivoaccion?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
  };

  getComboRegimenLaboral = (param: any): Observable<any> => {
      let url = `${this.basePath.otrasFuncionalidadesApi}/regimenlaboral/obtenertodoregimenlaboral?${this.global.formatParameter(param, false)}`;
      return this._http.get<any>(url);
  };

  getComboAreaDesempenio = (param: any): Observable<any> => {
  let url = `${this.basePath.otrasFuncionalidadesApi}/regimenlaboral/obtenerareadesempeniolaboral?${this.global.formatParameter(param, false)}`;
  return this._http.get<any>(url);
  };

  getComboTipoCargo = (param: any): Observable<any> => {
  let url = `${this.basePath.otrasFuncionalidadesApi}/catalogoitem/obtenertipocargoregimenlaboral?${this.global.formatParameter(param, false)}`;
  return this._http.get<any>(url);
  };

  getComboCargo = (param: any): Observable<any> => {
  let url = `${this.basePath.otrasFuncionalidadesApi}/cargo/obtenercargo?${this.global.formatParameter(param, false)}`;
  return this._http.get<any>(url);
  };

  getAtencionReporteSolicitud = (
      param: any,
      pageIndex: any,
      pageSize: any
  ): Observable<any> => {
  
      let queryParam = new HttpParams();
      if (param.anio !== null && parseInt(param.anio) > 0) {
      queryParam = queryParam.set("anio", param.anio);
      } 
      if (param.idRegimenLaboral !== null && param.idRegimenLaboral > 0) {
        queryParam = queryParam.set("idRegimenLaboral", param.idRegimenLaboral);
      }
      if (param.idMotivoAccion !== null && param.idMotivoAccion > 0) {
        queryParam = queryParam.set("idMotivoAccion", param.idMotivoAccion);
      }
      if (param.idEstadoAtencion && param.idEstadoAtencion > 0) {
        queryParam = queryParam.set("idEstadoAtencion", param.idEstadoAtencion);
      }
      if (param.mandatoJudicial) {
        queryParam = queryParam.set("mandatoJudicial", param.mandatoJudicial);
      }
      if (param.idTipoDocumento && param.idTipoDocumento > 0) {
        queryParam = queryParam.set("idTipoDocumento", param.idTipoDocumento);
      }
      if (param.numeroDocumentoIdentidad && param.numeroDocumentoIdentidad.length > 0) {
        queryParam = queryParam.set("numeroDocumentoIdentidad", param.numeroDocumentoIdentidad);
      }
      if (param.codigoPlaza && param.codigoPlaza.length > 0) {
        queryParam = queryParam.set("codigoPlaza", param.codigoPlaza);
      }
      if (param.fechaFin && param.fechaInicio) {
        queryParam = queryParam.set("fechaFin", param.fechaFin);
        queryParam = queryParam.set("fechaInicio", param.fechaInicio);
      }
      if (param.codigoModular && param.codigoModular > 0) {
        queryParam = queryParam.set("codigoModular", param.codigoModular);
      }
      if (param.idAreaDesempenioLaboral && param.idAreaDesempenioLaboral > 0) {
        queryParam = queryParam.set("idAreaDesempenioLaboral", param.idAreaDesempenioLaboral);
      }
      if (param.idTipoCargo && param.idTipoCargo > 0) {
        queryParam = queryParam.set("idTipoCargo", param.idTipoCargo);
      }
      if (param.idCargo && param.idCargo > 0) {
        queryParam = queryParam.set("idCargo", param.idCargo);
      }
      queryParam = queryParam.set("paginaActual", pageIndex);
      queryParam = queryParam.set("tamanioPagina", pageSize);

      let url = this.basePath.otrasFuncionalidadesApi + "/atencion/solicitudpaginado";
      return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getAtencionReporteDirecto = (
    param: any,
    pageIndex: any,
    pageSize: any
  ): Observable<any> => {

    let queryParam = new HttpParams();
    if (param.anio !== null && parseInt(param.anio) > 0) {
    queryParam = queryParam.set("anio", param.anio);
    } 
    if (param.idRegimenLaboral !== null && param.idRegimenLaboral > 0) {
      queryParam = queryParam.set("idRegimenLaboral", param.idRegimenLaboral);
    }
    if (param.idMotivoAccion !== null && param.idMotivoAccion > 0) {
      queryParam = queryParam.set("idMotivoAccion", param.idMotivoAccion);
    }
    if (param.idEstadoAtencion && param.idEstadoAtencion > 0) {
      queryParam = queryParam.set("idEstadoAtencion", param.idEstadoAtencion);
    }
    if (param.mandatoJudicial) {
      queryParam = queryParam.set("mandatoJudicial", param.mandatoJudicial);
    }
    if (param.idTipoDocumento && param.idTipoDocumento > 0) {
      queryParam = queryParam.set("idTipoDocumento", param.idTipoDocumento);
    }
    if (param.numeroDocumentoIdentidad && param.numeroDocumentoIdentidad.length > 0) {
      queryParam = queryParam.set("numeroDocumentoIdentidad", param.numeroDocumentoIdentidad);
    }
    if (param.codigoPlaza && param.codigoPlaza.length > 0) {
      queryParam = queryParam.set("codigoPlaza", param.codigoPlaza);
    }
    if (param.fechaFin && param.fechaInicio) {
      queryParam = queryParam.set("fechaFin", param.fechaFin);
      queryParam = queryParam.set("fechaInicio", param.fechaInicio);
    }
    if (param.codigoModular && param.codigoModular > 0) {
      queryParam = queryParam.set("codigoModular", param.codigoModular);
    }
    if (param.idAreaDesempenioLaboral && param.idAreaDesempenioLaboral > 0) {
      queryParam = queryParam.set("idAreaDesempenioLaboral", param.idAreaDesempenioLaboral);
    }
    if (param.idTipoCargo && param.idTipoCargo > 0) {
      queryParam = queryParam.set("idTipoCargo", param.idTipoCargo);
    }
    if (param.idCargo && param.idCargo > 0) {
      queryParam = queryParam.set("idCargo", param.idCargo);
    }
    queryParam = queryParam.set("paginaActual", pageIndex);
    queryParam = queryParam.set("tamanioPagina", pageSize);

    let url = this.basePath.otrasFuncionalidadesApi + "/atencion/directopaginado";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getExportarAtencionReporteSolicitud = (
    param: any
  ): Observable<any> => {

    let queryParam = new HttpParams();
    if (param.anio !== null && parseInt(param.anio) > 0) {
    queryParam = queryParam.set("anio", param.anio);
    } 
    if (param.idRegimenLaboral !== null && param.idRegimenLaboral > 0) {
      queryParam = queryParam.set("idRegimenLaboral", param.idRegimenLaboral);
    }
    if (param.idMotivoAccion !== null && param.idMotivoAccion > 0) {
      queryParam = queryParam.set("idMotivoAccion", param.idMotivoAccion);
    }
    if (param.idEstadoAtencion && param.idEstadoAtencion > 0) {
      queryParam = queryParam.set("idEstadoAtencion", param.idEstadoAtencion);
    }
    if (param.mandatoJudicial) {
      queryParam = queryParam.set("mandatoJudicial", param.mandatoJudicial);
    }
    if (param.idTipoDocumento && param.idTipoDocumento > 0) {
      queryParam = queryParam.set("idTipoDocumento", param.idTipoDocumento);
    }
    if (param.numeroDocumentoIdentidad && param.numeroDocumentoIdentidad.length > 0) {
      queryParam = queryParam.set("numeroDocumentoIdentidad", param.numeroDocumentoIdentidad);
    }
    if (param.codigoPlaza && param.codigoPlaza.length > 0) {
      queryParam = queryParam.set("codigoPlaza", param.codigoPlaza);
    }
    if (param.fechaFin && param.fechaInicio) {
      queryParam = queryParam.set("fechaFin", param.fechaFin);
      queryParam = queryParam.set("fechaInicio", param.fechaInicio);
    }
    if (param.codigoModular && param.codigoModular > 0) {
      queryParam = queryParam.set("codigoModular", param.codigoModular);
    }
    if (param.idAreaDesempenioLaboral && param.idAreaDesempenioLaboral > 0) {
      queryParam = queryParam.set("idAreaDesempenioLaboral", param.idAreaDesempenioLaboral);
    }
    if (param.idTipoCargo && param.idTipoCargo > 0) {
      queryParam = queryParam.set("idTipoCargo", param.idTipoCargo);
    }
    if (param.idCargo && param.idCargo > 0) {
      queryParam = queryParam.set("idCargo", param.idCargo);
    }

    let url = this.basePath.otrasFuncionalidadesApi + "/atencion/exportar";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getAtencionReporteIdAtencion = (
  idAtencionReporte: any
  ): Observable<any> => {
  
  let queryParam = new HttpParams();
  queryParam = queryParam.set("idAtencionReporte", idAtencionReporte);
  
  let url = this.basePath.otrasFuncionalidadesApi + "/atencion";
  return this._http.get<any>(`${url}`, { params: queryParam });
  };
  
  getDocumentoSustento = (
  idDocumentoSustento: any
  ): Observable<any> => {
  
  let queryParam = new HttpParams();
  queryParam = queryParam.set("idDocumentoSustento", idDocumentoSustento);
  
  let url = this.basePath.otrasFuncionalidadesApi + "/reporte/documentosustento";
  return this._http.get<any>(`${url}`, { params: queryParam });
  };
  
  getPersonaTransversal = (param: any, pageIndex, pageSize): Observable<any> => {
  let queryParam = new HttpParams();
  if(param.idTipoDocumentoIdentidad)
      queryParam = queryParam.set("idTipoDocumentoIdentidad", param.idTipoDocumentoIdentidad);
  if(param.numeroDocumentoIdentidad)
      queryParam = queryParam.set("numeroDocumentoIdentidad", param.numeroDocumentoIdentidad);
  if(param.nombres)          
      queryParam = queryParam.set("nombres", param.nombres);
  if(param.primerApellido)
      queryParam = queryParam.set("primerApellido", param.primerApellido);
  if(param.segundoApellido)
      queryParam = queryParam.set("segundoApellido", param.segundoApellido);
  if(param.idCentroTrabajo)
      queryParam = queryParam.set("codigoCentroTrabajo", param.idCentroTrabajo);
  
  queryParam = queryParam.set("paginaActual", pageIndex);
  queryParam = queryParam.set("tamanioPagina", pageSize);
      
  let url = this.basePath.otrasFuncionalidadesApi + "/persona/obtenerpersona/";
  return this._http.get(`${url}`, {params: queryParam});
  };

  getCodigoPlazaTransversal = (param: any, pageIndex, pageSize): Observable<any> => {
    let queryParam = new HttpParams();
    if(param.codigoSede)
        queryParam = queryParam.set("codigoSede", param.codigoSede);
    if(param.codigoPlaza)
        queryParam = queryParam.set("codigoPlaza", param.codigoPlaza);
    if(param.idRegimenLaboral)
        queryParam = queryParam.set("idRegimenLaboral", param.idRegimenLaboral);
    if(param.centroTrabajo)
        queryParam = queryParam.set("centroTrabajo", param.centroTrabajo);
    if(param.codigoCentroTrabajo)
        queryParam = queryParam.set("codigoCentroTrabajo", param.codigoCentroTrabajo);
    if(param.codigoTipoSede)
        queryParam = queryParam.set("codigoTipoSede", param.codigoTipoSede);
    if(param.codigoRol)
        queryParam = queryParam.set("codigoRol", param.codigoRol);
    
    queryParam = queryParam.set("paginaActual", pageIndex);
    queryParam = queryParam.set("tamanioPagina", pageSize);
        
    let url = this.basePath.otrasFuncionalidadesApi + "/plaza/obtenercodigoplaza/";
    return this._http.get(`${url}`, {params: queryParam});
  };

  getCodigoModularTransversal(data: any, pageIndex, pageSize) {
    let queryParam = new HttpParams();
    // if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) {
    //     queryParam = queryParam.set(
    //         "idNivelInstancia",
    //         data.idNivelInstancia
    //     );
    // }
    // if (data.idInstancia !== null && data.idInstancia > 0) {
    //     queryParam = queryParam.set("idInstancia", data.idInstancia);
    // }
    // if (data.idSubinstancia !== null && data.idSubinstancia > 0) {
    //     queryParam = queryParam.set("idSubinstancia", data.idSubinstancia);
    // }
    // if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
    //     queryParam = queryParam.set(
    //         "idTipoCentroTrabajo",
    //         data.idTipoCentroTrabajo
    //     );
    // }
    // if ((data.institucionEducativa || "").trim().length !== 0) {
    //     queryParam = queryParam.set(
    //         "institucionEducativa",
    //         data.institucionEducativa
    //     );
    // }
    // if (data.registrado !== null) {
    //     queryParam = queryParam.set("registrado", data.registrado);
    // }


    // if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) {
    //     queryParam = queryParam.set(
    //         "idModalidadEducativa",
    //         data.idModalidadEducativa
    //     );
    // }

    // if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) {
    //     queryParam = queryParam.set(
    //         "idNivelEducativo",
    //         data.idNivelEducativo
    //     );
    // }

    // if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
    //     queryParam = queryParam.set(
    //         "idEtapaProceso",
    //         data.idEtapaProceso
    //     );
    // }

    queryParam = queryParam.set("paginaActual", pageIndex);
    queryParam = queryParam.set("tamanioPagina", pageSize);

    const url = `${this.basePath.otrasFuncionalidadesApi}/centrotrabajo`;

    return this._http.get(url, { params: queryParam });
  };

  getServidorPublicoTransversal = (param: any): Observable<any> => {
  let url = this.basePath.otrasFuncionalidadesApi + `/servidorpublico/obtenerservidorpublico?${this.global.formatParameter(param, false)}`;
  return this._http.get(`${url}`);
  };
  
  postAtencionReporte = (data: any): Observable<any> => {
  let url = `${this.basePath.otrasFuncionalidadesApi}/atencion`;
  return this._http.post<any>(`${url}`, data);
  };
  
  putAtencionReporte = (data: any): Observable<any> => {
  let url = `${this.basePath.otrasFuncionalidadesApi}/atencion`;
  return this._http.put<any>(`${url}`, data);
  };
  
  deleteAtencionReporte = (data: any): Observable<any> => {
  let queryParam = new HttpParams();
  queryParam = queryParam.set("idAtencionReporte", data.idAtencionReporte);
  
  let url = `${this.basePath.otrasFuncionalidadesApi}/atencion`;
  return this._http.delete<any>(`${url}`, { params: queryParam });
  };
  
  putObservarAtencionReporte = (data: any): Observable<any> => {
    let url = `${this.basePath.otrasFuncionalidadesApi}/atencion/observar`;
    return this._http.put<any>(`${url}`, data);
  };

}