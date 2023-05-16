import { HttpParams, HttpClient } from '@angular/common/http';
import { ConditionalExpr } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RestangularBasePath } from '../base-path/restangular-base-path';
import { AccionesPersonalDesplRestangularService } from './resources/acciones-personal-despl-restangular.service';
import { PostulacionModel } from '../../../main/apps/procesos/contratacion/models/contratacion.model';

@Injectable({
    providedIn: 'root'
})
export class AccionDesplazamientoService {


    constructor(
        private restangular: AccionesPersonalDesplRestangularService,
        private basePath: RestangularBasePath,
        private _http: HttpClient
    ) {
    }

    entidadPassport = (codigoEntidadSede: string): Observable<any> => {
        let queryParam = new HttpParams()
            .set("codigoEntidadSede", codigoEntidadSede);

        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/entidadPassport`;
        return this._http.get(url, { params: queryParam });

    }

    getRolCentroTrabajo = (codigoRolPassport: string, codigoCentroTrabajo: string): Observable<any> => {

        let queryParam = new HttpParams()
            .set("codigoRolPassport", codigoRolPassport)
            .set("codigoCentroTrabajo", codigoCentroTrabajo);
        const url = `${this.basePath.accionesDesplazamientoApi}/rolcentrotrabajo`;
        return this._http.get(url, { params: queryParam });
    };


    getComboEstadosDesplazamiento = (): Observable<any> => {
        const url = `${this.basePath.accionesDesplazamientoApi}/estado`;
        return this._http.get(url);
    };

    getComboTipoDocumento = (): Observable<any> => {
        const url = `${this.basePath.accionesDesplazamientoApi}/tipodocumento`;
        return this._http.get(url);
    }

    getComboTipoDocumentoSustento = (): Observable<any> => {
        const url = `${this.basePath.accionesDesplazamientoApi}/tipodocumentosustento`;
        return this._http.get(url);

    }

    generarProyectoResolucion = (data): Observable<any> => {
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/registrarProyectoResolucion`;
        return this._http.post(url, data);
    }

    getComboRegimenLaboral = (pIdRolPassport: any, pIdNivelInstancia: any, activo: any): Observable<any> => {

        let queryParam = new HttpParams();
        queryParam = queryParam.append("idRolPassport", pIdRolPassport);
        queryParam = queryParam.append("idNivelInstancia", pIdNivelInstancia);

        if (activo !== null) {
            queryParam = queryParam.append("activo", activo);
        }

        const url = `${this.basePath.accionesDesplazamientoApi}/regimenlaboral`;
        return this._http.get(url, { params: queryParam });
    };

    getComboMandatoJudicial = (): Observable<any> => {
        return this.restangular.all("motivojudicial").get();
    }
    getComboGrupoAccion = (data: any, pIdRolPassport: any, pIdNivelInstancia: any, activo: any): Observable<any> => {
        console.log("accion", data, pIdRolPassport, pIdNivelInstancia);
        let queryParam = new HttpParams()
            .set("idRolPassport", pIdRolPassport)
            .set("idNivelInstancia", pIdNivelInstancia)
            .set("idRegimenLaboral", data);


        if (activo !== null) {
            queryParam = queryParam.append("activo", activo);
        }

        const url = `${this.basePath.accionesDesplazamientoApi}/grupoaccion`;
        return this._http.get(url, { params: queryParam });
    }

    getComboAccion = (data: any, pIdRolPassport: any, pIdNivelInstancia: any, idRegimen: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams()
            .set("idRolPassport", pIdRolPassport)
            .set("idNivelInstancia", pIdNivelInstancia)
            .set("idRegimenLaboral", idRegimen)
            .set("idGrupoAccion", data)

        if (activo !== null) {
            queryParam = queryParam.append("activo", activo);
        }
        const url = `${this.basePath.accionesDesplazamientoApi}/accion`;
        return this._http.get(url, { params: queryParam });
    }
    getComboTipoResolucion = (): Observable<any> => {
        const url = `${this.basePath.accionesDesplazamientoApi}/tipoResolucion`;
        return this._http.get(url);
    }
    getComboTipoFormato = (): Observable<any> => {
        const url = `${this.basePath.accionesDesplazamientoApi}/formatodocumentosustento`;
        return this._http.get(url);
    }

    getMotivoAccion = (data: any, pIdRolPassport: any, pIdNivelInstancia: any, idRegimen: any, idGrupoAccion: any, activo: any): Observable<any> => {

        let queryParam = new HttpParams()
            .set("idRolPassport", pIdRolPassport)
            .set("idNivelInstancia", pIdNivelInstancia)
            .set("idRegimenLaboral", idRegimen)
            .set("idGrupoAccion", idGrupoAccion)
            .set("idAccion", data);

        if (activo !== null) {
            queryParam = queryParam.append("activo", activo);
        }

        const url = `${this.basePath.accionesDesplazamientoApi}/motivoaccion`;
        return this._http.get(url, { params: queryParam });
    }

