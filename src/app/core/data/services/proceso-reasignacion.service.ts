import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { ReasignacionesRestangularService } from './resources/reasignaciones-restangular.service';
import { StorageService } from './storage.service';
import { RestangularBasePath } from '../base-path/restangular-base-path';


@Injectable({
    providedIn: 'root'
})
export class ProcesoReasignacionService {

    objeto$ = new EventEmitter();

    constructor(
        private restangular: ReasignacionesRestangularService,
        private storageService: StorageService,
        private _http: HttpClient,
        private basePath: RestangularBasePath) { }


    getValidarActualizacionServidorPublico = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        queryParam = queryParam.set('idPostulacion', data.idPostulacion);
        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        queryParam = queryParam.set('codigoSede', data.codigoSede);
        // return this.restangular.all("adjudicaciones").all("validaServidorPublico").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/validaServidorPublico";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
    actualizarValidacionServidorPublico(data: any): Observable<any> {
        // return this.restangular.all('adjudicaciones/ActualizarValidacionServidorPublico').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/ActualizarValidacionServidorPublico";
        return this._http.post<any>(url, data);
    }
    getValidarActualizacionPlaza  = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        queryParam = queryParam.set('codigoSede', data.codigoSede);
        queryParam = queryParam.set('idPlaza', data.idPlaza);
        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        // return this.restangular.all("adjudicaciones").all("validaPlaza").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/validaPlaza";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
    actualizarValidacionPlaza(data: any): Observable<any> {
        // return this.restangular.all('adjudicaciones/ActualizarValidacionPlaza').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/ActualizarValidacionPlaza";
        return this._http.post<any>(url, data);
    }
    getValidarAdjudicacionPorOrden(data: any): Observable<any> {
        // return this.restangular.all('adjudicaciones/ValidarAdjudicacionPorOrden').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/ValidarAdjudicacionPorOrden";
        return this._http.post<any>(url, data);
    }
        
    getComboRegimenLaboral = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('regimenLaboral').get();
        let url = this.basePath.reasignacionesApi + "/regimenLaboral";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboEstado = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('estadoEtapaProceso').get();
        let url = this.basePath.reasignacionesApi + "/estadoEtapaProceso";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboInstancia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('instancia').get();
        let url = this.basePath.reasignacionesApi + "/instancia";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboSubInstancia = (activo: any = null): Observable<any>=> {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('subInstancia').get();
        let url = this.basePath.reasignacionesApi + "/subInstancia";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboEstadoConsolidado = (): Observable<any> => {
        // return this.restangular.all('estadoConsolidado').get();
        let url = this.basePath.reasignacionesApi + "/estadoConsolidado";
        return this._http.get<any>(url);     
    }

    getCentroTrabajoUsuario = (data: any): Observable<any> => {
        // data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        console.log("codigo de sede en sesion: "+this.storageService.getPassportRolSelected().CODIGO_SEDE);
        console.log("codigo de sede que se envia a back metodo getCentroTrabajoUsuario: "+data.codigoSede);
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoSede', data.codigoSede);
        let url = this.basePath.reasignacionesApi + "/centrostrabajo";
        return this._http.get<any>(url, { params: queryParam });
    };

    entidadPassport = (codigoEntidadSede: string): Observable<any> => {
        let queryParam = new HttpParams()
            .set("codigoEntidadSede", codigoEntidadSede);

        const url = `${this.basePath.reasignacionesApi}/centrostrabajo/entidadPassport`;
        return this._http.get(url, { params: queryParam });

    }

    aprobarMasivoConsolidado = (data: any) => {
        // return this.restangular.all('aprobarMasivoConsolidado').put(data);
        let url = this.basePath.reasignacionesApi + "/aprobarMasivoConsolidado";
        return this._http.put<any>(url,data);    
    }

    getBuscarEtapaProceso = (data: any) => {
        // return this.restangular.all('buscarEtapaProceso').post(data);
        let url = this.basePath.reasignacionesApi + "/buscarEtapaProceso";
        return this._http.post<any>(url,data);   
    }
    getValidarPlaza = (data: any) => {
        // return this.restangular.all('validacionPlaza').post(data);
        let url = this.basePath.reasignacionesApi + "/validacionPlaza";
        return this._http.post<any>(url,data);   
    }
    getInsertPlazaReasignacion = (data: any) => {
        // return this.restangular.all('insertPlazaReasignacion').put(data);
        let url = this.basePath.reasignacionesApi + "/insertPlazaReasignacion";
        return this._http.put<any>(url,data);   
    }
    exportarEtapaProceso(data: any): Observable<any> {
        // return this.restangular.all('exportarEtapaProceso').post(data);
        let url = this.basePath.reasignacionesApi + "/exportarEtapaProceso";
        return this._http.post<any>(url,data);   
    }
    exportarPrePublicarPlazas(data: any): Observable<any> {
        // return this.restangular.all('exportarPrePublicarPlaza').post(data);
        let url = this.basePath.reasignacionesApi + "/exportarPrePublicarPlaza";
        return this._http.post<any>(url,data);  
    }
    exportarPostulantes(data: any): Observable<any> {
        // return this.restangular.all('exportarPostulante').post(data);
        let url = this.basePath.reasignacionesApi + "/exportarPostulante";
        return this._http.post<any>(url,data); 
    }
    
    pdfPrePublicar = (data: any): Observable<any> => {
        // return this.restangular.all('pdfPrePublicar').post(data);
        let url = this.basePath.reasignacionesApi + "/pdfPrePublicar";
        return this._http.post<any>(url,data); 
    }

    getBuscarCancelacionEtapaProceso = (data: any) => {
        // return this.restangular.all('buscarCancelacionEtapaProceso').post(data);
        let url = this.basePath.reasignacionesApi + "/buscarCancelacionEtapaProceso";
        return this._http.post<any>(url,data); 
    }

    getListAgregarPlazas = (data: any, pageIndex, pageSize) => {
        data.pageIndex = pageIndex;
        data.pageSize = pageSize;
        // return this.restangular.all('listAgregarPlazas').post(data);
        let url = this.basePath.reasignacionesApi + "/listAgregarPlazas";
        return this._http.post<any>(url,data); 
    }
    
    getListConvocarObservar = (data: any, pageIndex, pageSize) => {
        data.pageIndex = pageIndex;
        data.pageSize = pageSize;
        // return this.restangular.all('listConvocarObservar').post(data);
        let url = this.basePath.reasignacionesApi + "/listConvocarObservar";
        return this._http.post<any>(url,data); 
    }

    getAprobarRechazarConsolidado = (data: any) => {
        // return this.restangular.all('aprobarRechazarConsolidado').put(data);
        let url = this.basePath.reasignacionesApi + "/aprobarRechazarConsolidado";
        return this._http.put<any>(url,data); 
    }

    getPrePublicarAperturarPlazas = (data: any) => {
        // return this.restangular.all('updatePrePublicarPlazas').put(data);
        let url = this.basePath.reasignacionesApi + "/updatePrePublicarPlazas";
        return this._http.put<any>(url,data); 
    }

    getObservarReasignarPlaza = (data: any) => {
        // return this.restangular.all('updateObservarReasignar').put(data);
        let url = this.basePath.reasignacionesApi + "/updateObservarReasignar";
        return this._http.put<any>(url,data); 
    }

    reasignarPlazas(data: any): Observable<any> {
        // return this.restangular.all('prepublicacionplazas/reasignarPlazas').put(data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/reasignarPlazas";
        return this._http.put<any>(url,data); 
    }

    getAsignarPlaza = (data: any) => {
        // return this.restangular.all('prepublicacionplazas/agregarPlazas').put(data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/agregarPlazas";
        return this._http.put<any>(url,data); 
    }

    getListPlazasPrePublicar = (data: any, pageIndex, pageSize) => {
        data.pageIndex = pageIndex;
        data.pageSize = pageSize;
        // return this.restangular.all('listPrePublicarPlazas').post(data);
        let url = this.basePath.reasignacionesApi + "/listPrePublicarPlazas";
        return this._http.post<any>(url,data); 
    }


    getComboTipodocumento = (activo: any = null): Observable<any> => {
        // return this.restangular.all('tipoDocumento').get();
        let url = this.basePath.reasignacionesApi + "/tipoDocumento";
        return this._http.get<any>(url); 
    }

    getBuscarServidor = (data) => {
        // return this.restangular.all('buscarPostulante').post(data);
        let url = this.basePath.reasignacionesApi + "/buscarPostulante";
        return this._http.post<any>(url,data); 
    }

    getBuscarModificar = (data) => {
        // return this.restangular.all('buscarModificar').post(data);
        let url = this.basePath.reasignacionesApi + "/buscarModificar";
        return this._http.post<any>(url,data); 
    }

    getValidadorAscenso = (data) => {
        // return this.restangular.all('ascensoPostulante').post(data);
        let url = this.basePath.reasignacionesApi + "/ascensoPostulante";
        return this._http.post<any>(url,data); 
    }

    getLicencia = (data) => {
        // return this.restangular.all('licenciaPostulante').post(data);
        let url = this.basePath.reasignacionesApi + "/licenciaPostulante";
        return this._http.post<any>(url,data); 
    }

    getBuscarConsolidado = (data) => {
        // return this.restangular.all('buscarConsolidado').post(data);
        let url = this.basePath.reasignacionesApi + "/buscarConsolidado";
        return this._http.post<any>(url,data); 
    }

    getListarServidoresPublico = (data) => {
        // return this.restangular.all('listarServidorPublico').post(data);
        let url = this.basePath.reasignacionesApi + "/listarServidorPublico";
        return this._http.post<any>(url,data); 
    }

    getAprobarPostulantes = (data) => {
        // return this.restangular.all('aprobarPostulante').put(data);
        let url = this.basePath.reasignacionesApi + "/aprobarPostulante";
        return this._http.put<any>(url,data); 
    }

    aprobarPostulacion = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('postulaciones').all('aprobar').post(data);
        let url = this.basePath.reasignacionesApi + "/postulaciones/aprobar";
        return this._http.post<any>(url,data); 
    };

