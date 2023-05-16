import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestangularBasePath } from '../base-path/restangular-base-path';

@Injectable({
  providedIn: 'root'
})
export class GestionProcesosService {

  constructor(
    private _http: HttpClient,
    private basePath: RestangularBasePath
    ) {}

  getComboRegimenesLaborales = (pCodigoRolPassport: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoRolPassport", pCodigoRolPassport);
    let url = this.basePath.gestionProcesosApi + "/regimeneslaborales";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getComboTiposProceso = (pCodigoRolPassport: any, pIdRegimenLaboral?: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoRolPassport", pCodigoRolPassport);
      if(pIdRegimenLaboral)
        queryParam = queryParam.set("idRegimenLaboral", pIdRegimenLaboral);

    let url = this.basePath.gestionProcesosApi + "/tiposproceso";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getComboMaestroProcesos = (pCodigoRolPassport: any, pIdRegimenLaboral?: any, pIdTipoProceso?: any, pActivo?: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoRolPassport", pCodigoRolPassport);
      if(pIdRegimenLaboral)
        queryParam = queryParam.set("idRegimenLaboral", pIdRegimenLaboral);
      if(pIdTipoProceso)
        queryParam = queryParam.set("idTipoProceso", pIdTipoProceso);
      if(pActivo)
        queryParam = queryParam.set("activo", pActivo);

    let url = this.basePath.gestionProcesosApi + "/maestroprocesos/lista";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  tieneProcesoAnteriorPendiente = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/procesos/tieneprocesoanteriorpendiente";
    return this._http.post<any>(`${url}`, data);
  };

  getIdProcesoAnioAnterior = (pAnio: any, pCodigoRolPassport: any, pIdRegimenLaboral: any, pIdTipoProceso: any, pIdDescripcionMaestroProceso: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("anio", pAnio)
      .set("codigoRolPassport", pCodigoRolPassport)
      .set("idRegimenLaboral", pIdRegimenLaboral)
      .set("idTipoProceso", pIdTipoProceso)
      .set("idDescripcionMaestroProceso", pIdDescripcionMaestroProceso);
    let url = this.basePath.gestionProcesosApi + "/procesos/procesoanioanterior";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getRegimenesLaborales = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/maestroprocesos/${pIdMaestroProceso}/alcanceregimenlaboral`;
    return this._http.get<any>(`${url}`);
  }

  getTiposPlaza = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/maestroprocesos/${pIdMaestroProceso}/alcancetipoplaza`;
    return this._http.get<any>(`${url}`);
  }

  getCondicionesPlaza = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/maestroprocesos/${pIdMaestroProceso}/alcancecondicionplaza`;
    return this._http.get<any>(`${url}`);
  }

  getFiltroAreasDesempenioCargo = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/maestroprocesos/filtroareadesempeniocargo";
    return this._http.post<any>(`${url}`, data);
  }

  getAreaDesempenioCargos = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/maestroprocesos/${pIdMaestroProceso}/alcanceareadesempeniocargo`;
    return this._http.get<any>(`${url}`);
  }

  getModalidadesNivelesEducativos = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/maestroprocesos/${pIdMaestroProceso}/alcanceniveleducativo`;
    return this._http.get<any>(`${url}`);
  }

  getTiposGestionDependencias = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/maestroprocesos/${pIdMaestroProceso}/alcancetipogestiondependencia`;
    return this._http.get<any>(`${url}`);
  }