    getPlazaOrigen = (data: any, idServidoPublico: any): Observable<any> => {
        let queryParam = new HttpParams()
            .set("idServidorPublico", idServidoPublico)
            .set("codigoPlaza", data);

        const url = `${this.basePath.accionesDesplazamientoApi}/plazaorigen`;
        return this._http.get(url, { params: queryParam });

    }

    validarAdjudicacionByServidorPublico = (data: any): Observable<any> => {
        let queryParam = new HttpParams()
            .set("idServidorPublico", data.idServidorPublico);

        const url = `${this.basePath.accionesDesplazamientoApi}/validarAdjudicacion`;
        return this._http.get(url, { params: queryParam });
    }

    getPlazaDestino = (request: any): Observable<any> => {
        let queryParam = new HttpParams();

        if (request.idRegimenLaboral) queryParam = queryParam.append("idRegimenLaboral", request.idRegimenLaboral);
        if (request.idGrupoAccion) queryParam = queryParam.append("idGrupoAccion", request.idGrupoAccion);
        if (request.idMotivoAccion) queryParam = queryParam.append("idMotivoAccion", request.idMotivoAccion);
        if (request.codigoPlazaDestino) queryParam = queryParam.append("codigoPlazaDestino", request.codigoPlazaDestino);
        if (request.codigoPlazaOrigen) queryParam = queryParam.append("codigoPlazaOrigen", request.codigoPlazaOrigen);
        if (request.idServidorPublicoOrigen) queryParam = queryParam.append("idServidorPublicoOrigen", request.idServidorPublicoOrigen);
        if (request.idAccion) queryParam = queryParam.append("idAccion", request.idAccion);
        if (request.fechaInicioAccion) queryParam = queryParam.append("fechaInicioAccion", request.fechaInicioAccion);
        if (request.esPorProceso) queryParam = queryParam.append("esPorProceso", request.esPorProceso);

        const url = `${this.basePath.accionesDesplazamientoApi}/plazadestino`;
        return this._http.get(url, { params: queryParam });
    }

    getPlazaDestinoSugerida = (request: any): Observable<any> => {
        const url = `${this.basePath.accionesDesplazamientoApi}/plazadestino/sugerida`;
        return this._http.post(url, request);
    }

    getComboCargaRemunerativaPorRegimenLaboral = (regimenLaboralId: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (regimenLaboralId) {
            queryParam = queryParam.set("regimenLaboralId", regimenLaboralId);
        }

        const url = `${this.basePath.accionesDesplazamientoApi}/categoriaremunerativa/porregimenlaboral`;
        return this._http.get(url, { params: queryParam });
    }

    getListarAccionPersonal = (data: any, pageIndex, pageSize): Observable<any> => {
        console.log("enviar fecha", data)
        data.paginaActual = pageIndex;
        data.tamanioPagina = pageSize;

        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal`;
        return this._http.get(url, { params: data });

    }

    exportarExcelAccionPersonal = (data: any) => {
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/exportar`;
        return this._http.post(url, data);
    }


    getListarServidorPublico = (data: any, pageIndex, pageSize): Observable<any> => {
        console.log('getListarServidorPublico');
        data.paginaActual = pageIndex;
        data.tamanioPagina = pageSize;

        const url = `${this.basePath.accionesDesplazamientoApi}/servidorespublicos`;
        return this._http.get(url, { params: data });
    }

    validarSancion = (idServidorPublico: any): Observable<any> => {
        const data = { idServidorPublico };
        const url = `${this.basePath.accionesDesplazamientoApi}/servidorespublicos/validasancion`;
        return this._http.get(url, { params: data });
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

        const url = `${this.basePath.accionesDesplazamientoApi}/informeescalafonario`;
        return this._http.get(url, { params: queryParam });
    };

    buscarPlaza(data: any, pageIndex, pageSize): Observable<any> {
        data.paginaActual = pageIndex;
        data.tamanioPagina = pageSize;

        const url = `${this.basePath.accionesDesplazamientoApi}/plaza`;
        return this._http.get(url, { params: data });
    }

    buscarVinculacionesPorPersona(data: any, paginaActual: any, tamanioPagina: any): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
            .set('paginaActual', paginaActual)
            .set('tamanioPagina', tamanioPagina);

