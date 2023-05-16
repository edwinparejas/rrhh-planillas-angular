import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestangularBasePath } from '../base-path/restangular-base-path';
import { LicenciasRestangularService } from './resources/licencias-restangular.service';
import { convertObjectToGetParams } from '@minedu/functions/http.helpers';
import { allowedNodeEnvironmentFlags } from 'process';

@Injectable({
    providedIn: 'root',
})
export class LicenciasService {
    constructor(
        private _http: HttpClient,
        private basePath: RestangularBasePath, 
        private restangular: LicenciasRestangularService) { }

    getComboTiposDocumento = (): Observable<any> => {
        return this.restangular.all('tiposdocumentoidentidad').get();
    }

    getComboTiposDescanso = (): Observable<any> => {
        return this.restangular.all('tiposdescanso').get();
    }

    getComboTiposDescansoPorRegimenGrupoAccion = (idRegimenGrupoAccion: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idRegimenGrupoAccion !== null) {
            queryParam = queryParam.set('idRegimenGrupoAccion', idRegimenGrupoAccion);
        }
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposdescanso/regimengrupoaccion').get(queryParam);
    }

    getComboEntidadesAtencion = (): Observable<any> => {
        return this.restangular.all('entidadesatencion').get();
    }
    
    entidadPassport = (pCodigoSede: any): Observable<any> => {
        let queryParam = new HttpParams()
        .set("codigoEntidadSede", pCodigoSede);
        let url = this.basePath.licenciasApi + "/entidadessede";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    obtenerPermisosLicenciaSalud = (codigoRolPassport: string, codigoTipoSede: string): Observable<any> => {
        let queryParam = new HttpParams()
        .set("codigoRolPassport", codigoRolPassport)
        .set("codigoTipoSede", codigoTipoSede);
        let url = this.basePath.licenciasApi + "/permisos/licenciasalud";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getComboMotivosAccion = (request: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (request.idGrupoAccion !== null) {
            queryParam = queryParam.set('idGrupoAccion', request.idGrupoAccion);
        }
        if (request.idAccion !== null) {
            queryParam = queryParam.set('idAccion', request.idAccion);
        }
        if (request.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                'idRegimenLaboral',
                request.idRegimenLaboral
            );
        }
        if (request.codigoRolPassport !== null) {
            queryParam = queryParam.set(
                'codigoRolPassport',
                request.codigoRolPassport
            );
        }
        if (request.esSalud !== null) {
            queryParam = queryParam.set('esSalud', request.esSalud);
        }
        if (request.activo !== null) {
            queryParam = queryParam.set('activo', request.activo);
        }
        return this.restangular.all('MotivosAccion').get(queryParam);
    }

    getListaServidorPublico = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idDre)
            queryParam = queryParam.set('idDre', data.idDre);
        if (data.idUgel) 
            queryParam = queryParam.set('idUgel', data.idUgel);

        if (data.idTipoDocumentoIdentidad) 
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        
        if (data.numeroDocumentoIdentidad) 
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        
        let url = this.basePath.licenciasApi + "/servidorespublicos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    busquarPersona = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumentoIdentidad) 
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        
        if (data.numeroDocumentoIdentidad) 
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);

        if (data.primerApellido) 
            queryParam = queryParam.set('primerApellido', data.primerApellido);
        
        if (data.segundoApellido) 
            queryParam = queryParam.set('segundoApellido', data.segundoApellido);
        
        if (data.nombres)
            queryParam = queryParam.set('nombres', data.nombres);
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        let url = this.basePath.licenciasApi + "/personas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getListaLicenciasBienestar = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idServidorPublico !== null) {
            queryParam = queryParam.set(
                'idServidorPublico',
                data.idServidorPublico
            );
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('licenciasBienestar').get(queryParam);
    }

    exportarListaLicenciasBienestar(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idServidorPublico !== null) {
            queryParam = queryParam.set(
                'idServidorPublico',
                data.idServidorPublico
            );
        }
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular
            .all('licenciasBienestar/exportar/')
            .download(null, queryParam);
    }

    getListaLicenciasResumen = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }

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

        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                'idRegimenLaboral',
                data.idRegimenLaboral
            );
        }

        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'codigoCentroTrabajo',
                data.codigoCentroTrabajo
            );
        }

        /*
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
        */

        if (data.idSituacionLaboral !== null) {
            queryParam = queryParam.set('idSituacionLaboral', data.idSituacionLaboral);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular.all('licenciasOtras/resumen/').get(queryParam);
    }

    exportarListaLicenciasResumen(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }

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

        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                'idRegimenLaboral',
                data.idRegimenLaboral
            );
        }

        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'codigoCentroTrabajo',
                data.codigoCentroTrabajo
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

        return this.restangular
            .all('licenciasOtras/exportar/resumen/')
            .download(null, queryParam);
    }

    getListaLicenciasBienestarResumen = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }

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

        if (data.codigoModular !== null) {
            queryParam = queryParam.set(
                'codigoModular',
                data.codigoModular
            );
        }

        if (data.idMotivoAccion !== null) {
            queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion);
        }

        if (data.idEstadoLicencia !== null) {
            queryParam = queryParam.set(
                'idEstadoLicencia',
                data.idEstadoLicencia
            );
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular
            .all('licenciasBienestar/resumen/')
            .get(queryParam);
    }

    exportarListaLicenciasBienestarResumen(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();

        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }

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

        if (data.primeroApellido !== null) {
            queryParam = queryParam.set(
                'primeroApellido',
                data.primeroApellido
            );
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

        if (data.idMotivoAccion !== null) {
            queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion);
        }

        if (data.idEstadoLicencia !== null) {
            queryParam = queryParam.set(
                'idEstadoLicencia',
                data.idEstadoLicencia
            );
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular
            .all('licenciasBienestar/exportar/resumen/')
            .download(null, queryParam);
    }

    getRegimenLaboral = (activo) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('regimeneslaborales').get(queryParam);
    }

    getCargo(idRegimenLaboral: string) {
        return this.restangular
            .one('regimeneslaborales', idRegimenLaboral)
            .all('cargos')
            .get();
    }

    getBuscarInstitucionEducativa(codigoModular: string) {
        return this.restangular
            .one('institucioneducativa', codigoModular)
            .get();
    }

    crearLicencia(data: any): Observable<any> {
        let url = this.basePath.licenciasApi + "/licenciasbienestar";
        return this._http.post<any>(`${url}`, data);
    }

    getAccionGrupoById = (idAccion: string) => {
        return this.restangular.one('gruposaccion', idAccion).get();
    }

    getAccion = (
        idGrupoAccion = null,
        idRegimenLaboral = null,
        activo = null
    ) => {
        let queryParam = new HttpParams();
        if (idGrupoAccion !== null) {
            queryParam = queryParam.set('idGrupoAccion', String(idGrupoAccion));
        }
        if (idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                'idRegimenLaboral',
                String(idRegimenLaboral)
            );
        }
        if (activo !== null) {
            queryParam = queryParam.set('activo', String(activo));
        }
        return this.restangular.all('acciones').get(queryParam);
    }

    getTiposCertificado = (activo) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposcertificado').get(queryParam);
    }

    getServidorPublico(idServidorPublico) {
        let url = this.basePath.licenciasApi + `/servidorespublicos/${idServidorPublico}`;
        return this._http.get<any>(`${url}`);
    }
    
    getPlaza(codigoPlaza: string, idServidorPublico: any): Observable<any> {
        let queryParam = new HttpParams()
        .set("codigoPlaza", codigoPlaza)
        .set("idServidorPublico", idServidorPublico); 
        var url = this.basePath.licenciasApi + `/plazas`;
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    getVinculaciones = (data: any): Observable<any> => {
        let url = this.basePath.licenciasApi + "/servidorespublicos/vinculaciones";
        return this._http.post<any>(`${url}`, data);
    };

    getTiposSustento = (activo) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tipossustento').get(queryParam);
    }

    getTiposFormato = (activo) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposformato').get(queryParam);
    }

    getTiposResolucion = (activo = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposresolucion').get(queryParam);
    }

    getLicencia = (idLicencia) => {
        return this.restangular.one('licenciasotras', idLicencia).get();
    }

    deleteLicencia = (idLicencia: any, origen: any, usuarioRegistro: any): Observable<any> => {
        /*
        return this.restangular
            .one('licenciasotras', idLicencia)
            .patch({ idLicencia: idLicencia, origen: 1 });
            */
        return this.restangular
            .one('licenciasotras', idLicencia + '/' + origen + '/' + usuarioRegistro)
            .patch({ idLicencia: idLicencia, origen: origen, usuarioRegistro: usuarioRegistro });
    }

    enviarLicencia = (idLicencia: any, usuarioRegistro: any): Observable<any> => {
        const data = {
            idLicencia: idLicencia,
            usuarioRegistro: usuarioRegistro
        }
        return this.restangular
            .all('licenciasotras').all('enviarlicencia')
            .post(data);
    }


    generarLicencia = (data: any): Observable<any> => {
        return this.restangular
            .all("licenciasotras").all("generarproyecto").post(data);
    }

    enviarAccionesGrabadas = (data: any): Observable<any> => {
        return this.restangular
            .all('licenciasotras').all('enviaraccionesgrabadas')
            .post(data);
    }

    modificarLicencia = (data: any): Observable<any> => {
        return this.restangular.all('licenciasotras').put(data);
    }

    getComboEstadoLicencia = (activo = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', String(activo));
        }
        return this.restangular.all('estadoslicencia').get(queryParam);
    }

    getLicenciaResumen = (request: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (request.anio !== null) {
            queryParam = queryParam.set('anio', request.anio);
        }
        if (request.idServidorPublico !== null) {
            queryParam = queryParam.set(
                'idServidorPublico',
                request.idServidorPublico
            );
        }
        if (request.idGrupoAccion !== null) {
            queryParam = queryParam.set('idGrupoAccion', request.idGrupoAccion);
        }
        if (request.idAccion !== null) {
            queryParam = queryParam.set('idAccion', request.idAccion);
        }
        if (request.idMotivoAccion !== null) {
            queryParam = queryParam.set(
                'idMotivoAccion',
                request.idMotivoAccion
            );
        }
        return this.restangular
            .all('licenciasotras/calculardiasacumulados')
            .get(queryParam);
    }

    getListaLicenciasOtras = (
        request: any,
        paginaActual,
        tamanioPagina
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (request.idServidorPublico !== null) {
            queryParam = queryParam.set(
                'idServidorPublico',
                request.idServidorPublico
            );
        }
        if (request.anio !== null) {
            queryParam = queryParam.set('anio', request.anio);
        }
        if (request.idAccion !== null) {
            queryParam = queryParam.set('idAccion', request.idAccion);
        }
        if (request.idMotivoAccion !== null) {
            queryParam = queryParam.set(
                'idMotivoAccion',
                request.idMotivoAccion
            );
        }
        if (request.idEstadoLicencia !== null) {
            queryParam = queryParam.set(
                'idEstadoLicencia',
                request.idEstadoLicencia
            );
        }
        if (paginaActual !== null) {
            queryParam = queryParam.set('paginaActual', paginaActual);
        }
        if (tamanioPagina !== null) {
            queryParam = queryParam.set('tamanioPagina', tamanioPagina);
        }
        return this.restangular.all('licenciasotras').get(queryParam);
    }

    exportatListaLicenciasOtras = (request: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (request.idServidorPublico !== null) {
            queryParam = queryParam.set(
                'idServidorPublico',
                request.idServidorPublico
            );
        }
        if (request.anio !== null) {
            queryParam = queryParam.set('anio', request.anio);
        }
        if (request.idAccion !== null) {
            queryParam = queryParam.set('idAccion', request.idAccion);
        }
        if (request.idMotivoAccion !== null) {
            queryParam = queryParam.set(
                'idMotivoAccion',
                request.idMotivoAccion
            );
        }
        if (request.idEstadoLicencia !== null) {
            queryParam = queryParam.set(
                'idEstadoLicencia',
                request.idEstadoLicencia
            );
        }

        return this.restangular
            .all('licenciasotras/exportar')
            .download(null, queryParam);
    }

    getComboTiposParto = (): Observable<any> => {
        return this.restangular.all('tiposparto').get();
    }

    getComboLugarDesceso = (): Observable<any> => {
        return this.restangular.all('lugaresdesceso').get();
    }

    getComboTiposdiagnostico = (): Observable<any> => {
        return this.restangular.all('tiposdiagnostico').get();
    }

    getFamiliarServidorPublico = (
        request: any,
        paginaActual,
        tamanioPagina
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (request.idPersona !== null) {
            queryParam = queryParam.set('idPersona', request.idPersona);
        }
        if (request.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'idTipoDocumentoIdentidad',
                request.idTipoDocumentoIdentidad
            );
        }
        if (request.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'numeroDocumentoIdentidad',
                request.numeroDocumentoIdentidad
            );
        }
        if (request.primerApellido !== null) {
            queryParam = queryParam.set(
                'primerApellido',
                request.primerApellido
            );
        }
        if (request.segundoApellido !== null) {
            queryParam = queryParam.set(
                'segundoApellido',
                request.segundoApellido
            );
        }
        if (request.nombres !== null) {
            queryParam = queryParam.set('nombres', request.nombres);
        }
        /*     if (paginaActual !== null) {
                queryParam = queryParam.set('paginaActual', paginaActual);
            }
            if (tamanioPagina !== null) {
                queryParam = queryParam.set('tamanioPagina', tamanioPagina); 
            }*/
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);
        return this.restangular.all('familiaresservidorpublico').get(queryParam);
    }

    getInstancia(activo: any) {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        return this.restangular.all('instancias').get(queryParam);
    }

    getSubinstancia(idInstancia: any, activo: any) {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        if (idInstancia !== null) { queryParam = queryParam.set('idInstancia', idInstancia); }

        return this.restangular
            .all('instancias/subinstancias')
            .get(queryParam);
        // return this.restangular.one('instancias', idInstancia).all('subinstancias').get(queryParam);
    }

    getTipoCentroTrabajo(idNivelInstancia: any, activo: any) {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', idNivelInstancia); }
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        return this.restangular.all('tiposcentrotrabajo').get(queryParam);
    }

    listarCentroTrabajo(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idInstancia !== null && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia !== null && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('centrostrabajo').get(queryParam);
    }

    // it doesn´t use    
    getDre() {
        return this.restangular.all('dres').get();
    }

    getUgel(idDre: string) {
        return this.restangular.one('ugeles', idDre).get();
    }

    getModalidadEducativa() {
        return this.restangular.all('modalidadeseducativa').get();
    }

    getNivelEducativo(idModalidadEducativa) {
        return this.restangular.one('niveleseducativo', idModalidadEducativa).get();
    }

    listarInstitucionEducativa(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.idDre !== null) { queryParam = queryParam.set('idDre', data.idDre); }
        if (data.idUgel !== null) { queryParam = queryParam.set('idUgel', data.idUgel); }
        if (data.idModalidadEducativa !== null) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
        if (data.idNivelEducativo !== null) { queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo); }
        if (data.codigoModular !== null) { queryParam = queryParam.set('codigoModular', data.codigoModular); }
        if (data.institucionEducativa !== null) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('institucioneducativa').get(queryParam);

    }

    validarFechas = (data: any): Observable<any> => {
        console.log("body", data);
        return this.restangular
            .all('licenciasotras').all('validarfechas')
            .post(data);
    }

    getCentroTrabajoByCodigo(codigoCentroTrabajo: any, activo: any) {
        let queryParam = new HttpParams();
        if (codigoCentroTrabajo !== null) { queryParam = queryParam.set('codigoCentroTrabajo', codigoCentroTrabajo); }
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        return this.restangular.all('centrostrabajo/buscarporcodigo').get(queryParam);

    }

    getSituacionLaboral = (activo) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('situacioneslaboral').get(queryParam);
    }

}