  getTiposCentroTrabajo = (pIdMaestroProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/maestroprocesos/${pIdMaestroProceso}/alcancetipocentrotrabajo`;
    return this._http.get<any>(`${url}`);
  }

  consultarCentrosTrabajo = (
    data: any,
    pageIndex: any,
    pageSize: any
  ): Observable<any> => {

    let queryParam = new HttpParams();
    queryParam = queryParam.set("codigoModular", data.pCodigoModular);
    queryParam = queryParam.set("centroTrabajo", data.pCentroTrabajo);
    queryParam = queryParam.set("idRegimenLaboral", data.pIdRegimenLaboral);
    queryParam = queryParam.set("idTipoProceso", data.pIdTipoProceso);
    queryParam = queryParam.set("idDescripcionMaestroProceso", data.pIdDescripcionMaestroProceso);
    queryParam = queryParam.set("activo", data.pActivo);
    queryParam = queryParam.set("paginaActual", pageIndex);
    queryParam = queryParam.set("tamanioPagina", pageSize);

    let url = this.basePath.gestionProcesosApi + "/instancias";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getInstanciasAgrupadas(): Observable<any> {  
    let url = this.basePath.gestionProcesosApi + "/instancias/agrupado";
    return this._http.get<any>(`${url}`);
  }

  getInstancias = (
    pIdInstancia: any
  ): Observable<any> => {
    let queryParam = new HttpParams();
    queryParam = queryParam.set("idInstancia", pIdInstancia);

    let url = this.basePath.gestionProcesosApi + "/cronogramas/instancias";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getSubInstancias = (
    pIdProceso: any,
    pIdInstancia: any,
  ): Observable<any> => {
    let queryParam = new HttpParams()
    .set("idProceso", pIdProceso)
    .set("idInstancia", pIdInstancia);   

    let url = this.basePath.gestionProcesosApi + "/cronogramas/subinstancias";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getCentrosTrabajo = (
    pIdProceso: any,
    pIdInstancia: any,
    pIdSubInstancia: any
  ): Observable<any> => {
    let queryParam = new HttpParams()
    .set("idProceso", pIdProceso)
    .set("idInstancia", pIdInstancia)
    .set("idSubInstancia", pIdSubInstancia);   

    let url = this.basePath.gestionProcesosApi + "/cronogramas/centrostrabajo";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  consultarCentrosTrabajoProcesoExcluidos = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/centrostrabajoexcluidos`;
    return this._http.get<any>(`${url}`);
  }