        const url = `${this.basePath.accionesDesplazamientoApi}/vinculacion`;
        return this._http.get(url, { params: data });
    }

    registrarAccionPersonal(data: any): Observable<any> {
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/registrarAccionPersonal`;
        return this._http.post(url, data);
    }

    buscarCentroTrabajo(data: any, pageIndex, pageSize): Observable<any> {
        data.paginaActual = pageIndex;
        data.tamanioPagina = pageSize;

        const url = `${this.basePath.accionesDesplazamientoApi}/centrostrabajo`;
        return this._http.get(url, { params: data });
    }

    getComboInstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        const url = `${this.basePath.accionesDesplazamientoApi}/instancias/filtroInstancia`;
        return this._http.get(url, { params: queryParam });
    }

    getComboSubinstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);
        if (data.idInstancia !== null) queryParam = queryParam.append("idInstancia", data.idInstancia);

        const url = `${this.basePath.accionesDesplazamientoApi}/instancias/filtroSubInstancia`;
        return this._http.get(url, { params: queryParam });
    }

    // listarInstancia(activo: any, rolPassport: any) {
    //     let queryParam = new HttpParams();
    //     if (activo !== null) {
    //         queryParam = queryParam.set("activo", activo);
    //     }
    //     if (rolPassport !== null) {
    //         queryParam = queryParam.set("idRolPassport", rolPassport);
    //     }
    //     return this.restangular.all("instancias").get(queryParam);
    // }



    listarSubinstancia(idInstancia: any, activo: any) {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        queryParam = queryParam.set("idInstancia", idInstancia);

        const url = `${this.basePath.accionesDesplazamientoApi}/subinstancias`;
        return this._http.get(url, { params: queryParam });
    }

    listarTipoCentroTrabajo(rolPassport: any, idNivelInstancia: any) {
        let queryParam = new HttpParams();

        if (rolPassport !== null) {
            queryParam = queryParam.set("idRolPassport", rolPassport);
        }

        if (idNivelInstancia !== null) {
            queryParam = queryParam.set("idNivelInstancia", idNivelInstancia);
        }
        console.log('Querys', queryParam)

        const url = `${this.basePath.accionesDesplazamientoApi}/tipocentrotrabajo`;
        return this._http.get(url, { params: queryParam });
    }


    obtenerCentroTrabajoPorCodigoSede = (data: any): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);


        const url = `${this.basePath.accionesDesplazamientoApi}/centrostrabajo/centrotrabajoporcodigosede`;
        return this._http.get(url, { params: queryParam });
    };

    getTipoCentroTrabajo = (idNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        const url = `${this.basePath.accionesDesplazamientoApi}/tipocentrotrabajo`;
        return this._http.get(url, { params: queryParam });
    };


    getModalidadEducativa() {
        const url = `${this.basePath.accionesDesplazamientoApi}/modalidadeseducativa`;
        return this._http.get(url);
    }

    getNivelEducativo(idModalidadEducativa) {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("idModalidadEducativa", idModalidadEducativa);
        const url = `${this.basePath.accionesDesplazamientoApi}/niveleseducativo`;

        return this._http.get(url, { params: queryParam });
    }

    buscarCentrosTrabajoPaginado(data: any, pageIndex, pageSize) {
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

        const url = `${this.basePath.accionesDesplazamientoApi}/centrostrabajo`;

        return this._http.get(url, { params: queryParam });
    };

    getInformacionPersonalAccion(data) {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("idAccionPersonal", data);
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/accionpersonabyid`;
        return this._http.get(url, { params: queryParam });
    }

    getInformacionPersonalAprobacion(data) {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("idAccionPersonal", data);

        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/obteneraccionpersonalaprobacion`;
        return this._http.get(url, { params: queryParam });
    }

    getInformacionAccionPersonal(data) {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("idAccionPersonal", data);

        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/accionpersonalparaedicion`;
        return this._http.get(url, { params: queryParam });

    }

    eliminarAccionPersonal(data: any) {
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/Eliminaraccionpersonal`;
        return this._http.post(url, data);
    }

    aprobarAccionPersonal(data: any) {
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/aprobaraccionpersonal`;
        return this._http.post(url, data);
    }

    desaprobarAccionPersonal(data: any) {
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/desaprobaraccionpersonal`;
        return this._http.post(url, data);
    }

    enviarAccionesGrabadas(data: any) {
        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/accionesgrabadas`;
        return this._http.post(url, data);
    }

    getObtenerCodigoDreUgel(codigoTipoSede: string) {
        let queryParam: HttpParams = new HttpParams().set(
            "codigoEntidadSede", codigoTipoSede);

        const url = `${this.basePath.accionesDesplazamientoApi}/accionpersonal/obtienecodigosdreugel`;
        return this._http.get(url, { params: queryParam });
    }

}


