import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RestangularBasePath } from "../base-path/restangular-base-path";

@Injectable({
    providedIn: 'root'
})
export class EncargaturaService {
    constructor(
        private http: HttpClient,
        private basePath: RestangularBasePath
    ) {}

    // Desarrollo
    /*getDesarrolloProceso(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/desarrollos/obtener?CodigoTipoSede=${data.codigoTipoSede}&IdSede=${data.iSede}`;
        return this.http.get(url);
    }*/

    // EtapaProceso
    searchProcesoEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        var url = this.basePath.encargaturaApi + "/encargaturas/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro);
    }

    exportProcesoEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/encargaturas/exportar";
        return this.http.post(url, data, { observe: 'response', responseType: 'blob' });
    }

    getEtapaProcesoEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/procesos/obtener?IdEtapaProceso=${data.idEtapaProceso}`;
        return this.http.get(url);
    }

    getDesarrolloProcesoEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/encargaturas/obtener?IdDesarrolloProceso=${data.idDesarrolloProceso}`;
        return this.http.get(url);
    }

    getComboAnio(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/encargaturas/filtros/anio?CodigoTipoSede=${data.codigoTipoSede}&CodigoSede=${data.codigoSede}`;
        return this.http.get<any>(url);
    }

    getComboTipoDocumento(): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/filtros/tipo-documento";
        return this.http.get<any>(url);
    }

    getComboEstadoPostulante(): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/filtros/estado";        
        return this.http.get<any>(url);
    }

    // Regimen Laboral
    getComboRegimenLaboral(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        let url = this.basePath.encargaturaApi + "/regimenes-laborales/filtro";
        return this.http.get<any>(url, { params: queryParam });    
    }
    // Catalogos
    getComboEstadoEtapaDesarrollo(): Observable<any> {
        var url = this.basePath.encargaturaApi + "/catalogos/estado-etapa-desarrollo/filtro";
        return this.http.get<any>(url);
    }

    getComboDescripcionMaestroProceso(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        var url = this.basePath.encargaturaApi + "/catalogos/descripcion-maestro-proceso/filtro";
        return this.http.get<any>(url, { params: queryParam });    
    }

    getComboMotivoNoPublicacion(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/catalogos/motivo-no-publicacion/filtro";
        return this.http.get<any>(url);
    }

    // Plaza Encargatura
    searchPlazaEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro)
    }

    getComboResultadoFinal(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/filtros/resultadofinal";
        return this.http.get<any>(url);
    }

    convokePlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/convocar";
        return this.http.post(url, data);
    }

    exportPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/exportar";
        return this.http.post(url, data, {responseType: 'blob'});
    }

    getPlazaEncargaturaDetalle(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/plazas/obtener/detalle?IdPlazaEncargaturaDetalle=${data}`;
        return this.http.get(url);
    }

    getMotivoNoPublicacionPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/plazas/motivonopublicacion?IdPlazaEncargaturaDetalle=${data}`;
        return this.http.get(url);
    }

    searchDocumentoSustentoPaginado(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/documentos/sustentos/buscar";
        return this.http.post<any>(url, data);
    }

    searchDocumentoPublicadoPaginado(data: any, pageIndex, pageSize): Observable<any> {
        const url = this.basePath.encargaturaApi + "/documentos/publicados/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro);
    }    
    ActualizarEstadoDocumentoPublicado(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/documentos/publicados/ActualizarEstado`;
        return this.http.post<any>(url, data);
    }

    downloadDocumentoPublicado(data: any): Observable<any> {
        const url = this.basePath.documentosApi + `/documentos/${data}`;
        return this.http.get(url, {responseType: 'blob'});
    }

    remarkPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/observar";
        return this.http.post<any>(url, data);
    }

    getComboTipoDocumentoSustento(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/documentos/sustentos/filtros/tipodocumento";
        return this.http.get<any>(url);
    }

    getComboTipoFormatoSustento(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/documentos/sustentos/filtros/tipoformato";
        return this.http.get<any>(url);
    }

    uploadDocumentoSustento(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/documentos/sustentos/upload";
        return this.http.post<any>(url, data);
    }

    downloadDocumentoSustento(data: any): Observable<any> {
        const url = this.basePath.documentosApi + `/documentos/${data}`;
        return this.http.get(url, {responseType: 'blob'});
    }

    publishPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/publicar";
        return this.http.post<any>(url, data);
    }

    Validarexisteplazasprepublicadas(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idPlazaEncargatura !== null) queryParam = queryParam.append("IdPlazaEncargatura", data.idPlazaEncargatura);

        var url = this.basePath.encargaturaApi + "/plazas/Validarexisteplazasprepublicadas";
        return this.http.get<any>(url, { params: queryParam });    
    }
    Validaraperturar(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idPlazaEncargatura !== null) queryParam = queryParam.append("IdPlazaEncargatura", data.idPlazaEncargatura);

        var url = this.basePath.encargaturaApi + "/plazas/Validaraperturar";
        return this.http.get<any>(url, { params: queryParam });    
    }
    validarFinalizarvalidacionPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/validar-finalizar-validacion";
        return this.http.post<any>(url, data);
    }
    validationPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/finalizar-validacion";
        return this.http.post<any>(url, data);
    }
    openPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/aperturar";
        return this.http.post<any>(url, data);
    }

    getPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/plazas/obtener?IdEtapaProceso=${data.IdEtapaProceso}&IdDesarrolloProceso=${data.IdDesarrolloProceso}&CodigoTipoSede=${data.CodigoTipoSede}`;
        return this.http.get(url, data);
    }

    deletePlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/eliminar";
        return this.http.post(url, data);
    }

    migratePlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/migrar-plazas";
        return this.http.post(url, data);
    }

    migratePlazaEncargaturaEtapaIyII(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/migrar-plazas-etapaIyII";
        return this.http.post(url, data);
    }

    migratePlazaEncargaturaEtapaIII(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/plazas/migrar-plazas-etapaIII";
        return this.http.post(url, data);
    }

    getMotivoRechazoPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/plazas/motivo-rechazo?IdPlazaEncargatura=${data.idPlazaEncargatura}`;
        return this.http.get(url, data);
    }

    // Consolidado Plaza
    getConsolidadoPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/plazas/consolidado/obtener?IdConsolidadoPlaza=${data.idConsolidadoPlaza}`;
        return this.http.get(url);
    }

    getComboInstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        var url = this.basePath.encargaturaApi + "/instancias/filtro";
        return this.http.get<any>(url, { params: queryParam });    
    }

    getComboSubinstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
             if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);
             if (data.idInstancia !== null) queryParam = queryParam.append("idInstancia", data.idInstancia);

        const url = this.basePath.encargaturaApi + `/subinstancias/filtro`;
        return this.http.get<any>(url, { params: queryParam });
    }
    getComboEstadoConsolidado(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/catalogos/estado-consolidado/filtro";
        return this.http.get(url);
    }

    searchConsolidadoPlazaEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/consolidado/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro)
    }

    exportConsolidadoPlazaEncargaturaEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/consolidado/exportar";
        return this.http.post(url, data, {responseType: 'blob'});
    }

    approveConsolidadoPlazaEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/consolidado/aprobar";
        return this.http.post(url, data);
    }

    rejectConsolidadoPlazaEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/consolidado/rechazar";
        return this.http.post(url, data);
    }

    bulkApproveConsolidadoPlazaEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/consolidado/aprobar-masivo";
        return this.http.post(url, data);
    }

    generateConsolidadoPlazaEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/consolidado/generar";
        return this.http.post(url, data);
    }

    getAprobacionConsolidadoPlazaEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/plazas/consolidado/obtener-aprobacion?IdEtapaProceso=${data.idEtapaProceso}`;
        return this.http.get(url);
    }

    // Incorporacion
    searchPlazaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/incorporacion/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro)
    }

    getPlaza(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/plazas/incorporacion/obtener?IdPlaza=${data}`;
        return this.http.get(url);
    }

    exportPlaza(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/incorporacion/exportar";
        return this.http.post(url, data, {responseType: 'blob'});
    }

    registerPlaza(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/incorporacion/registrar";
        return this.http.post(url, data);
    }

    // Postulante
    searchPostulanteEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro)
    }

    searchVinculacionVigenteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/vinculacion-vigente";
        const filtro = {
            ...data
        };
        return this.http.post<any>(url, data)
    }

    exportPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/exportar";
        return this.http.post(url, data, {responseType: 'blob'});
    }

    getDatosPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/postulaciones/obtener?IdPostulacion=${data}`;
        return this.http.get(url);
    }

    getDatosPostulantexDniEncargatura(data: any): Observable<any> {
        console.log(data);
        var url = this.basePath.encargaturaApi + `/postulaciones/obtener-postulante?IdTipoDocumento=${data.idTipoDocumento}&Documento=${data.numDocumento}`;
        return this.http.get(url);
    }

    getRegistrarPostulacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/registrar";
        return this.http.post<any>(url, data)
    }

    getActualizarPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/actualizar";
        return this.http.post<any>(url, data)
    }

    getEliminarPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/eliminar";
        return this.http.post<any>(url, data)
    }

    getAprobarPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/aprobar";
        return this.http.post<any>(url, data)
    }
    getSancionesAdministrativasPostulanteEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/postulaciones/sanciones-administrativas?idTipoDocumento=${data.idTipoDocumento}&numDocumento=${data.numDocumento}`;
        return this.http.get(url);
    }
    
    getVinculacionVigenteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/postulaciones/vinculacion-vigente?idTipoDocumento=${data.idTipoDocumento}&numDocumento=${data.numDocumento}`;
        return this.http.get(url, data);
    }

    getValidaSituacionLaboralPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/postulaciones/valida-situacion-laboral?idTipoDocumento=${data.idTipoDocumento}&numDocumento=${data.numDocumento}`;
        return this.http.get(url, data);
    }

    getValidaAntiguedadPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/postulaciones/valida-antiguedad?idTipoDocumento=${data.idTipoDocumento}&numDocumento=${data.numDocumento}`;
        return this.http.get(url, data);
    }

    getEncargaturaRatificadaPostulanteEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + `/postulaciones/encargatura-ratificada?idTipoDocumento=${data.idTipoDocumento}&numDocumento=${data.numDocumento}`;
        return this.http.get(url, data);
    }
    
    validarPostulanteRegistrado(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/validarpostulanteregistrado";
        const filtro = {
            ...data
        };
        return this.http.post<any>(url, filtro)
    }
    Validarexistepostulacionesregistrados(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/Validarexistepostulacionesregistrados";
        const filtro = {
            ...data
        };
        return this.http.post<any>(url, filtro)
    }
    
    ValidarExistePostulacionesAprobadas(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/postulaciones/validarexistepostulancionesaprobadas";
        const filtro = {
            ...data
        };
        return this.http.post<any>(url, filtro)
    }

    getComboEstadoPostulanteEncargartura(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/postulante/filtros/estado";
        return this.http.get<any>(url);
    }

    getComboTipoDocumentoPostulanteEncargatura(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/postulante/filtros/tipo-documento";
        return this.http.get<any>(url);
    }

    loadVinculacionesVigentes(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + '/servidores-publicos/listar';
        return this.http.post(url, data);
    }

    loadSancionesAdministrativas(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/sanciones-administrativas/listar?CodigoTipoDocumentoIdentidad=${data.codigoTipoDocumentoIdentidad}&NumeroDocumentoIdentidad=${data.numeroDocumentoIdentidad}`;
        return this.http.get(url);
    }

    loadServidorPublico(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/servidores-publicos/validar?IdServidorPublico=${data.idServidorPublico}&CodigoEtapa=${data.codigoEtapa}&CodigoModular=${data.codigoModular}&idRegimenLaboral=${data.idRegimenLaboral}`;
        return this.http.get(url);
    }

    getPlazaEncargaturaDetallePorCodigo(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/plazas/buscar/detalle?IdEtapaProceso=${data.idEtapaProceso}&CodigoPlaza=${data.codigoPlaza}&&IdDesarrolloProceso=${data.idDesarrolloProceso}`;
        return this.http.get(url);
    }

    getPlazaPostulacionEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/postulaciones/obtener-plaza?IdPostulacion=${data.idPostulacion}`;
        return this.http.get(url);
    }

    // Calificacion
    searchCalificacionEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro);
    }

    exportCalificacionEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/exportar";
        return this.http.post(url, data, {responseType: 'blob'});
    }

    getComboEstadoCalificacion(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/filtros/estado";
        return this.http.get<any>(url);
    }

    getComboTipoDocumentoCalificacion(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/filtros/tipodocumento";
        return this.http.get<any>(url);
    }

    getComboMotivoObservacionCalificacion() {
        const url = this.basePath.encargaturaApi + "/calificaciones/filtros/tipomotivo";
        return this.http.get<any>(url);
    }

    getDocumentoPublicadoCalificacionEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/calificaciones/documentopublicado?IdEtapaProceso=${data.idEtapaProceso}&CodigoResultadoCalificacion=${data.codigoResultadoCalificacion}`;
        return this.http.get(url);
    }

    getTotalesporEstadoyResultado(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/calificaciones/totalesporestadoyresultado?IdEtapaProceso=${data.idEtapaProceso}&IdDesarrolloProceso=${data.idDesarrolloProceso}&CodigoResultadoCalificacion=${data.codigoResultadoCalificacion}&CodigoEstadoCalificacion=${data.codigoEstadoCalificacion}`;
        return this.http.get(url);
    }

    getTotalesOrdenMerito(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/calificaciones/totalordenmerito?IdEtapaProceso=${data.idEtapaProceso}&IdDesarrolloProceso=${data.idDesarrolloProceso}&CodigoResultadoCalificacion=${data.codigoResultadoCalificacion}`;
        return this.http.get(url);
    }

    remarkCalificacionEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/observarpostulante";
        return this.http.post<any>(url, data);
    }

    claimCalificacionEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/registrarreclamo";
        return this.http.post<any>(url, data);
    }

    getRubrosCalificacion(data: any): Observable<any> {

        let queryParam = new HttpParams();
        if (data.idCalificacion !== null) queryParam = queryParam.append("idCalificacion", data.idCalificacion);
        if (data.idPostulacion !== null) queryParam = queryParam.append("idPostulacion", data.idPostulacion);
        if (data.codigoEtapa !== null) queryParam = queryParam.append("codigoEtapa", data.codigoEtapa);
        if (data.idDesarrolloProceso !== null) queryParam = queryParam.append("idDesarrolloProceso", data.idDesarrolloProceso);
        if (data.codigoTipoSede !== null) queryParam = queryParam.append("codigoTipoSede", data.codigoTipoSede);
        if (data.codigoRolPassport !== null) queryParam = queryParam.append("codigoRolPassport", data.codigoRolPassport);

        let url = this.basePath.encargaturaApi + "/calificaciones/requisitos";
        return this.http.get<any>(url, { params: queryParam });
    }

    registerCalificacionEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/registrar";
        return this.http.post<any>(url, data);
    }

    getCalificacion(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/calificaciones/obtener?IdCalificacion=${data}`;
        return this.http.get(url);
    }

    orderResultadosCalificacion(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/ordenar";
        return this.http.post<any>(url, data);
    }

    ValidacionesPublicacionPreliminarCalificacion(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/validacionespublicacionpreliminar";
        return this.http.post<any>(url, data);
    }

    publishResultadosPreliminarCalificacion(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/preliminar/publicar";
        return this.http.post<any>(url, data);
    }

    validacionespublicacionfinalCalificacion(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/validacionespublicacionfinal";
        return this.http.post<any>(url, data);
    }

    publishResultadosFinalCalificacion(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + "/calificaciones/final/publicar";
        return this.http.post<any>(url, data);
    }

    //Adjudicacion
    searchAdjudicacionEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/buscar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro)
    }

    exportAdjudicacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/exportar";
        return this.http.post(url, data, {responseType: 'blob'});
    }

    searchTotalesAdjudicacionEncargatura(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idDesarrolloProceso !== null) queryParam = queryParam.append("idDesarrolloProceso", data.idDesarrolloProceso);      

        let url = this.basePath.encargaturaApi + "/adjudicaciones/totales";
        return this.http.get<any>(url, { params: queryParam });
    }

    finalizarAdjudicacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/finalizar-adjudicacion";
        return this.http.post<any>(url, data);
    }

    finalizarEtapaAdjudicacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/finalizar-etapa";
        return this.http.post<any>(url, data);
    }

    searchPlazaAdjudicarAdjudicacionEncargatura(data: any, pageIndex, pageSize): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/buscar-plaza-adjudicar";
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize)
        };
        return this.http.post<any>(url, filtro);
    }

    registrarAdjudicarPlazaAdjudicacionEncargaturaPaginado(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/registrar-adjudicar-plaza";
        return this.http.post<any>(url, data);
    }

    registrarNoAdjudicarPlazaAdjudicacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/registrar-no-adjudicar-plaza";
        return this.http.post<any>(url, data);
    }

    registraSubsanarObsAdjudicacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/registrar-subsanar-observacion";
        return this.http.post<any>(url, data);
    }

    buscarSubsanarObsAdjudicacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/buscar-subsanar-observacion";
        return this.http.post<any>(url, data);
    }

    buscarObsAdjudicacionEncargatura(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/buscar-observacion";
        return this.http.post<any>(url, data);
    }
    ValidaAdjudicacionFinalizadaEncargatura(data:any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idDesarrolloProceso !== null) queryParam = queryParam.append("idDesarrolloProceso", data.idDesarrolloProceso);      

        let url = this.basePath.encargaturaApi + "/adjudicaciones/validaadjudicacionfinalizada";
        return this.http.get<any>(url, { params: queryParam });
    }
    ValidarFinalizarEtapaEncargatura(data:any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idDesarrolloProceso !== null) queryParam = queryParam.append("idDesarrolloProceso", data.idDesarrolloProceso);      

        let url = this.basePath.encargaturaApi + "/adjudicaciones/validarfinalizaretapa";
        return this.http.get<any>(url, { params: queryParam });
    }
    validarfinalizarAdjudicacionEncargatura(data:any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idDesarrolloProceso !== null) queryParam = queryParam.append("idDesarrolloProceso", data.idDesarrolloProceso);      

        let url = this.basePath.encargaturaApi + "/adjudicaciones/validarfinalizarAdjudicacion";
        return this.http.get<any>(url, { params: queryParam });
    }
    getComboEstadoAdjudicacionEncargartura(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/adjudicaciones/filtros/estado";
        return this.http.get<any>(url);
    }

    getComboTipoDocumentoAdjudicacionEncargatura(): Observable<any> {
        const url = this.basePath.encargaturaApi + "/adjudicaciones/filtros/tipo-documento";
        return this.http.get<any>(url);
    }

    getComboMotivoNoAdjudicacionEncargatura(): Observable<any>{
        const url = this.basePath.encargaturaApi + "/adjudicaciones/filtros/motivo-no-adjudicado";
        return this.http.get<any>(url);
    }

    getComboTodosEstadoAdjudicacionEncargartura(): Observable<any>  {
        const url = this.basePath.encargaturaApi + "/adjudicaciones/filtros/todos-estado";
        return this.http.get<any>(url);
    }

    getAdjudicacionEncargatura(data: any): Observable<any> {
        const url = this.basePath.encargaturaApi + `/adjudicaciones/obtener?IdAdjudicacion=${data.idAdjudicacion}`;
        return this.http.get<any>(url);
    }
    getAccesoUsuarioDesarrollo(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);      

        let url = this.basePath.encargaturaApi + "/acceso/obtenerAccesoPorEtapaProcesoDesarrollo";
        return this.http.get<any>(url, { params: queryParam });
    }
    getAccesoUsuarioPlaza(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        let url = this.basePath.encargaturaApi + "/acceso/obtenerAccesoPorEtapaProcesoPlaza";
        return this.http.get<any>(url, { params: queryParam });
    }
    getAccesoUsuarioPostulacion(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        let url = this.basePath.encargaturaApi + "/acceso/obtenerAccesoPorEtapaProcesoPostulacion";
        return this.http.get<any>(url, { params: queryParam });
    }
    getAccesoUsuarioCalificacion(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        let url = this.basePath.encargaturaApi + "/acceso/obtenerAccesoPorEtapaProcesoCalificacion";
        return this.http.get<any>(url, { params: queryParam });
    }
    getAccesoUsuarioAdjudicacion(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        let url = this.basePath.encargaturaApi + "/acceso/obtenerAccesoPorEtapaProcesoAdjudicacion";
        return this.http.get<any>(url, { params: queryParam });
    }
    validaescala(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idPostulacion !== null) queryParam = queryParam.append("idPostulacion", data.idPostulacion);
        if (data.idMaestroCriterioCalificacion !== null) queryParam = queryParam.append("idMaestroCriterioCalificacion", data.idMaestroCriterioCalificacion);

        let url = this.basePath.encargaturaApi + "/calificaciones/validaescala";
        return this.http.get<any>(url, { params: queryParam });
    }
    
    getInformeEscalafonario = (data:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.pNumeroInformeEscalafonario) {
          queryParam = queryParam.set('numeroInformeEscalafonario', data.pNumeroInformeEscalafonario);
        }
        if (data.pIdTipoDocumentoIdentidad) {
          queryParam = queryParam.set('idTipoDocumentoIdentidad', data.pIdTipoDocumentoIdentidad);
        }
        if (data.pNumeroDocumentoIdentidad) {
          queryParam = queryParam.set('numeroDocumentoIdentidad', data.pNumeroDocumentoIdentidad);
        }
        let url = this.basePath.encargaturaApi + "/informeescalafonario";
        return this.http.get<any>(url, { params: queryParam });
    }

    getInformePostulante = (data:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idPostulacion) {
          queryParam = queryParam.set('idPostulacion', data.idPostulacion);
        }
        let url = this.basePath.encargaturaApi + "/informeescalafonario/informePostulante";
        return this.http.get<any>(url, { params: queryParam });
    }

    buscarCentrosTrabajoPaginado = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) {
            queryParam = queryParam.set(
                "idNivelInstancia",
                data.idNivelInstancia
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

        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
            queryParam = queryParam.set(
                "idEtapaProceso",
                data.idEtapaProceso
            );
        }  

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);

        let url = this.basePath.encargaturaApi + "/centrostrabajo"; 
        return this.http.get<any>(url, { params: queryParam });
    };
    
    buscarCentrosTrabajoPaginadoAdecuar = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }


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

        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
            queryParam = queryParam.set(
                "idEtapaProceso",
                data.idEtapaProceso
            );
        }  

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);

        let url = this.basePath.encargaturaApi + "/centrostrabajo/adecuacion"; 
        return this.http.get<any>(url, { params: queryParam });
    };

    getDefaultValueComboInstanciasByCodSede = (codSede: any): Observable<any> => {
        let queryParam = new HttpParams();
        
        let url = this.basePath.encargaturaApi + "/subinstancias/instaciaDetallePorCodigoSede";
        if (codSede !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codSede);

        return this.http.get<any>(url, { params: queryParam });
    };
    getTipoCentroTrabajo = (idNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.encargaturaApi + "/centrostrabajo/tipos";
        return this.http.get<any>(url, { params: queryParam });
    };

    getModalidadEducativa = (): Observable<any> => {
        const url = this.basePath.encargaturaApi + "/modalidadeseducativa";
        return this.http.get<any>(url);
    };

    getNivelEducativo = (idModalidadEducativa: any): Observable<any> => {

        const url = this.basePath.encargaturaApi + "/niveleseducativo/"+idModalidadEducativa;        
        return this.http.get<any>(url);
    };

    buscarPlazasTransversalPaginado = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        const filtroPaginado = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize),
        };
        let url = this.basePath.encargaturaApi + "/plazas/incorporacion/buscarTransversal"; 
        return this.http.post<any>(`${url}`, filtroPaginado);
    };

    buscarServidorPublicoTransversal = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.encargaturaApi + "/servidores-publicos/transversal";        
        return this.http.post<any>(`${url}`, filtroPaginado);
    };

    obtenerCentroTrabajoPorCodigoSede = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
       
        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        let url = this.basePath.encargaturaApi + "/centrostrabajo/centrotrabajoporcodigosede";
        return this.http.get<any>(url, { params: queryParam });
    };
    DatosPlaza(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idPlazaEncargaturaDetalle !== null) queryParam = queryParam.append("idPlazaEncargaturaDetalle", data.idPlazaEncargaturaDetalle);

        let url = this.basePath.encargaturaApi + "/plazas/datosPlaza";
        return this.http.get<any>(url, { params: queryParam });
    }
    DatosServidorPublico(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idAdjudicacion !== null) queryParam = queryParam.append("idAdjudicacion", data.idAdjudicacion);

        let url = this.basePath.encargaturaApi + "/adjudicaciones/datosServidorPublico";
        return this.http.get<any>(url, { params: queryParam });
    }
    ActualizarDatosPlaza(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/actualizar-datos-plaza";
        return this.http.post<any>(url, data);
    }
    ActualizarDatosServidorPublico(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/adjudicaciones/actualizar-datos-servidor-publico";
        return this.http.post<any>(url, data);
    }
    totalesConsolidadoPlaza(data: any): Observable<any> {
        var url = this.basePath.encargaturaApi + "/plazas/consolidado/totales";
        return this.http.post<any>(url, data)
    }
    
    entidadPassport = (pCodigoSede: any): Observable<any> => {
        let queryParam = new HttpParams()
            .set("codigoEntidadSede", pCodigoSede);
        let url = this.basePath.encargaturaApi + "/entidades";
        return this.http.get<any>(`${url}`, { params: queryParam });
    };
}