  consultarAlcanceProcesoRegimenLaboral = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/alcanceregimenlaboral`;
    return this._http.get<any>(`${url}`);
  }

  consultarAlcanceProcesoTipoPlaza = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/alcancetipoplaza`;
    return this._http.get<any>(`${url}`);
  }

  consultarAlcanceProcesoCondicionPlaza = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/alcancecondicionplaza`;
    return this._http.get<any>(`${url}`);
  }

  consultarAlcanceProcesoAreaDesempenioCargo = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/alcanceareadesempeniocargo`;
    return this._http.get<any>(`${url}`);
  }
  
  consultarAlcanceProcesoNivelEducativo = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/alcanceniveleducativo`;
    return this._http.get<any>(`${url}`);
  }

  consultarAlcanceProcesoTipoGestionDependencia = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/alcancetipogestiondependencia`;
    return this._http.get<any>(`${url}`);
  }

  consultarAlcanceProcesoTipoCentroTrabajo = (pIdProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${pIdProceso}/alcancetipocentrotrabajo`;
    return this._http.get<any>(`${url}`);
  }

  obtenerVigenciaInicioEtapaAnterior = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/etapas/vigenciainicio";
    return this._http.post<any>(`${url}`, data);
  };

  actualizarEtapaProceso(data: any) {
    let url = this.basePath.gestionProcesosApi + '/etapas/update-estado-etapa-proceso';
    return this._http.put<any>(`${url}`, data);
  }

  modificarEtapa(data: any) {
    let url = this.basePath.gestionProcesosApi + '/etapas';
    return this._http.put<any>(`${url}`, data);
  }

  getEtapasLista = (pIdMaestroProceso: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idProceso", pIdMaestroProceso);
    let url = this.basePath.gestionProcesosApi + "/etapas/lista";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getEtapas = (data: any, pageIndex: any, pageSize: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/etapas/listaretapas";
    return this._http.post<any>(`${url}`, data);
  }

  getComboEstadosProceso = (): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/estadosproceso";
    return this._http.get<any>(`${url}`);
  };

  getComboEstadosCronograma = (): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/estadoscronograma";
    return this._http.get<any>(`${url}`);
  };

  obtenerPermisoGeneral = (data: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoRolPassport", data);
    let url = this.basePath.gestionProcesosApi + "/permisos/general";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  obtenerPermisoEtapa = (data: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoRolPassport", data);
    let url = this.basePath.gestionProcesosApi + "/permisos/etapa";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  obtenerPermisoCronograma = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/permisos/cronograma";
    return this._http.post<any>(`${url}`, data);
  }

  obtenerPermisoComite = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/permisos/comite";
    return this._http.post<any>(`${url}`, data);
  }
  
  obtenerCronogramas = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas/obtenercronogramas";
    return this._http.post<any>(`${url}`, data);
  }

  obtenerFechaInicioMinima = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas/fechainiciominima";
    return this._http.post<any>(`${url}`, data);
  };

  exportarCronograma = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas/exportar";
    return this._http.post<any>(`${url}`, data);
  }
  
  registrarVigencia = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas/registrarvigencia";
    return this._http.post<any>(`${url}`, data);
  }

  modificarVigencia = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas/modificarvigencia";
    return this._http.post<any>(`${url}`, data);
  }
  
  obtenerEtapas = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/etapas";
    return this._http.post<any>(`${url}`, data);
  }

  calcularDiasVigencia = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/etapas/calculardiasvigencia";
    return this._http.post<any>(`${url}`, data);
  }

  obtenerFeriadosAPartirDeAnioInicio = (anioInicio: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("anioInicio", anioInicio);
    let url = this.basePath.gestionProcesosApi + "/feriados";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  exportarEtapaProceso = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/etapas/exportar";
    return this._http.post<any>(`${url}`, data);
  }

  updateCulminarCronograma = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas/culminar";
    return this._http.put<any>(`${url}`, data);
  }

  updatePublicarCronograma = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas/publicar";
    return this._http.put<any>(`${url}`, data);
  }  

  modificarCronograma = (data: any): Observable<Response> => {
    let url = this.basePath.gestionProcesosApi + "/cronogramas";
    return this._http.post<any>(`${url}`, data);
  }

  findCentroTrabajo = (pCodigoEntidad: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoSedePassport", pCodigoEntidad);
    let url = this.basePath.gestionProcesosApi + "/centrostrabajo";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  entidadPassport = (pCodigoSede: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoEntidadSede", pCodigoSede);
    let url = this.basePath.gestionProcesosApi + "/entidades";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  consultarProcesos = (
    data: any,
    pageIndex: any,
    pageSize: any
  ): Observable<any> => {

    let queryParam = new HttpParams();
    if (data.anio !== null && parseInt(data.anio) > 0) {
      queryParam = queryParam.set("anio", data.anio);
    }
    if (data.idRegimenLaboral !== null && parseInt(data.idRegimenLaboral) > 0) {
      queryParam = queryParam.set("idRegimenLaboral", data.idRegimenLaboral);
    }
    if (data.idTipoProceso !== null && parseInt(data.idTipoProceso) > 0) {
      queryParam = queryParam.set("idTipoProceso", data.idTipoProceso);
    }
    if (data.idDescripcionMaestroProceso !== null && parseInt(data.idDescripcionMaestroProceso) > 0) {
      queryParam = queryParam.set("idDescripcionMaestroProceso", data.idDescripcionMaestroProceso);
    }
    if (data.idEstado !== null && parseInt(data.idEstado) > 0) {
      queryParam = queryParam.set("idEstado", data.idEstado);
    }

    queryParam = queryParam.set("codigoRolPassport", data.codigoRolPassport);
    queryParam = queryParam.set("codigoTipoSede", data.codigoTipoSede);
    queryParam = queryParam.set("idOtraInstancia", data.idOtraInstancia);
    queryParam = queryParam.set("idDre", data.idDre);
    queryParam = queryParam.set("idUgel", data.idUgel);
    queryParam = queryParam.set("idInstitucionEducativa", data.idInstitucionEducativa);
    queryParam = queryParam.set("paginaActual", pageIndex);
    queryParam = queryParam.set("tamanioPagina", pageSize);

    let url = this.basePath.gestionProcesosApi + "/procesos";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  exportarProcesos = (
    data: any
  ): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/procesos/exportar";
    return this._http.post<any>(`${url}`, data);
  }

  getCabeceraProceso = (idProceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/procesos/${idProceso}`;
    return this._http.get<any>(`${url}`);
  };
  
  deleteProceso = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/procesos";
    return this._http.patch<any>(`${url}`, data);
  }

  crearProceso = (proceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/procesos";
    return this._http.post<any>(`${url}`, proceso);
  }

  modificarProceso = (proceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/procesos";
    return this._http.put<any>(`${url}`, proceso);
  }

  crearNuevaConvocatoriaProceso = (proceso: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/procesos/nuevaconvocatoria";
    return this._http.post<any>(`${url}`, proceso);
  }

  // -----------Apis Actuales------

  getComboDescripcionTiposMiembrosComite = (idProceso: any, activo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idProceso", idProceso)
      .set("activo", activo);
    let url = this.basePath.gestionProcesosApi + "/tiposmiembroscomite/descripciones";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getCatalogoItemXCodigoCatalogo = (codigoCatalogo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoCatalogo", codigoCatalogo);
    let url = this.basePath.gestionProcesosApi + "/catalogoitem";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getComboDescripcionCargosNombreComite = (idProceso: any, activo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idProceso", idProceso)
      .set("activo", activo);
    let url = this.basePath.gestionProcesosApi + "/cargoscomite/descripciones";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getComboDescripcionNombresComite = (idProceso: any, activo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idProceso", idProceso)
      .set("activo", activo);
    let url = this.basePath.gestionProcesosApi + "/nombrescomite/descripciones";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getComboTiposDocumentoIdentidad = (): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/tiposdocumentoidentidad";
    return this._http.get<any>(`${url}`);
  };

  buscarMiembroComite = (idTipoDocumentoIdentidad: any, numeroDocumentoIdentidad: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idTipoDocumentoIdentidad", idTipoDocumentoIdentidad)
      .set("numeroDocumentoIdentidad", numeroDocumentoIdentidad);
    let url = this.basePath.gestionProcesosApi + "/comite/buscarmiembrocomite";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getNombresComite = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/nombrescomite";
    return this._http.post<any>(`${url}`, data);
  };

  getTiposMiembroComite = (idNombreComite: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idNombreComite", idNombreComite);
    let url = this.basePath.gestionProcesosApi + "/tiposmiembroscomite";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getCargoComite = (idTipoMiembroComite: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idTipoMiembroComite", idTipoMiembroComite);
    let url = this.basePath.gestionProcesosApi + "/cargoscomite";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getRepresentanteCargo = (idCargoNombreComite: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idCargoNombreComite", idCargoNombreComite);
    let url = this.basePath.gestionProcesosApi + "/representantescargo";
    return this._http.get<any>(`${url}`, { params: queryParam });
  };

  getMiembrosComite = (data: any, pageIndex: any, pageSize: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/comite/listarmiembroscomite";
    return this._http.post<any>(`${url}`, data);
  }

  saveMiembroComite = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/comite";
    return this._http.post<any>(`${url}`, data);
  }

  updateMiembroComite = (data: any): Observable<Response> => {
    let url = this.basePath.gestionProcesosApi + "/comite";
    return this._http.put<any>(`${url}`, data);
  }

  deleteMiembroComite = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/comite/eliminarmiembro";
    return this._http.patch<any>(`${url}`, data);
  }

  obtenerComite = (idComite: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/comite/${idComite}`;
    return this._http.get<any>(`${url}`);
  }
  
  verificarCantidadTitulares = (pIdProceso: any, pIdAlcanceProceso: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idProceso", pIdProceso)
      .set("idAlcanceProceso", pIdAlcanceProceso);
      let url = this.basePath.gestionProcesosApi + "/comite/verificarcantidadtitulares";
      return this._http.get<any>(`${url}`, { params: queryParam });
  }

  exportarComite = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/comite/exportar";
    return this._http.post<any>(`${url}`, data);
  }

  updateAprobarComision = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/comite/aprobarcomite";
    return this._http.put<any>(`${url}`, data);
  }

  getDocumentosComision = (idProceso: any, idAlcanceProceso: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idProceso", idProceso)
      .set("idAlcanceProceso", idAlcanceProceso);
      
    let url = this.basePath.gestionProcesosApi + "/documentopublicado/comite";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getDocumentosCronograma = (data: any): Observable<any> => {      
    let url = this.basePath.gestionProcesosApi + "/documentopublicado/cronograma";
    return this._http.post<any>(`${url}`, data);
  }

  getDocumentosProyectoCronograma = (data: any): Observable<any> => {      
    let url = this.basePath.gestionProcesosApi + "/documentoproyecto/cronograma";
    return this._http.post<any>(`${url}`, data);
  }

  getDocumentosProyectoComite = (idProceso: any, idAlcanceProceso: any): Observable<any> => {    
    let queryParam = new HttpParams()
      .set("idProceso", idProceso)
      .set("idAlcanceProceso", idAlcanceProceso);  
    let url = this.basePath.gestionProcesosApi + "/documentoproyecto/comite";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getDocumentosSustento = (): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/documentosustentos";
    return this._http.get<any>(`${url}`);
  };

  getDocumentoSustentoModificatoria = (idDocumentoSustentoModificatoria: any,): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + `/documentosustentos/${idDocumentoSustentoModificatoria}/modificatoria`;
    return this._http.get<any>(`${url}`);
  };

  updateModificarMiembros = (data: any): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/procesos/modificarmiembros";
    return this._http.put<any>(`${url}`, data);
  }

  getRegimenGrupoAccion = (idProceso: any, codigoGrupoAccion: any, codigoAccion: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idProceso", idProceso)
      .set("codigoGrupoAccion", codigoGrupoAccion)
      .set("codigoAccion", codigoAccion);

    let url = this.basePath.gestionProcesosApi + "/regimengrupoaccion";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  crearProyectoResolucionCronograma(proyectoResolucion: any): Observable<any> {

    let url = this.basePath.gestionProcesosApi + "/cronogramas/generarproyectoresolucion";
    return this._http.post<any>(`${url}`, proyectoResolucion);
  }

  crearProyectoResolucion(proyectoResolucion: any): Observable<any> {

    let url = this.basePath.gestionProcesosApi + "/comite/generarproyectoresolucion";
    return this._http.post<any>(`${url}`, proyectoResolucion);
  }

  getTiposDocumentoSustento(): Observable<any> {

    let url = this.basePath.gestionProcesosApi + "/tiposdocumentossustento";
    return this._http.get<any>(`${url}`);
  }


  getTiposFormatoSustento(): Observable<any> {
    let url = this.basePath.gestionProcesosApi + "/tiposformatosustento";
    return this._http.get<any>(`${url}`);
  }
  
  getTiposResolucion(idDre: any, idUgel: any): Observable<any> {
    let queryParam = new HttpParams()
      .set("idDre", idDre)
      .set("idUgel", idUgel);
    let url = this.basePath.gestionProcesosApi + "/tiposresolucion";
    return this._http.get<any>(`${url}`, { params: queryParam });
  }

  getComboEstadosComite = (): Observable<any> => {
    let url = this.basePath.gestionProcesosApi + "/estadoscomite";
    return this._http.get<any>(`${url}`);
  };

}