    getInsertarPostulante = (data) => {
        // return this.restangular.all('agregarPostulante').put(data);
        let url = this.basePath.reasignacionesApi + "/agregarPostulante";
        return this._http.put<any>(url,data); 
    }

    getModificarPostulante = (data) => {
        // return this.restangular.all('modificarPostulante').put(data);
        let url = this.basePath.reasignacionesApi + "/modificarPostulante";
        return this._http.put<any>(url,data); 
    }

    getInformeEscalafonario = (pIdTipoDocumentoIdentidad, pNumeroDocumentoIdentidad, pNumeroInformeEscalafonario): Observable<any> => {
        let queryParam = new HttpParams();
        if (pNumeroInformeEscalafonario) {
            queryParam = queryParam.set('numeroInformeEscalafonario', pNumeroInformeEscalafonario);
        }
        if (pIdTipoDocumentoIdentidad) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', pIdTipoDocumentoIdentidad);
        }
        if (pNumeroDocumentoIdentidad) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', pNumeroDocumentoIdentidad);
        }
        // return this.restangular.all('informeescalafonario').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/informeescalafonario";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getVinculacionPostulante =  (data) => {
        // return this.restangular.all('servidorespublicos').all('vinculaciones').get(data);
        let queryParam = new HttpParams();

        if (data.idTipoDocumentoIdentidad !== null && data.idTipoDocumentoIdentidad > 0) {
            queryParam = queryParam.set("idTipoDocumentoIdentidad", data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null && data.numeroDocumentoIdentidad != '') {
            queryParam = queryParam.set("numeroDocumentoIdentidad", data.numeroDocumentoIdentidad);
        }
        let url = this.basePath.reasignacionesApi + "/servidorespublicos/vinculaciones";
        // return this._http.get<any>(url,data); 
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    insertarPostulacion = (data: any): Observable<any> => {
        data.codigoRolPassport = this.storageService.getPassportRolSelected().CODIGO_ROL;
        // return this.restangular.all('postulaciones').all('registrar').post(data);
        let url = this.basePath.reasignacionesApi + "/postulaciones/registrar";
        return this._http.post<any>(url,data); 
    };

    modificarPostulacion = (data: any): Observable<any> => {
        data.codigoRolPassport = this.storageService.getPassportRolSelected().CODIGO_ROL;
        // return this.restangular.all('postulaciones').all('modificar').post(data);
        let url = this.basePath.reasignacionesApi + "/postulaciones/modificar";
        return this._http.post<any>(url,data); 
    };

    getValidarPublicacion = (data): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        // return this.restangular.all("postulaciones").all("validarpublicacion").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/postulaciones/validarpublicacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    
    exportarPostulacion = (data: any): Observable<any> => {
        // return this.restangular.all('postulaciones').all('exportar').post(data);
        let url = this.basePath.reasignacionesApi + "/postulaciones/exportar";
        return this._http.post<any>(url,data); 
    };

    getConsolidadoPlazas = (data: any, pageIndex, pageSize) => {
        data.pageIndex = pageIndex;
        data.pageSize = pageSize;
        // return this.restangular.all('listarConsolidado').post(data);
        let url = this.basePath.reasignacionesApi + "/listarConsolidado";
        return this._http.post<any>(url,data); 
    }

    getListaprocesos = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idEstadoProceso !== null) {
            queryParam = queryParam.set('idEstadoProceso', data.idEstadoProceso);
        }
        if (data.codigoRolPassport !== null) {
            queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('procesos/etapas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/procesos/etapas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    exportarExcelReasignacion(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idEstadoProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEstadoProceso !== null) {
            queryParam = queryParam.set('idEstado', data.idEstado);
        }
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        if (data.codigoRolPassport !== null) {
            queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);
        }
        return this.restangular.all('procesos/etapas/exportar/').download(null, queryParam);
    }

    getEtapaById = (idEtapa) => {
        // return this.restangular.one('etapas', idEtapa).get();
        let url = this.basePath.reasignacionesApi + "/etapas/"+idEtapa;
        return this._http.get<any>(url); 
    }

    getListaplazasPrepublicadas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idResumenPlaza !== null) {
            queryParam = queryParam.set('idResumenPlaza', data.idResumenPlaza);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazas/prepublicadas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazas/prepublicadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    ExportaExcelPlazasPrepublicadas(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        return this.restangular.all('plazas/prepublicadas/exportar').download(null, queryParam);
    }

    getPlazaById = (idPlaza) => {
        // return this.restangular.one('plazas', idPlaza).get();
        let url = this.basePath.reasignacionesApi + "/plazas/"+idPlaza;
        return this._http.get<any>(url); 
    }

    observarPlazas(data: any): Observable<any> {
        // return this.restangular.all('prepublicacionplazas/observarPlazas').put(data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/observarPlazas";
        return this._http.put<any>(url,data); 
    }

    getComboMotivoNoPublicacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('motivosnopublicacion').get();
        let url = this.basePath.reasignacionesApi + "/motivosnopublicacion";
        return this._http.get<any>(url); 
    }

    getComboTipoSustento = (codigoTipoOperacion: any = null, activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoTipoOperacion !== null) {
            queryParam = queryParam.set('codigoTipoOperacion', codigoTipoOperacion);
        }
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposdocumentosustento').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposdocumentosustento";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboTipoFormato = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposformato').get();
        let url = this.basePath.reasignacionesApi + "/tiposformato";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    listarCentroTrabajo = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idInstancia !== null && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia !== null && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('centrostrabajo').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/centrostrabajo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getInstancia = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('instancias').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/instancias";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getSubinstancia = (idInstancia: any, activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        if (idInstancia !== null) { queryParam = queryParam.set('idInstancia', idInstancia); }

        // return this.restangular.all('instancias/subinstancias').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/instancias/subinstancias";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getTipoCentroTrabajo = (idNivelInstancia: any, activo: any) => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', idNivelInstancia); }
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('tiposcentrotrabajo').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposcentrotrabajo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getDefaultValueComboInstanciasByCodSede = (codSede: any): Observable<any> => {
        let queryParam = new HttpParams();     
        if (codSede !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codSede);
        // return this.restangular.all('instancias/instaciaDetallePorCodigoSede').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/instancias/instaciaDetallePorCodigoSede";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getListaPlaza = (data: any,pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.codigoPlaza !== null) {queryParam = queryParam.set('codigoPlaza',data.codigoPlaza);}
        if (data.descripcionCentroTrabajo !== null) {queryParam = queryParam.set('descripcionCentroTrabajo',data.descripcionCentroTrabajo);}
        if (data.codigoCentroTrabajo !== null) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);}
        if (data.idRegimenLaboral !== null) {queryParam = queryParam.set('idRegimenLaboral',data.idRegimenLaboral);}
        if (data.tipoFormato !== null) {queryParam = queryParam.set('tipoFormato',data.tipoFormato);}
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboCausal = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('causalPostulante').get();
        let url = this.basePath.reasignacionesApi + "/causalPostulante";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboEtapaPostulante = (activo: any = null) => {
        // return this.restangular.all('etapaPostulante').get();
        let url = this.basePath.reasignacionesApi + "/etapaPostulante";
        return this._http.get<any>(url); 
    }

    getComboOrigenesRegistro = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('origenesregistro').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/origenesregistro";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboEstadosPostulacion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('estadoPostulante').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/estadoPostulante";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboTipoVia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposvia').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposvia";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboTipoZona = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposzona').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposzona";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboDepartamento = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('departamentos').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/departamentos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboProvincia = (idDepartamento: any, activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (idDepartamento !== null) {
            queryParam = queryParam.set('idDepartamento', idDepartamento);
        }
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('provincias').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/provincias";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboDistrito = (idDepartamento: any, idProvincia: any, activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (idDepartamento !== null) {
            queryParam = queryParam.set('idDepartamento', idDepartamento);
        }
        if (idProvincia !== null) {
            queryParam = queryParam.set('idProvincia', idProvincia);
        }
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('distritos').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/distritos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getListPostulantes = (data: any, pageIndex, pageSize) => {
        data.pageIndex = pageIndex;
        data.pageSize = pageSize;
        // return this.restangular.all('listarPostulantes').post(data);
        let url = this.basePath.reasignacionesApi + "/listarPostulantes";
        return this._http.post<any>(url,data); 
    }



    getListaPostulacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idOrigenRegistro !== null) {
            queryParam = queryParam.set('idOrigenRegistro', data.idOrigenRegistro);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idEstadoPostulacion !== null) {
            queryParam = queryParam.set('idEstadoPostulacion', data.idEstadoPostulacion);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('postulaciones').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/postulaciones";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getConsolidadoPlaza = (data: any) => {
        // return this.restangular.all('consolidadosplaza/' + data.idProceso + '/' + data.idEtapa + '/' + data.idDre + '/' + data.idUgel).get();
        let url = this.basePath.reasignacionesApi + '/consolidadosplaza/' + data.idProceso + '/' + data.idEtapa + '/' + data.idDre + '/' + data.idUgel;
        return this._http.get<any>(`${url}`);
    }

    getComboCargo = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('cargos').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/cargos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboModalidadEducativa = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('modalidadeseducativa').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/modalidadeseducativa";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getModalidadEducativa = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        let url = this.basePath.reasignacionesApi + "/modalidadesEducativas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getNivelEducativo = (activo: any, idModalidadEducativa: any) => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("activo", activo);
        queryParam = queryParam.set("idModalidadEducativa", idModalidadEducativa);
        let url = this.basePath.reasignacionesApi + "/modalidadesEducativas/niveles";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboAreacurricular = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('areascurricular').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/areascurricular";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboNivelEducativa = (idModalidadEducativa: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idModalidadEducativa !== null) {
            queryParam = queryParam.set('idModalidadEducativa', idModalidadEducativa);
        }
        // return this.restangular.all('modalidadesEducativas/niveles').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/modalidadesEducativas/niveles";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getAllComboNivelEducativa = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('niveleseducativo').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/niveleseducativo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }
    getComboCentroEstudio = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('centrosestudio').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/centrosestudio";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboGradoEstudio = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('gradosestudio').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/gradosestudio";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    /**
     * _________________________________________________________________________________________________________
     * METODOS MODAL PLAZAS
     * _________________________________________________________________________________________________________
     */

     getListPlaza = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.centroTrabajo) {
            queryParam = queryParam.set('centroTrabajo', data.centroTrabajo);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idRegimenLaboral && data.idRegimenLaboral > 0) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        // return this.restangular.all('plazas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getPlazas = (data: any, pageIndex, pageSize) => {
        let datos: any = {};

        if (data.codigoPlaza !== null && data.codigoPlaza > 0) {
            datos.codigoPlaza = data.codigoPlaza;
        }
        if (data.descripcionCentroTrabajo !== null && data.descripcionCentroTrabajo > 0) {
            datos.descripcionCentroTrabajo = data.descripcionCentroTrabajo;
        }
        if (data.codigoCentroTrabajo !== null && data.codigoCentroTrabajo > 0) {
            datos.codigoCentroTrabajo = data.codigoCentroTrabajo;
        }
        if (data.idRegimenLaboral !== null && data.idRegimenLaboral > 0) {
            datos.idRegimenLaboral = data.idRegimenLaboral;
        }
        if (data.tipoFormato !== null && data.tipoFormato > 0) {
            datos.tipoFormato = data.tipoFormato;
        }
        datos.paginaActual = pageIndex;
        datos.tamanioPagina = pageSize;

        let url = this.basePath.reasignacionesApi + "/plazas/buscar";
        return this._http.post<any>(`${url}`, datos);
    }

    /**
     * _________________________________________________________________________________________________________
     * MODAL BUSCAR SERVIDOR PUBLICO
     * _________________________________________________________________________________________________________
     */

     buscarServidorPublico = (
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.idTipoDocumentoIdentidad) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.nombres) {
            queryParam = queryParam.set('nombres', data.nombres);
        }
        if (data.primerApellido) {
            queryParam = queryParam.set('primerApellido', data.primerApellido);
        }
        if (data.segundoApellido) {
            queryParam = queryParam.set('segundoApellido', data.segundoApellido);
        }
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);

        // return this.restangular.all('servidorespublicos').all('consultar').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/servidorespublicos/consultar";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getServidorPublico(
        pIdTipoDocumento: any,
        pNumeroDocumento: any
    ): Observable<any> {

        let queryParam: HttpParams = new HttpParams()
            .set("idTipoDocumentoIdentidad", pIdTipoDocumento)
            .set("numeroDocumentoIdentidad", pNumeroDocumento)
            .set("codigoSede", this.storageService.getPassportRolSelected().CODIGO_SEDE);
        // return this.restangular.all("servidorespublicos").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/servidorespublicos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getServidorPublicoVinculaciones(
        pIdTipoDocumento: any,
        pNumeroDocumento: any,
        pIdPlaza: any
    ): Observable<any> {

        let queryParam: HttpParams = new HttpParams()
            .set("idTipoDocumentoIdentidad", pIdTipoDocumento)
            .set("numeroDocumentoIdentidad", pNumeroDocumento)
            .set("idplaza", pIdPlaza)
            .set("codigoSede", this.storageService.getPassportRolSelected().CODIGO_SEDE);
        // return this.restangular.all("servidorespublicos").all("plaza").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/servidorespublicos/plaza";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getListaServidorPublico = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'idTipoDocumentoIdentidad',
                data.idTipoDocumentoIdentidad
            );
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'numeroDocumentoIdentidad',
                data.numeroDocumentoIdentidad
            );
        }
        if (data.primerApellido !== null) {
            queryParam = queryParam.set('primerApellido', data.primerApellido);
        }
        if (data.segundoApellido !== null) {
            queryParam = queryParam.set(
                'segundoApellido',
                data.segundoApellido
            );
        }
        if (data.nombres !== null) {
            queryParam = queryParam.set('nombres', data.nombres);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('servidorespublicos').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/servidorespublicos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboTipoCapacitacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposcapacitacion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposcapacitacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboNivelExperiencia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('nivelesexperiencialaboral').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/nivelesexperiencialaboral";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboTipoExperiencia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposexperiencialaboral').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposexperiencialaboral";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboTipoEntidad = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposentidad').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposentidad";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboColegioProfesional = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('colegiosprofesional').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/colegiosprofesional";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboEstudioCompleto = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('estudioscompleto').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/estudioscompleto";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }


    exportarExcelPostulacion(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();

        if (data.idEtapa !== null) {
            queryParam = queryParam.set(
                'idEtapa',
                data.idEtapa
            );
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set(
                'idProceso',
                data.idProceso
            );
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'numeroDocumentoIdentidad',
                data.numeroDocumentoIdentidad
            );
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'idTipoDocumentoIdentidad',
                data.idTipoDocumentoIdentidad
            );
        }
        if (data.idOrigenRegistro !== null) {
            queryParam = queryParam.set(
                'idOrigenRegistro',
                data.idOrigenRegistro
            );
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set(
                'idInstancia',
                data.idInstancia
            );
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set(
                'idSubInstancia',
                data.idSubInstancia
            );
        }
        if (data.idEstadoPostulacion !== null) {
            queryParam = queryParam.set(
                'idEstadoPostulacion',
                data.idEstadoPostulacion
            );
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular
            .all('postulaciones/exportar')
            .download(null, queryParam);
    }

    getPostulacionById = (idPostulacion) => {
        // return this.restangular.one('postulaciones', idPostulacion).get();
        let url = this.basePath.reasignacionesApi + "/postulaciones/"+idPostulacion;
        return this._http.get<any>(`${url}`);
    }

    getPostulacion = (pIdPostulacion, pIdEtapaProceso): Observable<any> => {
        let queryParam = new HttpParams();
        if (pIdEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', pIdEtapaProceso);
        }
        //return this.restangular.one("postulaciones", pIdPostulacion).get(queryParam);
        let url = this.basePath.reasignacionesApi + "/postulaciones/"+pIdPostulacion;
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    eliminarPostulacion = (data: any): Observable<any> => {
        // return this.restangular.all('postulaciones').all('eliminar').post(data);
        let url = this.basePath.reasignacionesApi + "/postulaciones/eliminar";
        return this._http.post<any>(url, data);
    };


    deletePostulacion = (idPostulacion: any): Observable<any> => {
        return this.restangular
            .one('postulaciones', idPostulacion)
            .patch({ idPostulacion: idPostulacion });
    }

    /**
     * _________________________________________________________________________________________________________
     * METODOS CALIFICACIONES
     * _________________________________________________________________________________________________________
     */

    getMaestroPermisoCalificacion = (data: any): Observable<any> => {
        // return this.restangular.all('calificaciones').all('obtenerpermisos').post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/obtenerpermisos";
        return this._http.post<any>(url, data);
    };    

    getCalificacionesPreliminaresGrid = (
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumentoIdentidad) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.idCausal) {
            queryParam = queryParam.set('idCausal', data.idCausal);
        }
        if (data.idEtapaPostulacion) {
            queryParam = queryParam.set('idEtapaPostulacion', data.idEtapaPostulacion);
        }
        if (data.idEstadoCalificacion) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);

        // return this.restangular.all('calificaciones').all('preliminares').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones/preliminares";
        return this._http.get<any>(url, { params: queryParam });
    };

    exportarCalificacionesPreliminares = (data: any): Observable<any> => {
        // return this.restangular.all('calificaciones').all('exportar').all('preliminares').post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/exportar/preliminares";
        return this._http.post<any>(url, data);
    };

    getValidarCalificacionesPendientes = (
        data: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        // return this.restangular.all('calificaciones').all('verificarpendientes').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones/verificarpendientes";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    publicarCalificacionPostulantePreliminar = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("publicar").all("preliminar").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/publicar/preliminar";
        return this._http.post<any>(url, data);
    };

    getBuscarDocumentoConsolidadoPlazas = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);

        let url = this.basePath.reasignacionesApi + "/documentopublicado/consolidadoPlazas";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarDocumentoPublicadoCalificacionPreliminar = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        }

        let url = this.basePath.reasignacionesApi + "/documentopublicado/calificacionpreliminar";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarDocumentoPublicadoCalificacionFinal = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        }
        let url = this.basePath.reasignacionesApi + "/documentopublicado/calificacionfinal";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarDocumentoPublicadoCalificacionCuadroMerito = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        }
        let url = this.basePath.reasignacionesApi + "/documentopublicado/calificacioncuadromerito";
        return this._http.get<any>(url, { params: queryParam });
    };

    getCalificacionesFinalesGrid = (
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.idTipoDocumentoIdentidad) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.idCausal) {
            queryParam = queryParam.set('idCausal', data.idCausal);
        }
        if (data.idEtapaPostulacion) {
            queryParam = queryParam.set('idEtapaPostulacion', data.idEtapaPostulacion);
        }
        if (data.idEstadoCalificacion) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);

        // return this.restangular.all('calificaciones').all('finales').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones/finales";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getCalificacionesCuadroMeritoGrid = (
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumentoIdentidad) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoEtapa) {
            queryParam = queryParam.set('codigoEtapa', data.codigoEtapa);
        }
        if (data.idCausal) {
            queryParam = queryParam.set('idCausal', data.idCausal);
        }
        if (data.idEtapaPostulacion) {
            queryParam = queryParam.set('idEtapaPostulacion', data.idEtapaPostulacion);
        }
        if (data.idEstadoCalificacion) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);

        // return this.restangular.all('calificaciones').all('cuadromerito').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones/cuadromerito";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarCalificacionesFinales = (data: any): Observable<any> => {
        // return this.restangular.all('calificaciones').all('exportar').all('finales').post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/exportar/finales";
        return this._http.post<any>(url, data);
    };

    exportarCalificacionesCuadroMerito = (data: any): Observable<any> => {
        // return this.restangular.all('calificaciones').all('exportar').all('cuadromerito').post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/exportar/cuadromerito";
        return this._http.post<any>(url, data);
    };

    getRequesitosGeneralesGrid = (): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);
        // return this.restangular.all("calificaciones").all("requisitosgenerales").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones/requisitosgenerales";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getVerificarImpedimentosGrid = (): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);
        // return this.restangular.all("calificaciones").all("verificarimpedimentos").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones/verificarimpedimentos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getEvaluacionExpedienteGrid = (): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);
        // return this.restangular.all("calificaciones").all("evaluacionExpediente").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones/evaluacionExpediente";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getCalificacionesResultados = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("getCalificacionResultado").get(data);
        let queryParam = new HttpParams();
        if (data.idCalificacionDetalle !== null && data.idCalificacionDetalle > 0) {
            queryParam = queryParam.set("idCalificacionDetalle", data.idCalificacionDetalle);
        }
        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
            queryParam = queryParam.set("idEtapaProceso", data.idEtapaProceso);
        }
        let url = this.basePath.reasignacionesApi + "/calificaciones/getCalificacionResultado";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboEstadosCalificacion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('estadoscalificacion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/estadoscalificacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getMotivosObservacion = (): Observable<any> => {
        // return this.restangular.all('motivosobservacion').get();
        let url = this.basePath.reasignacionesApi + "/motivosobservacion";
        return this._http.get<any>(url);
    };

    registrarObservacionPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("observacion").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/observacion";
        return this._http.post<any>(url,data);
    };

    obtenerObservacionPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("obtenerobservacion").get(data);
        let queryParam = new HttpParams();
        if (data.idCalificacionDetalle !== null && data.idCalificacionDetalle > 0) {
            queryParam = queryParam.set("idCalificacionDetalle", data.idCalificacionDetalle);
        }
        let url = this.basePath.reasignacionesApi + "/calificaciones/obtenerobservacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    registrarReclamoPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("reclamo").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/reclamo";
        return this._http.post<any>(url,data);
    };

    obtenerReclamoPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("obtenerreclamo").get(data);
        let queryParam = new HttpParams();
        if (data.idCalificacionDetalle !== null && data.idCalificacionDetalle > 0) {
            queryParam = queryParam.set("idCalificacionDetalle", data.idCalificacionDetalle);
        }
        let url = this.basePath.reasignacionesApi + "/calificaciones/obtenerreclamo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getCentroTrabajoByCodigo = (codigoCentroTrabajo: any, activo: any) => {
        let queryParam = new HttpParams();
        if (codigoCentroTrabajo !== null) { queryParam = queryParam.set('codigoCentroTrabajo', codigoCentroTrabajo); }
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('centrostrabajo/buscarporcodigo').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/centrostrabajo/buscarporcodigo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    ExportaExcelPlazasResultadoFinal(data: any, pageIndex, pageSize): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        return this.restangular
            .all('plazascontratacion/resultadofinal/exportar')
            .download(null, queryParam);
    }

    enviarConsolidadoPlazas(data: any): Observable<any> {
        // return this.restangular.all('consolidadosplaza/enviarconsolidado').post(data);
        let url = this.basePath.reasignacionesApi + "/consolidadosplaza/enviarconsolidado";
        return this._http.post<any>(url,data);
    }

    publicarPlazas(data: any): Observable<any> {
        // return this.restangular.all('consolidadosplaza/publicarconsolidadoplazas').post(data);
        let url = this.basePath.reasignacionesApi + "/consolidadosplaza/publicarconsolidadoplazas";
        return this._http.post<any>(url,data);
    }

    ExportaExcelPlazasConvocadas = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/detalle/exportar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    }

    ExportaExcelPlazasObservadas(data: any, pageIndex, pageSize): Observable<any> {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/detalle/exportar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    }

    getResumenPlazas = (data: any) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        // return this.restangular.all('plazascontratacion/resumen').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazascontratacion/resumen";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getListaCalificacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idEstadoCalificacion !== null) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        if (data.idGrupoInscripcion !== null) {
            queryParam = queryParam.set('idGrupoInscripcion', data.idGrupoInscripcion);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('calificaciones').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificaciones";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboGrupoInscripcion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('gruposinscripcion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/gruposinscripcion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getCalificacion = (data: any) => {
        // return this.restangular.all('calificaciones/obtener').get(data);
        let queryParam = new HttpParams();
        if (data.idCalificacion !== null && data.idCalificacion > 0) {
            queryParam = queryParam.set("idCalificacion", data.idCalificacion);
        }
        let url = this.basePath.reasignacionesApi + "/calificaciones/obtener";
        return this._http.get<any>(`${url}`, { params: queryParam });	
    }

    getListaConsolidadoPlaza = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getComboEstadosConsolidadoPlaza = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('estadosconsolidadosplaza').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/estadosconsolidadosplaza";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    aprobarMasivoConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/aprobarMasivoConsolidado";
        return this._http.put<any>(`${url}`, data);
    }

    exportarConsolidadoPlaza(data: any): Observable<any> {
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/exportar";        
        return this._http.post<any>(`${url}`, data);
    }

    eliminarMasivo(data: any): Observable<any> {
        let url = 'calificaciones/' + data.idProceso + '/' + data.idEtapa + '/eliminarmasivo'
        return this.restangular.all(url).patch(data);
    }

    generarPdfConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/generarpdf";
        return this._http.post<any>(`${url}`, data);
    }

    aprobarConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/detalle/aprobar";
        return this._http.put<any>(`${url}`, data);
    }

    rechazarConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/detalle/rechazar";
        return this._http.put<any>(`${url}`, data);
    }

    getConsolidadoPlazaById = (idConsolidado: any): Observable<any> => {
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/consolidado/" + idConsolidado;
        return this._http.get<any>(url);
    };

    getListaplazasReasignacionConvocar = (data: any, pageIndex, pageSize) : Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.reasignacionesApi + "/consolidadoplaza/detalle/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getComboEstadosAdjudicacion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('estadosadjudicacion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/estadosadjudicacion";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboGruposInscripcion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        // return this.restangular.all('gruposinscripcion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/gruposinscripcion";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getListaAdjudicacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }

        if (data.idModalidadEducativa !== null) {
            queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa);
        }

        if (data.idNivelEducativo !== null) {
            queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo);
        }

        if (data.idAreaCurricular !== null) {
            queryParam = queryParam.set('idAreaCurricular', data.idAreaCurricular);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idEstadoAdjudicacion !== null) {
            queryParam = queryParam.set('idEstadoAdjudicacion', data.idEstadoAdjudicacion);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('adjudicaciones').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    crearCalificacion = (calificacion: any): Observable<any> => {
        // return this.restangular.all('calificaciones').post(calificacion);
        let url = this.basePath.reasignacionesApi + "/calificaciones";
        return this._http.post<any>(url, calificacion);
    }

    modificarCalificacion = (calificacion: any): Observable<any> => {
        // return this.restangular.all('calificaciones').put(calificacion);
        let url = this.basePath.reasignacionesApi + "/calificaciones";
        return this._http.put<any>(url, calificacion);
    }

    exportarExcelCalificacion(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idEstadoCalificacion !== null) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        if (data.idGrupoInscripcion !== null) {
            queryParam = queryParam.set('idGrupoInscripcion', data.idGrupoInscripcion);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular
            .all('calificaciones/exportar')
            .download(null, queryParam);
    }

    getListaPlazaAdjudicacion = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.idProceso !== null) {
            queryParam = queryParam.set(
                'idProceso',
                data.idProceso
            );
        }

        if (data.idEtapa !== null) {
            queryParam = queryParam.set(
                'idEtapa',
                data.idEtapa
            );
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set(
                'codigoPlaza',
                data.codigoPlaza
            );
        }
        if (data.descripcionCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'descripcionCentroTrabajo',
                data.descripcionCentroTrabajo
            );
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                'idRegimenLaboral',
                data.idRegimenLaboral
            );
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazas/adjudicacion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazas/adjudicacion";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    adjudicarPlaza(data: any): Observable<any> {
        // return this.restangular.all('calificaciones/' + data.idCalificacion + '/adjudicarplaza').post(data);
        let url = this.basePath.reasignacionesApi + '/calificaciones/' + data.idCalificacion + '/adjudicarplaza';
        return this._http.post<any>(url, data);
    }

    noAdjudicarPlaza(data: any): Observable<any> {
        // return this.restangular.all('calificaciones/' + data.idCalificacion + '/noadjudicarplaza').post(data);
        let url = this.basePath.reasignacionesApi + '/calificaciones/' + data.idCalificacion + '/noadjudicarplaza';
        return this._http.post<any>(url, data);
    }

    getMotivoNoAdjudicacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('motivosnoadjudicacion').get();
        let url = this.basePath.reasignacionesApi + "/motivosnoadjudicacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    exportarExcelAdjudicacion(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }

        if (data.idModalidadEducativa !== null) {
            queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa);
        }

        if (data.idNivelEducativo !== null) {
            queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo);
        }

        if (data.idAreaCurricular !== null) {
            queryParam = queryParam.set('idAreaCurricular', data.idAreaCurricular);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idEstadoAdjudicacion !== null) {
            queryParam = queryParam.set('idEstadoAdjudicacion', data.idEstadoAdjudicacion);
        }

        return this.restangular
            .all('adjudicaciones/exportar')
            .download(null, queryParam);
    }

    registrarReclamoCalificacion(data: any): Observable<any> {
        // return this.restangular.all('calificaciones/' + data.idCalificacion + '/registrarreclamo').post(data);
        let url = this.basePath.reasignacionesApi + '/calificaciones/' + data.idCalificacion + '/registrarreclamo';
        return this._http.post<any>(url, data);
    }

    calificarAutomatica(data: any): Observable<any> {
        // return this.restangular.all('calificaciones/calificacionautomatica').post(data);
        let url = this.basePath.reasignacionesApi + '/calificaciones/calificacionautomatica';
        return this._http.post<any>(url, data);
    }

    publicarCalificacion(data: any): Observable<any> {
        // return this.restangular.all('calificaciones/publicacioncalificaciones').post(data);
        let url = this.basePath.reasignacionesApi + '/calificaciones/publicacioncalificaciones';
        return this._http.post<any>(url, data);
    }

    finalizarEtapa(data: any): Observable<any> {
        // return this.restangular.all('etapas/' + data.idEtapa + '/finalizaretapa').post(data);
        let url = this.basePath.reasignacionesApi + '/etapas/'+ data.idEtapa + '/finalizaretapa';
        return this._http.post<any>(url, data);
    }

    publicarAdjudicaciones(data: any): Observable<any> {
        // return this.restangular.all('adjudicaciones/publicaradjudicaciones').post(data);
        let url = this.basePath.reasignacionesApi + '/adjudicaciones/publicaradjudicaciones';
        return this._http.post<any>(url, data);
    }


    getListaResumenAdjudicacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }

        if (data.idModalidadEducativa !== null) {
            queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa);
        }

        if (data.idNivelEducativo !== null) {
            queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo);
        }

        if (data.idAreaCurricular !== null) {
            queryParam = queryParam.set('idAreaCurricular', data.idAreaCurricular);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idEstadoAdjudicacion !== null) {
            queryParam = queryParam.set('idEstadoAdjudicacion', data.idEstadoAdjudicacion);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('adjudicaciones/resumen').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/resumen";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getAdjudicacionCustom = (idAdjudicacion) => {
        // return this.restangular.all('adjudicaciones/' + idAdjudicacion).get();
        let url = this.basePath.reasignacionesApi + '/adjudicaciones/'+ idAdjudicacion;
        return this._http.get<any>(url);
    }


    getListPlazasReasignacion = (data: any, pageIndex, pageSize) => {
        data.pageIndex = pageIndex;
        data.pageSize = pageSize;
        // return this.restangular.all('listPrePublicarPlazas').post(data);
        let url = this.basePath.reasignacionesApi + "/listPrePublicarPlazas";
        return this._http.post<any>(url, data);
    }

    getInformacionPlazaById = (idPlazaReasignacion) => { 
        let queryParam = new HttpParams();
        queryParam = queryParam.set('IdPlazaPrePublicada', idPlazaReasignacion);
        // return this.restangular.all('informacionplazaprepublicada').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/informacionplazaprepublicada";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getDatosProcesoEtapaById = (idEtapa) => { 
        // return this.restangular.one('etapaproceso', idEtapa).get();
        let url = this.basePath.reasignacionesApi + "/etapaproceso/"+idEtapa;
        return this._http.get<any>(url);
    }

    getVerificarEjecucionJobPlazas= (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data !== null) queryParam = queryParam.append("idEtapaProceso", data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/verificarejecucionjobplazas";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    // *************************************************************************************************
    //            ADJUDICACIONES
    // *************************************************************************************************
    getDatosAdjudicacionEtapaByIds = (idEtapaProceso, idAdjudicacion) => { 
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idEtapaProceso', idEtapaProceso);
        queryParam = queryParam.set('idAdjudicacion', idAdjudicacion);
        // return this.restangular.all('plazasreasignacion/obtenerdatosadjudicacion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/obtenerdatosadjudicacion";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    exportarAdjudicaciones = (data: any): Observable<any> => {
        // return this.restangular.all('adjudicaciones').all('exportar').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/exportar";
        return this._http.post<any>(url, data);
    };

    finalizarAdjudicacion = (data: any): Observable<any> => {
        data.usuarioModificacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('finalizaradjudicacion').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/finalizaradjudicacion";
        return this._http.post<any>(url, data);
    };

    finalizarEtapaProceso = (data: any): Observable<any> => {
        data.usuarioModificacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('finalizaretapa').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/finalizaretapa";
        return this._http.post<any>(url, data);
    };

    getPrepublicaciones = (data: any, pageIndex, pageSize): Observable<any> => {

        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("idGrupoDocumento", data.idGrupoDocumento);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/verPrepublicaciones";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarDocumentoPublicadoPorFecha = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idDesarrolloProceso !== null) queryParam = queryParam.append("idDesarrolloProceso", data.idDesarrolloProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("idGrupoDocumento", data.idGrupoDocumento);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.reasignacionesApi + "/documentopublicado/buscarPorFecha";
        return this._http.get<any>(url, { params: queryParam });
    };

    getAdjudicacionPlazaGrid = (data: any, paginaActual: any, tamanioPagina: any): Observable<any> => {
        let queryParam = new HttpParams();
        data.codigoRolPassport = this.storageService.getPassportRolSelected().CODIGO_ROL;
        if (data.codigoRolPassport) {
            queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);
        }
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoModular) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoModular);
        }
        if (data.idEstadoAdjudicacion) {
            queryParam = queryParam.set('idEstadoAdjudicacion', data.idEstadoAdjudicacion);
        }
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.idPostulacion) {
            queryParam = queryParam.set('idPostulacion', data.idPostulacion);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);
        // return this.restangular.all("adjudicaciones").all("plaza").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/plaza";
        return this._http.get<any>(url, { params: queryParam });
    };
    adjudicar = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        data.codigoSede = this.storageService.getInformacionUsuario().codigoSede;
        // return this.restangular.all('adjudicaciones').all('adjudicar').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/adjudicar";
        return this._http.post<any>(url, data);
    };
    noAdjudicar = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('noadjudicar').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/noadjudicar";
        return this._http.post<any>(url, data);
    };
    subsanarObservar = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('subsanarobservacion').post(data);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/subsanarobservacion";
        return this._http.post<any>(url, data);
    };
    getEstadosSubsanacion = (): Observable<any> => {
        // return this.restangular.all('estadossubsanacion').get();
        let url = this.basePath.reasignacionesApi + "/estadossubsanacion";
        return this._http.get<any>(url);
    };
    getMotivosNoAdjudicacion = (): Observable<any> => {
        // return this.restangular.all('motivosnoadjudicacion').get();
        let url = this.basePath.reasignacionesApi + "/motivosnoadjudicacion";
        return this._http.get<any>(url);
    };
    getInformacionPostulante = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idPostulacion', data.idPostulacion);
        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        // return this.restangular.all("adjudicaciones").all("postulante").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/postulante";
        return this._http.get<any>(url, { params: queryParam });
    };

    getInformacionPostulanteAdjudicado = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idPostulacion', data.idPostulacion);
        queryParam = queryParam.set('idAdjudicacion', data.idAdjudicacion);
        // return this.restangular.all("adjudicaciones").all("postulanteAdjudicado").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/postulanteAdjudicado";
        return this._http.get<any>(url, { params: queryParam });
    };

    getAdjudicacionesGrid = (
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumentoIdentidad) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoModular) {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.anexo) {
            queryParam = queryParam.set('anexo', data.anexo);
        }
        if (data.anexoCentroTrabajo) {
            queryParam = queryParam.set('anexoCentroTrabajo', data.anexoCentroTrabajo);
        }
        if (data.idCausal) {
            queryParam = queryParam.set('idCausal', data.idCausal);
        }
        if (data.idEtapaPostulacion) {
            queryParam = queryParam.set('idEtapaPostulacion', data.idEtapaPostulacion);
        }
        if (data.idEstadoAdjudicacion) {
            queryParam = queryParam.set('idEstadoAdjudicacion', data.idEstadoAdjudicacion);
        }
        if (data.idModalidadEducativa) {
            queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa);
        }
        if (data.idNivelEducativo) {
            queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);
        // return this.restangular.all('adjudicaciones').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerInformacionAdjudicacion = (data:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) 
        queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) 
        queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro); 
        if (data.idDesarrolloProceso !== null) 
        queryParam = queryParam.append("idDesarrolloProceso", data.idDesarrolloProceso); 
        // return this.restangular.all("adjudicaciones").all("informacion").get(queryParam);
        let url = this.basePath.reasignacionesApi + "/adjudicaciones/informacion";
        return this._http.get<any>(url, { params: queryParam });
    };

    // *************************************************************************************************


    /**
     * _________________________________________________________________________________________________________
     * PLAZAS CONVOCADAS
     * _________________________________________________________________________________________________________
     */
    getGridPlazaReasignacionConvocadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazasreasignacion').all('convocadas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/convocadas";
        return this._http.get<any>(url, { params: queryParam });
    };
    // ************************************************************************************************
    
    getListaPlazas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('idEtapa', data.codigoPlaza);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('listaplazasprepublicadas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/listaplazasprepublicadas";
        return this._http.get<any>(url, { params: queryParam });
    }

    getListadoCalificacion = (data: any) => {
        // let result = this.restangular.all('buscar').get();
        // return result;
        let url = this.basePath.reasignacionesApi + "/buscar";
        return this._http.get<any>(url);
    }

    // **************************************************
    postPublicarCalificacion(data: any): Observable<any> {
        // return this.restangular.all('publicarpreliminar').post(data);
        let url = this.basePath.reasignacionesApi + "/publicarpreliminar";
        return this._http.post<any>(url, data);
    }

    postPublicarFinalCalificacion(data: any): Observable<any> {
        // return this.restangular.all('publicarfinal').post(data);
        let url = this.basePath.reasignacionesApi + "/publicarfinal";
        return this._http.post<any>(url, data);
    }

    getComboMotivoNoCalificacion(): Observable<any> {
        // return this.restangular.all('combomotivonocalificacion').get();
        let url = this.basePath.reasignacionesApi + "/combomotivonocalificacion";
        return this._http.get<any>(url);
    }

    postOrdenMeritoCalificacion(data: any): Observable<any> {
        // return this.restangular.all('generarorden').post(data);
        let url = this.basePath.reasignacionesApi + "/generarorden";
        return this._http.post<any>(url, data);
    }

    
    /**
     * _________________________________________________________________________________________________________
     * PLAZAS PREPUBLICADAS
     * _________________________________________________________________________________________________________
     */
    getGridPlazaReasignacionPrepublicadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idInstancia) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazasreasignacion').all('prepublicadas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/prepublicadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarPlazaReasignacionPrepublicadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('prepublicadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/prepublicadas";
        return this._http.post<any>(url, data);
    };
    exportarPlazaReasignacionPrepublicadasPrepublicacion = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('prepublicadas').all('prepublicacion').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/prepublicadas/prepublicacion";
        return this._http.post<any>(url, data);
    };

    enviarPlazasPrepublicadasToConvocadas = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('plazasreasignacion').all('enviar').all('plazasprepublicadasaconvocadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/enviar/plazasprepublicadasaconvocadas";
        return this._http.post<any>(url, data);
    };

    enviarPlazasPrepublicadasToObservadas = (data: any): Observable<any> => {
        // return this.restangular.all('plazasreasignacion').all('enviar').all('plazasprepublicadasaobservadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/enviar/plazasprepublicadasaobservadas";
        return this._http.post<any>(url, data);
    };

    enviarPlazasObservadasToConvocadas = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('plazasreasignacion').all('enviar').all('plazasobservadasaconvocadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/enviar/plazasobservadasaconvocadas";
        return this._http.post<any>(url, data);
    };

    enviarPlazasConvocadasToObservadas = (data: any): Observable<any> => {
        // return this.restangular.all('plazasreasignacion').all('enviar').all('plazasconvocadasaobservadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/enviar/plazasconvocadasaobservadas";
        return this._http.post<any>(url, data);
    };



    /**
     * _________________________________________________________________________________________________________
     * PLAZAS REASIGNACION
     * _________________________________________________________________________________________________________
     */
         getGridPlazaReasignacion = (
            data: any,
            pageIndex: any,
            pageSize: any
        ): Observable<any> => {
            let queryParam = new HttpParams();
            if (data.idEtapaProceso) {
                queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
            }
            if (data.idAlcanceProceso) {
                queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
            }
            if (data.codigoPlaza) {
                queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
            }
            if (data.codigoCentroTrabajo) {
                queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
            }
            if (data.idInstancia) {
                queryParam = queryParam.set('idInstancia', data.idInstancia);
            }
            if (data.idSubInstancia) {
                queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
            }
            queryParam = queryParam.set('paginaActual', pageIndex);
            queryParam = queryParam.set('tamanioPagina', pageSize);
            // return this.restangular.all('plazasreasignacion').get(queryParam);
            let url = this.basePath.reasignacionesApi + "/plazasreasignacion";
            return this._http.get<any>(`${url}`, { params: queryParam });
        };

    /**
     * _________________________________________________________________________________________________________
     * PLAZAS PUBLICADAS
     * _________________________________________________________________________________________________________
     */
    getGridPlazaReasignacionPublicadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idInstancia) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazasreasignacion').all('publicadas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/publicadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarPlazaReasignacionPublicadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('publicadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/publicadas";
        return this._http.post<any>(url, data);
    };


    /**
     * _________________________________________________________________________________________________________
     * PLAZAS OBSERVADAS
     * _________________________________________________________________________________________________________
     */
    getGridPlazaReasignacionObservadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idInstancia) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazasreasignacion').all('observadas').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/observadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
    exportarPlazaReasignacionConvocadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('convocadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/convocadas";
        return this._http.post<any>(url, data);
    };
    exportarPlazaReasignacionObservadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('observadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/observadas";
        return this._http.post<any>(url, data);
    };
    exportarPlazaReasignacionObservadasPrepublicacion = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('observadas').all('prepublicacion').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/observadas/prepublicacion";
        return this._http.post<any>(url, data);
    };

    // *********************************** SUSTENTO MOTIVOS****************************************
    getComboMotivosNoPublicacion = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('motivosnopublicacion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/motivosnopublicacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboTiposDocumentoSustento = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposdocumentossustento').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposdocumentossustento";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboTiposDocumentoFormato = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('tiposformatosustento').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/tiposformatosustento";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    getGridCalificacionesReasignacionPrepublicadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idTipoRotacion !== null) {
            queryParam = queryParam.set('idCausal', data.idTipoRotacion);
        }
        if (data.idEstadoCalificacion !== null) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('preliminares').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/preliminares";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getObtenerInformacionPostulante = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idPersona !== null) queryParam = queryParam.append("idPersona", data.idPersona);
        // return this.restangular.all('informacionpostulante').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/informacionpostulante";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getObtenerCalificacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacion !== null) queryParam = queryParam.append("idCalificacion", data.idCalificacion);
        // return this.restangular.all('calificacion/obtener').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificacion/obtener";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    putObservarCalificacion = (data: any): Observable<any> => {
        // return this.restangular.all('calificacion/observar').post(data);
        let url = this.basePath.reasignacionesApi + "/calificacion/observar";
        return this._http.post<any>(url, data);
    };

    putReclamo = (data: any): Observable<any> => {
        // return this.restangular.all('calificacion/reclamo').post(data);
        let url = this.basePath.reasignacionesApi + "/calificacion/reclamo";
        return this._http.post<any>(url, data);
    };

    getObtenerCalificacionRubro = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacionDetalle !== null) queryParam = queryParam.append("idCalificacionDetalle", data.idCalificacionDetalle);
        if (data.idMaestroProcesoCalificacion !== null) queryParam = queryParam.append("idMaestroProcesoCalificacion", data.idMaestroProcesoCalificacion);
        // return this.restangular.all('calificacion/obtenerrubro').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificacion/obtenerrubro";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getObtenerCalificacionRubroDetalle = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacionResultadoRubro !== null) queryParam = queryParam.append("idCalificacionResultadoRubro", data.idCalificacionResultadoRubro);
        if (data.idMaestroRubroCalificacion !== null) queryParam = queryParam.append("idMaestroRubroCalificacion", data.idMaestroRubroCalificacion);
        // return this.restangular.all('calificacion/obtenerrubrodetalle').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/calificacion/obtenerrubrodetalle";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    postGuardarCalificacion = (data: any): Observable<any> => {
        // return this.restangular.all('calificacion/guardar').post(data);
        let url = this.basePath.reasignacionesApi + "/calificacion/guardar";
        return this._http.post<any>(url, data);
    };

    exportarCalificacionesPreliminar = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacionResultadoRubro !== null) {
            queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        }
        // return this.restangular.all('ordenmerito').all('preliminar').all('excel').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/ordenmerito/preliminar/excel";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    publicarCalificacionPostulanteFinal = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("publicar").all("final").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/publicar/final";
        return this._http.post<any>(url, data);
    };

    migrarInformacionEtapaAnterior = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("migrarInformacionEtapaAnterior").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/migrarInformacionEtapaAnterior";
        return this._http.post<any>(url, data);
    };

    migrarPostulantesEtapaAnterior = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("migrarPostulantesEtapaAnterior").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/migrarPostulantesEtapaAnterior";
        return this._http.post<any>(url, data);
    };

    migrarPlazasEtapaAnterior = (data: any): Observable<any> => {
        // return this.restangular.all("plazasreasignacion").all("migrarPlazasEtapaAnterior").post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/migrarPlazasEtapaAnterior";
        return this._http.post<any>(url, data);
    };

    generarOrdenMeritoCalificacionPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("ordenmerito").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/ordenmerito";
        return this._http.post<any>(url, data);
    };

    publicarCalificacionPostulanteCuadroMerito = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("publicar").all("cuadromerito").post(data);
        let url = this.basePath.reasignacionesApi + "/calificaciones/publicar/cuadromerito";
        return this._http.post<any>(url, data);
    };

    /**
     * _________________________________________________________________________________________________________
     * PLAZAS RESULTADO FINAL FASE 2
     * _________________________________________________________________________________________________________
     */
     getGridPlazaReasignacionResultadoFinalFase2 = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idEstadoResultadoFinal) {
            queryParam = queryParam.set('idEstadoResultadoFinal', data.idEstadoResultadoFinal);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazasreasignacion').all('resultadosfinalesfase2').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/resultadosfinalesfase2";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarPlazaReasignacionResultadoFinalFase2 = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('resultadosfinalesfase2').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/resultadosfinalesfase2";
        return this._http.post<any>(url, data);
    };

    /**
     * _________________________________________________________________________________________________________
     * PLAZAS RESULTADO FINAL
     * _________________________________________________________________________________________________________
     */
    getGridPlazaReasignacionResultadoFinal = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idAlcanceProceso) {
            queryParam = queryParam.set('idAlcanceProceso', data.idAlcanceProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idEstadoResultadoFinal) {
            queryParam = queryParam.set('idEstadoResultadoFinal', data.idEstadoResultadoFinal);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazasreasignacion').all('resultadosfinales').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/resultadosfinales";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarPlazaReasignacionResultadoFinal = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('exportar').all('resultadosfinales').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/exportar/resultadosfinalesfase2";
        return this._http.post<any>(url, data);
    };

    getMotivoNoPublicacionPlazaReasignacion = (
        pIdPlazaReasignacion: any,
        pIdPlazaReasignacionDetalle: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (pIdPlazaReasignacion) {
            queryParam = queryParam.set('idPlazaReasignacion', pIdPlazaReasignacion);
        }
        if (pIdPlazaReasignacionDetalle) {
            queryParam = queryParam.set('idPlazaReasignacionDetalle', pIdPlazaReasignacionDetalle);
        }
        // return this.restangular.all('plazasreasignacion').all('motivonopublicacion').get(queryParam);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/motivonopublicacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    publicarPlazasReasignacion = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('plazasreasignacion').all('publicarplazas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/publicarplazas";
        return this._http.post<any>(url, data);
    };

    registrarPlazaReasignacionSiguienteEtapaPublicacion = (data: any): Observable<any> => {
        // return this.restangular.all('prepublicacionplazas/registrarplazas').post(data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/registrarplazas";
        return this._http.post<any>(url, data);
    }

    prepublicarPlazasReasignacion(data: any): Observable<any> {
        // return this.restangular.all('prepublicacionplazas/prepublicarplazas').post(data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/prepublicarplazas";
        return this._http.post<any>(url, data); 
    };

    getObtenerPlazaReasignacionPorIdEtapaProceso = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/obtener";
        return this._http.get<any>(url, { params: queryParam });
    };

    verificarAperturarPlazasPrepublicacion= (data: any): Observable<any> => {
        // return this.restangular.all('prepublicacionplazas/verificarAperturarPrepublicacion').get(data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/verificarAperturarPrepublicacion";
        return this._http.get<any>(url, data); 
    };

    aperturarPlazasPrepublicacion= (data: any): Observable<any> => {
        // return this.restangular.all('prepublicacionplazas/aperturarPrepublicacion').put(data);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/aperturarPrepublicacion";
        return this._http.put<any>(url, data); 
    };

    getBuscarDocumentoPublicadoPorDre = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("idGrupoDocumento", data.idGrupoDocumento);
        if (data.codigoDocumentoPublicacion !== null) queryParam = queryParam.append("codigoDocumentoPublicacion", data.codigoDocumentoPublicacion);
        if (data.idDocumentoPublicado !== null) queryParam = queryParam.append("idDocumentoPublicado", data.idDocumentoPublicado);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.reasignacionesApi + "/documentopublicado/buscarpordre";
        return this._http.get<any>(url, { params: queryParam });
    };

    validarPrepublicarPlazasReasignacion = (
        data: any
    ): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('plazasreasignacion').all('validarprepublicarplazas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/validarprepublicarplazas";
        return this._http.post<any>(url, data); 
    };

    pdfPlazaReasignacionPublicadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('pdf').all('publicadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/pdf/publicadas";
        return this._http.post<any>(url, data); 
    };
    pdfPlazaReasignacionPrePublicadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasreasignacion').all('pdf').all('prepublicadas').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/pdf/prepublicadas";
        return this._http.post<any>(url, data); 
    };

    actualizarEstadoDocumento = (request: any): Observable<any> => {
        let url = this.basePath.reasignacionesApi + "/documentopublicado/actualizar/estado";
        return this._http.put<any>(`${url}`, request);
    };

    getBuscarDocumentoPublicado = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idAlcanceProceso !== null) queryParam = queryParam.append("idAlcanceProceso", data.idAlcanceProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("idGrupoDocumento", data.idGrupoDocumento);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.reasignacionesApi + "/documentopublicado/buscar";
        return this._http.get<any>(url, { params: queryParam });
    };


    getRegimenesLaborales = (activo): Observable<any> => {
        let queryParam = new HttpParams()
            .set("activo", activo);

        let url = this.basePath.reasignacionesApi + "/regimenLaboral";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getDescripcionMaestroProceso = (activo): Observable<any> => {
        let queryParam = new HttpParams()
            .set("activo", activo);

        let url = this.basePath.reasignacionesApi + "/descripcionMaestroProceso";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getEstadoDesarrollo = (activo): Observable<any> => {
        let queryParam = new HttpParams()
            .set("activo", activo);

        let url = this.basePath.reasignacionesApi + "/estadoDesarrollo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getDesarrolloProcesoPaginado = (data: any, pageIndex, pageSize) => {

        let queryParam = new HttpParams();

        if (data.anio !== null && data.anio > 0) {
            queryParam = queryParam.set("anio", data.anio);
        }
        if (data.idRegimenLaboral !== null && data.idRegimenLaboral > 0) {
            queryParam = queryParam.set("idRegimenLaboral", data.idRegimenLaboral);
        }
        if (data.idProceso !== null && data.idProceso > 0) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEstado !== null && data.idEstado > 0) {
            queryParam = queryParam.set("idEstado", data.idEstado);
        }
        if (data.codigoRolPassport !== null) {
            queryParam = queryParam.set("codigoRolPassport",data.codigoRolPassport);
        }
        if (data.codigoSede !== null) {
            queryParam = queryParam.set("codigoSede",data.codigoSede);
        }
        if (data.codigoTipoSede !== null) {
            queryParam = queryParam.set("codigoTipoSede",data.codigoTipoSede);
        }

        queryParam = queryParam.set("pageIndex", pageIndex);
        queryParam = queryParam.set("pageSize", pageSize);

        let url = this.basePath.reasignacionesApi + "/desarrolloProceso";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getMaestroPermisoDesarrolloPorRolPassport = (data: any) => {
        let queryParam = new HttpParams();
        if (data.codigoRolPassport !== null) {
            queryParam = queryParam.set("codigoRolPassport",data.codigoRolPassport);
        }
        if (data.codigoSede !== null) {
            queryParam = queryParam.set("codigoSede",data.codigoSede);
        }
        if (data.codigoTipoSede !== null) {
            queryParam = queryParam.set("codigoTipoSede",data.codigoTipoSede);
        }

        let url = this.basePath.reasignacionesApi + "/maestroPermisoDesarrollo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getMaestroPermisoPlaza = (data: any): Observable<any> => {
        // return this.restangular.all('plazasreasignacion').all('obtenerpermisos').post(data);
        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/obtenerpermisos";
        return this._http.post(`${url}`, data);
    };

    getMaestroPermisoPostulacion = (data: any): Observable<any> => {
        // return this.restangular.all('postulaciones').all('obtenerpermisos').post(data);
        let url = this.basePath.reasignacionesApi + "/postulaciones/obtenerpermisos";
        return this._http.post(`${url}`, data);
    };

    exportarDesarrolloProcesos = (data: any) => {
        let url = this.basePath.reasignacionesApi + "/desarrolloProceso/exportar";
        return this._http.post(`${url}`, data);
    }


    getInformacionDesarrolloProcesos = (idDesarrolloProceso: any) => {
        let url = this.basePath.reasignacionesApi + "/desarrolloProceso/" + idDesarrolloProceso;
        return this._http.get<any>(`${url}`);
    }

    getInformacionEtapaProceso = (idEtapaProceso: any) => {
        let url = this.basePath.reasignacionesApi + "/etapaProceso/" + idEtapaProceso;
        return this._http.get<any>(`${url}`);
    }

    obtenerEstadoDesarrolloEtapaProceso = (idEtapaProceso: any, idAlcanceProceso:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (idAlcanceProceso !== null && idAlcanceProceso > 0) queryParam = queryParam.append("idAlcanceProceso", idAlcanceProceso); 

        let url = this.basePath.reasignacionesApi + "/etapaProceso/estadodesarrollo";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerEstadoDesarrolloEtapaProcesoPorCodigoSede = (idEtapaProceso: any, codigoSede:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (codigoSede !== null && codigoSede > 0) queryParam = queryParam.append("codigoSede", codigoSede); 

        let url = this.basePath.reasignacionesApi + "/etapaProceso/estadodesarrolloPorCodigoSede";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerPlazaReasignacion = (idEtapaProceso: any, idAlcanceProceso:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (idAlcanceProceso !== null) queryParam = queryParam.append("idAlcanceProceso", idAlcanceProceso); 

        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/obtener";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerPlazaReasignacionPorAlcanceProceso = (idEtapaProceso: any, idAlcanceProceso:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (idAlcanceProceso !== null) queryParam = queryParam.append("idAlcanceProceso", idAlcanceProceso); 

        let url = this.basePath.reasignacionesApi + "/plazasreasignacion/obtenerPorAlcanceProceso";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerFechaDeCortePrepublicacion = (idEtapaProceso: any, idAlcanceProceso:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (idAlcanceProceso !== null && idAlcanceProceso > 0) queryParam = queryParam.append("idAlcanceProceso", idAlcanceProceso); 

        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/fechadecorte";
        return this._http.get<any>(url, { params: queryParam });
    };

    eliminarPlazaIncorporada = (detallesPlaza:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (detallesPlaza.idPlazaReasignacionDetalleIncorporada !== null) queryParam = queryParam.append("idPlazaReasignacionDetalleIncorporada", detallesPlaza.idPlazaReasignacionDetalleIncorporada);
        if (detallesPlaza.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", detallesPlaza.codigoCentroTrabajoMaestro);
        if (detallesPlaza.codigoRolPassport !== null) queryParam = queryParam.append("codigoRolPassport", detallesPlaza.codigoRolPassport);
        if (detallesPlaza.usuarioModificacion !== null) queryParam = queryParam.append("usuarioModificacion", detallesPlaza.usuarioModificacion);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/retirarplazaincorporada";
        return this._http.post<any>(url, detallesPlaza);
    };

    getInstancias = (activo: any) => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("activo", activo);
        let url = this.basePath.reasignacionesApi + "/instancias";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getInstanciasPorDRE = (activo: any) => {
        let queryParam = new HttpParams();
        let codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        queryParam = queryParam.set("activo", activo);
        queryParam = queryParam.set("codigoSede", codigoSede);
        let url = this.basePath.reasignacionesApi + "/instancias/dre";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getSubInstancias = (activo: any, idInstancia: any) => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("activo", activo);
        queryParam = queryParam.set("idInstancia", idInstancia);
        let url = this.basePath.reasignacionesApi + "/instancias/subinstancias";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getPlazasreasignacion = (data: any, pageIndex: any, pageSize: any) => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("pageIndex", pageIndex);
        queryParam = queryParam.set("pageSize", pageSize);
        queryParam = queryParam.set("idep", data.idep);
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getTipoCentroTrabajos = (idNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.reasignacionesApi + "/centrostrabajo/tipos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getCentrostrabajos = (data: any, pageIndex, pageSize) => {
        let datos: any = {};

        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) {
            datos.idNivelInstancia = data.idNivelInstancia;
        }
        if (data.idInstancia !== null && data.idInstancia > 0) {
            datos.idInstancia = data.idInstancia;
        }
        if (data.idSubinstancia !== null && data.idSubinstancia > 0) {
            datos.idSubinstancia = data.idSubinstancia;
        }
        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) {
            datos.idTipoCentroTrabajo = data.idTipoCentroTrabajo;
        }
        if (data.institucionEducativa !== null) {
            datos.institucionEducativa = data.institucionEducativa;
        }
        if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) {
            datos.idModalidadEducativa = data.idModalidadEducativa;
        }
        if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) {
            datos.idNivelEducativo = data.idNivelEducativo;
        }
        datos.paginaActual = pageIndex;
        datos.tamanioPagina = pageSize;

        let url = this.basePath.reasignacionesApi + "/centrostrabajo/buscar";
        return this._http.post<any>(`${url}`, datos);
    }


    getPrePublicacionPlazasReasignacion = (data: any, pageIndex, pageSize) => {

        let queryParam = new HttpParams();

        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
            queryParam = queryParam.set("idEtapaProceso", data.idEtapaProceso);
        }
        if (data.idInstancia !== null && data.idInstancia > 0) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null && data.idSubInstancia > 0) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.codigoModular !== null && data.codigoModular > 0) {
            queryParam = queryParam.set("codigoModular", data.codigoModular);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza > 0) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }

        queryParam = queryParam.set("pageIndex", pageIndex);
        queryParam = queryParam.set("pageSize", pageSize);

        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    exportarPrePublicacionPlazasReasignacion = (data: any) => {
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/exportar";
        return this._http.post(`${url}`, data);
    }

    getPrePubliObservadas = (data: any, pageIndex, pageSize) => {

        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
            queryParam = queryParam.set("idEtapaProceso", data.idEtapaProceso);
        }
        if (data.idInstancia !== null && data.idInstancia > 0) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null && data.idSubInstancia > 0) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.codigoModular !== null && data.codigoModular > 0) {
            queryParam = queryParam.set("codigoModular", data.codigoModular);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza > 0) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }

        queryParam = queryParam.set("pageIndex", pageIndex);
        queryParam = queryParam.set("pageSize", pageSize);

        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/observadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    exportarPrePubliObservadas = (data: any) => {
        let queryParam = new HttpParams();

        if (data.idDesarrolloProceso !== null && data.idDesarrolloProceso > 0) {
            queryParam = queryParam.set("idDesarrolloProceso", data.idDesarrolloProceso);
        }
        if (data.operacion !== null && data.operacion > 0) {
            queryParam = queryParam.set("operacion", data.operacion);
        }

        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/observadas/exportar";
        return this._http.post(`${url}`, queryParam);
    }
    
    exportarPrePublicacionPlazasObservadas = (data: any) => {
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/observadas/exportar";
        return this._http.post(`${url}`, data);
    }

    getPrePubPlaPlazasParaReasignacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();

        if (data.idDesarrolloProceso !== null && data.idDesarrolloProceso > 0) {
            queryParam = queryParam.set("idDesarrolloProceso", data.idDesarrolloProceso);
        }
        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
            queryParam = queryParam.set("idEtapaProceso", data.idEtapaProceso);
        }
        if (data.codigoModular !== null && data.codigoModular > 0) {
            queryParam = queryParam.set("codigoModular", data.codigoModular);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza > 0) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }

        queryParam = queryParam.set("pageIndex", pageIndex);
        queryParam = queryParam.set("pageSize", pageSize);

        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/plazasparareasignacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    exportarPrePubPlaPlazasParaReasignacion = (data: any) => {
        let queryParam = new HttpParams();

        if (data.idDesarrolloProceso !== null && data.idDesarrolloProceso > 0) {
            queryParam = queryParam.set("idDesarrolloProceso", data.idDesarrolloProceso);
        }
        if (data.idEtapaProceso !== null && data.idEtapaProceso > 0) {
            queryParam = queryParam.set("idEtapaProceso", data.idEtapaProceso);
        }
        if (data.codigoModular !== null && data.codigoModular > 0) {
            queryParam = queryParam.set("codigoModular", data.codigoModular);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza > 0) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }

        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/plazasparareasignacion/exportar";
        return this._http.post(`${url}`, data);
    }

    getPrePubPlaPlazaById = (idPlaza : any) => {
        let url = this.basePath.reasignacionesApi + "/prepublicacionplazas/plaza/"+ idPlaza ;
        return this._http.get<any>(`${url}`);
    }
}