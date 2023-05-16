import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    EtapaResponseModel,
    IPlazaRotacionModel,
    IRotacionGridModel
} from 'app/main/apps/procesos/rotacion/models/rotacion.model';
import { BehaviorSubject,Observable, of } from 'rxjs';
import { RotacionRestangularService } from './resources/rotacion.restangular.service';
import { StorageService } from './storage.service';
import { IPassportResponse } from '../../../../app/main/apps/acciones/pronoei/interfaces/passport.interface';
import { IEntidadSedeResponse } from '../../../../app/main/apps/acciones/pronoei/interfaces/entidad-sede.interface';

import { LocalStorageService } from "@minedu/services/secure/local-storage.service";
import { InstanciaModel, PassportRolModel } from '../../model/security/passport-rol.model';
import { PASSPORT_ROL_SELECTED, INSTANCIA_SELECTED } from '../../../config/auth.config';
import { RestangularBasePath } from '../base-path/restangular-base-path';

@Injectable({
    providedIn: 'root',
})
export class RotacionService {

    private codigoDreUgelSubject = new BehaviorSubject<IEntidadSedeResponse>(null);
    

    constructor(private restangular: RotacionRestangularService, 
        private storageService: StorageService, 
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private localStorageService: LocalStorageService) {

    }

    //En Uso
    getComboRegimenLaboral = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        const codigoRolPassport = this.storageService.getPassportRolSelected().CODIGO_ROL;
        queryParam = queryParam.set('codigoRolPassport', codigoRolPassport);
        //return this.restangular.all('regimeneslaborales').get(queryParam);
        let url = this.basePath.rotacionApi + "/regimeneslaborales";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    //En Uso
    getComboTipoProceso = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('tiposproceso').get(queryParam);
        let url = this.basePath.rotacionApi + "/tiposproceso";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    //En Uso
    getComboDescripcionMaestroProceso = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('descripcionesmaestroproceso').get(queryParam);
        let url = this.basePath.rotacionApi + "/descripcionesmaestroproceso";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    //En Uso
    getComboMotivosNoPublicacion = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('motivosnopublicacion').get(queryParam);
        let url = this.basePath.rotacionApi + "/motivosnopublicacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    //En Uso
    getComboTiposDocumentoSustento = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('tiposdocumentossustento').get(queryParam);
        let url = this.basePath.rotacionApi + "/tiposdocumentossustento";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
    //En Uso
    getComboTiposDocumentoFormato = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('tiposformatosustento').get(queryParam);
        let url = this.basePath.rotacionApi + "/tiposformatosustento";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboEstadoDesarrolloProceso = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('estadosdesarrolloproceso').get(queryParam);
        let url = this.basePath.rotacionApi + "/estadosdesarrolloproceso";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getCentroTrabajoUsuario = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        /*
        const codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;        
        queryParam = queryParam.set('codigoSede', codigoSede);
        */

        let codSede = this.passportModel.CODIGO_SEDE;
        if (this.passportModel.CODIGO_ROL == 'AYNI_019' && this.passportInstanciaModel) {
            codSede = this.passportInstanciaModel.codigoInstancia;
            // console.log( this.passportInstanciaModel.codigoInstancia);
            queryParam = queryParam.set('codigoSede', codSede);
        } else {
            const codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;        
            queryParam = queryParam.set('codigoSede', codigoSede);
        }
        // console.log('getCentroTrabajoUsuario', queryParam);
        // return this.restangular.all('centrostrabajo').get(queryParam);
        let url = this.basePath.rotacionApi + "/centrostrabajo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboInstancia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('dres').get(queryParam);
        let url = this.basePath.rotacionApi + "/dres";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboSubInstancia = (pIdInstancia: any, activo: any) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular
        //     .one('dres', pIdInstancia)
        //     .all('ugeles')
        //     .get(queryParam);
    
        let url = this.basePath.rotacionApi + `/dre/${pIdInstancia}/ugeles`;
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboTipoCentroTrabajo = (pIdNivelInstancia: any, activo: any) => {
        let queryParam = new HttpParams();
        if (pIdNivelInstancia && pIdNivelInstancia > 0) {
            queryParam = queryParam.set('idNivelInstancia', pIdNivelInstancia);
        }
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('tiposcentrotrabajo').get(queryParam);
        let url = this.basePath.rotacionApi + "/tiposcentrotrabajo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboNivelEducativo = (pIdModalidadEducativa) => {
        //return this.restangular.one('modalidadeseducativas', pIdModalidadEducativa).all('niveleseducativos').get();
        let url = this.basePath.rotacionApi + `/modalidadeseducativas/${pIdModalidadEducativa}/niveleseducativos`;
        return this._http.get<any>(`${url}`);
    };

    getComboModalidadEducativa = () => {
        //return this.restangular.all('modalidadeseducativas').get();
        let url = this.basePath.rotacionApi + "/modalidadeseducativas";
        return this._http.get<any>(`${url}`);
    };

    getMotivosNoPublicacionPlazas = (param: any) => {
        //return this.restangular.all('motivosnopublicacionplazas').get();
        let url = this.basePath.rotacionApi + "/motivosnopublicacionplazas";
        return this._http.get<any>(`${url}`);
    };

    getComboDrePorRol = (pPassport: any) => {
        let queryParam: HttpParams = new HttpParams()
            .set('codigoSede', pPassport.CODIGO_SEDE)
            .set('codigoTipoSede', pPassport.CODIGO_TIPO_SEDE);
        return this.restangular.all('dres').all('parametrizado').get(queryParam);
    };

    getComboTiposCentroTrabajoPorRol = (pPassport: any): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
            .set('codigoTipoSede', pPassport.CODIGO_TIPO_SEDE)
            .set('codigoSede', pPassport.CODIGO_SEDE);
        //return this.restangular.all('tiposcentrotrabajo').all('parametrizado').get(queryParam);
        let url = this.basePath.rotacionApi + "/tiposcentrotrabajo/parametrizado";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboUgelPorRol = (pIdDre: any, pPassport: any) => {
        let queryParam: HttpParams = new HttpParams()
            .set('idDre', pIdDre)
            .set('codigoSede', pPassport.CODIGO_SEDE)
            .set('codigoTipoSede', pPassport.CODIGO_TIPO_SEDE);
        //return this.restangular.all('ugeles').all('parametrizado').get(queryParam);
        let url = this.basePath.rotacionApi + "/ugeles/parametrizado";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getGridCentroTrabajo(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia && data.idNivelInstancia > 0) {
            queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia);
        }
        if (data.idInstancia && data.idInstancia > 0) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubinstancia && data.idSubinstancia > 0) {
            queryParam = queryParam.set('idSubinstancia', data.idSubinstancia);
        }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) {
            queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo);
        }
        if ((data.institucionEducativa || '').trim().length !== 0) {
            queryParam = queryParam.set('institucionEducativa', data.institucionEducativa);
        }
        if (data.registrado) {
            queryParam = queryParam.set('registrado', data.registrado);
        }
        if (data.idModalidadEducativa && data.idModalidadEducativa > 0) {
            queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa);
        }
        if (data.idNivelEducativo && data.idNivelEducativo > 0) {
            queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        //return this.restangular.all('centrostrabajo').all('consultar').get(queryParam);
        let url = this.basePath.rotacionApi + "/centrostrabajo/consultar";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    //Eliminar
    getComboTipodocumentoIdentidad = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('tiposdocumentoidentidad').get();
        let url = this.basePath.rotacionApi + "/tiposdocumentoidentidad";
        return this._http.get<any>(`${url}`);
    };

    //Eliminar
    getComboCargo = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        /*if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }*/
        activo = true;
        queryParam = queryParam.set('activo', activo);
        //return this.restangular.all('cargos').get(queryParam);
        let url = this.basePath.rotacionApi + "/cargos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    /*for delete*/
    getComboEstado = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('estadosproceso').get();
        let url = this.basePath.rotacionApi + "/estadosproceso";
        return this._http.get<any>(`${url}`);
    };

    //Eliminar
    getComboEstadoAdjudicaciones = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('estadosadjudicacion').get();
        let url = this.basePath.rotacionApi + "/estadosadjudicacion";
        return this._http.get<any>(`${url}`);
    };

    getComboEstadoSubsanacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        //return this.restangular.all('estadossubsanacion').get();
        let url = this.basePath.rotacionApi + "/estadossubsanacion";
        return this._http.get<any>(`${url}`);
    };
    getComboGrupoCompetencia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        /*if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }*/
        activo = true;
        queryParam = queryParam.set('activo', activo);
        //return this.restangular.all('grupocompetencia').get(queryParam);
        let url = this.basePath.rotacionApi + "/grupocompetencia";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    //En Uso
    getListaEtapasProceso = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        const rol = this.storageService.getPassportRolSelected();
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        queryParam = queryParam.set('codigoRolPassport', rol.CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', rol.CODIGO_SEDE);
        queryParam = queryParam.set('codigoTipoSede', rol.CODIGO_TIPO_SEDE);

        if (data.anio) {
            queryParam = queryParam.set('anio', data.anio);
        }
        if (data.idRegimenLaboral) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idDescripcionMaestroProceso) {
            queryParam = queryParam.set('idDescripcionMaestroProceso', data.idDescripcionMaestroProceso);
        }
        if (data.idEstadoDesarrolloProceso) {
            queryParam = queryParam.set('idEstadoDesarrolloProceso', data.idEstadoDesarrolloProceso);
        }

        //return this.restangular.all('etapasproceso').get(queryParam);
        let url = this.basePath.rotacionApi + "/etapasproceso";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    //En Uso
    getProcesoPorId = (pIdEtapaProceso): Observable<any> => {
        //return this.restangular.one('etapasproceso', pIdEtapaProceso).get();
        let url = this.basePath.rotacionApi + `/etapasproceso/${pIdEtapaProceso}`;
        return this._http.get<any>(`${url}`);
    };


    getListaCalificacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumento !== null) {
            queryParam = queryParam.set(
                'idTipoDocumento',
                data.idTipoDocumento
            );
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'numeroDocumento',
                data.numeroDocumentoIdentidad
            );
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idGrupoCompetencia !== null) {
            queryParam = queryParam.set(
                'idGrupoCompetencia',
                data.idGrupoCompetencia
            );
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        //return this.restangular.all('calificaciones').get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getListaPlazas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }

        if (data.codigoModular !== null) {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }

        if (data.idEstado !== null) {
            queryParam = queryParam.set('idEstado', data.idEstado);
        }

        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        /*
        const listaFiltrada = listaPlazasTest.filter(
            (p) => p.idEstado == data.idEstado
        );
        const saltar = pageSize * (pageIndex - 1);
        const listaPaginada = listaFiltrada.filter(
            (p) => p.registro > saltar && p.registro <= saltar + pageSize
        );

        return of({ data: listaPaginada });*/
        //return this.restangular.all("adjudicaciones").get(queryParam);
        let url = this.basePath.rotacionApi + "/adjudicaciones";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    //En Uso
    exportarExcelRotacionPlazas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumento !== null) {
            queryParam = queryParam.set(
                'idTipoDocumento',
                data.idTipoDocumento
            );
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'numeroDocumento',
                data.numeroDocumentoIdentidad
            );
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.idCargo !== null) {
            queryParam = queryParam.set('idCargo', data.idCargo);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idEstado !== null) {
            queryParam = queryParam.set('idEstado', data.idEstado);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular
            .all('adjudicaciones/exportar/')
            .download(null, queryParam);
    };

    //En Uso
    exportarExcelRotacion(data: any): Observable<any> {
        const rol = this.storageService.getPassportRolSelected();
        data.codigoRolPassport = rol.CODIGO_ROL;
        data.codigoSede = rol.CODIGO_SEDE;

        //return this.restangular.all('etapasproceso').all('exportar').post(data);
        let url = this.basePath.rotacionApi + "/etapasproceso/exportar";
        return this._http.post<any>(`${url}`, data);
    }

    exportarExcelCalificaciones = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumento !== null) {
            queryParam = queryParam.set(
                'idTipoDocumento',
                data.idTipoDocumento
            );
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'numeroDocumento',
                data.numeroDocumentoIdentidad
            );
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idGrupoCompetencia !== null) {
            queryParam = queryParam.set(
                'idGrupoCompetencia',
                data.idGrupoCompetencia
            );
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }

        return this.restangular
            .all('calificaciones/exportar/')
            .download(null, queryParam);
    };


    //En Uso
    getPlazaById = (idPlaza) => {
        //return this.restangular.one('adjudicaciones', idPlaza).get();
        let url = this.basePath.rotacionApi + `/adjudicaciones/${idPlaza}`;
        return this._http.get<any>(`${url}`);
    };

    getDetalleCalificacion = (idCalificacion) => {
        //return this.restangular.one('calificaciones', idCalificacion).get();
        let url = this.basePath.rotacionApi + `/calificaciones/${idCalificacion}`;
        return this._http.get<any>(`${url}`);
    };

    getListaplazas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        //return this.restangular.all('plazas').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    ExportaExcelPlazasPrepublicadas(
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
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'codigoCentroTrabajo',
                data.codigoCentroTrabajo
            );
        }

        console.log('params', queryParam);
        return this.restangular
            .all('plazas/prepublicadas/exportar')
            .download(null, queryParam);
    }

    getListaPlazasContratacionObservadas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'codigoCentroTrabajo',
                data.codigoCentroTrabajo
            );
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular
        //     .all('plazascontratacion/observadas')
        //     .get(queryParam);
        let url = this.basePath.rotacionApi + "/plazascontratacion/observadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
    getListaGrupoModalidad = (idProceso, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idProceso', idProceso);
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        // return this.restangular.all('grupomodalidad').get(queryParam);
        let url = this.basePath.rotacionApi + "/grupomodalidad";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    ExportaExcelPlazasObservadas(
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
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'codigoCentroTrabajo',
                data.codigoCentroTrabajo
            );
        }
        /*   queryParam = queryParam.set('paginaActual', pageIndex);
          queryParam = queryParam.set('tamanioPagina', pageSize); */
        return this.restangular
            .all('plazascontratacion/observadas/exportar')
            .download(null, queryParam);
    }

    // getPlazaById = (idEtapa) => {
    //     return this.restangular.one("etapas", idEtapa).get();
    // };

    validarProceso(pIdEtapaProceso: any, pIdDesarrolloProceso: any): Observable<any> {
        const codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idEtapaProceso', pIdEtapaProceso);
        queryParam = queryParam.set('idDesarrolloProceso', pIdDesarrolloProceso);
        queryParam = queryParam.set('codigoSede', codigoSede);

        // return this.restangular.all('etapasproceso').all('validar').get(queryParam);
        let url = this.basePath.rotacionApi + "/etapasproceso/validar";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    convocarPlazas(data: any): Observable<any> {
        console.log(data);
        // return this.restangular.all('plazas/prepublicadas/convocar').post(data);
        let url = this.basePath.rotacionApi + "/plazas/prepublicadas/convocar";
        return this._http.post<any>(`${url}`, data);
    }


    observarPlazasPrepublicadas(data: any): Observable<any> {
        //return this.restangular.all('plazasprepublicadas').all('observar').post(data);
        let url = this.basePath.rotacionApi + "/plazasprepublicadas/observar";
        return this._http.post<any>(`${url}`, data);
    }

    getListaplazasContratacionConvocar = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'codigoCentroTrabajo',
                data.codigoCentroTrabajo
            );
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular
        //     .all('plazascontratacion/convocadas')
        //     .get(queryParam);
        let url = this.basePath.rotacionApi + "/plazascontratacion/convocadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    ExportaExcelPlazasConvocadas(
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
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                'codigoCentroTrabajo',
                data.codigoCentroTrabajo
            );
        }
        /*   queryParam = queryParam.set('paginaActual', pageIndex);
          queryParam = queryParam.set('tamanioPagina', pageSize); */
        return this.restangular
            .all('plazascontratacion/convocadas/exportar')
            .download(null, queryParam);
    }

    getComboMotivoNoPublicacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        // return this.restangular.all('motivosnopublicacion').get();
        let url = this.basePath.rotacionApi + "/motivosnopublicacion";
        return this._http.get<any>(`${url}`);
    };

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
        //return this.restangular.all('servidorespublicos').get(queryParam);
        let url = this.basePath.rotacionApi + "/servidorespublicos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    updateObservacionAjudicacion = (data: any) => {
        var ruta = 'adjudicaciones/' + data.idAdjudicacion + '/subsanar';
        //return this.restangular.all(ruta).post(data);
        let url = this.basePath.rotacionApi + `/${ruta}`;
        return this._http.post<any>(`${url}`, data);
    };

    AdjudicarAptos(data: any): Observable<any> {
        let ruta =
            'procesos/' + data.idProceso + '/' + data.idEtapa + '/adjudicar';
        //return this.restangular.all(url).post(data);
        let url = this.basePath.rotacionApi + `/${ruta}`;
        return this._http.post<any>(`${url}`, data);
    }

    Finalizar(data: any): Observable<any> {
        let ruta =
            'adjudicaciones/' +
            data.idProceso +
            '/' +
            data.idEtapa +
            '/finalizar';
        //return this.restangular.all(url).post(data);
        let url = this.basePath.rotacionApi + `/${ruta}`;
        return this._http.post<any>(`${url}`, data);
    }


    contarMasivoCargado(data: any): Observable<any> {
        let ruta =
            'calificaciones/' +
            data.idProceso +
            '/' +
            data.idEtapa +
            '/contarregistros';
        //return this.restangular.all(url).get(data);
        let url = this.basePath.rotacionApi + `/${ruta}`;
        return this._http.get<any>(`${url}`);
    }


    /**
     * _________________________________________________________________________________________________________
     * METODOS PLAZA
     * _________________________________________________________________________________________________________
     */
    getInformacionPlazaRotacion = (
        pIdPlazaRotacion: any,
        pIdPlazaRotacionDetalle: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (pIdPlazaRotacion) {
            queryParam = queryParam.set('idPlazaRotacion', pIdPlazaRotacion);
        }
        if (pIdPlazaRotacionDetalle) {
            queryParam = queryParam.set('idPlazaRotacionDetalle', pIdPlazaRotacionDetalle);
        }

        //return this.restangular.all('plazasrotacion').all('informacionplaza').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazasrotacion/informacionplaza";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getMotivoNoPublicacionPlazaRotacion = (
        pIdPlazaRotacion: any,
        pIdPlazaRotacionDetalle: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (pIdPlazaRotacion) {
            queryParam = queryParam.set('idPlazaRotacion', pIdPlazaRotacion);
        }
        if (pIdPlazaRotacionDetalle) {
            queryParam = queryParam.set('idPlazaRotacionDetalle', pIdPlazaRotacionDetalle);
        }

        // return this.restangular.all('plazasrotacion').all('motivonopublicacion').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazasrotacion/motivonopublicacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboResultadosFinales = (): Observable<any> => {
        // return this.restangular.all('resultadosfinalesplaza').get();
        let url = this.basePath.rotacionApi + "/resultadosfinalesplaza";
        return this._http.get<any>(`${url}`);
    };


    publicarPlazasRotacion = (
        data: any
    ): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;       
        // return this.restangular.all('plazasrotacion').all('publicarplazas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/publicarplazas";
        return this._http.post<any>(`${url}`, data);
    };

    aperturarPublicacionPlazasRotacion = (
        data: any
    ): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('plazasrotacion').all('aperturarpublicacion').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/aperturarpublicacion";
        return this._http.post<any>(`${url}`, data);
    };

    pdfPlazaRotacionPublicadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasrotacion').all('pdf').all('publicadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/pdf/publicadas";
        return this._http.post<any>(`${url}`, data);
    };

    pdfPlazaRotacionPrePublicadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasrotacion').all('pdf').all('prepublicadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/pdf/prepublicadas";
        return this._http.post<any>(`${url}`, data);
    };

    /**
     * _________________________________________________________________________________________________________
     * PLAZAS PREPUBLICADAS
     * _________________________________________________________________________________________________________
     */


    getGridPlazaRotacionPrepublicadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        let queryParam = new HttpParams();
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        // return this.restangular.all('plazasrotacion').all('prepublicadas').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazasrotacion/prepublicadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    exportarPlazaRotacionPrepublicadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasrotacion').all('exportar').all('prepublicadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/exportar/prepublicadas";
        return this._http.post<any>(`${url}`, data);
    };
    enviarPlazasPrepublicadasToConvocadas = (data: any): Observable<any> => {
        console.log("convocarplazas", data);
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        //return this.restangular.all('plazasrotacion').all('enviar').all('plazasprepublicadasaconvocadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/enviar/plazasprepublicadasaconvocadas";
        return this._http.post<any>(`${url}`, data);
    };
    
    enviarPlazasPrepublicadasToObservadas = (data: any): Observable<any> => {
        // return this.restangular.all('plazasrotacion').all('enviar').all('plazasprepublicadasaobservadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/enviar/plazasprepublicadasaobservadas";
        return this._http.post<any>(`${url}`, data);
    };

    eliminarPlazaPrepublicada = (data: any): Observable<any> => {
        console.log("plazaEliminar", data);
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        //return this.restangular.all('plazasrotacion').all('eliminarplaza').all('prepublicadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/eliminarplaza/prepublicadas";
        return this._http.post<any>(`${url}`, data);
    };

    /**
     * _________________________________________________________________________________________________________
     * PLAZAS CONVOCADAS
     * _________________________________________________________________________________________________________
     */


    getGridPlazaRotacionConvocadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        let queryParam = new HttpParams();
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        // return this.restangular.all('plazasrotacion').all('convocadas').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazasrotacion/convocadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    exportarPlazaRotacionConvocadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        //return this.restangular.all('plazasrotacion').all('exportar').all('convocadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/exportar/convocadas";
        return this._http.post<any>(`${url}`, data);
    };

    enviarPlazasConvocadasToObservadas = (data: any): Observable<any> => {
        // return this.restangular.all('plazasrotacion').all('enviar').all('plazasconvocadasaobservadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/enviar/plazasconvocadasaobservadas";
        return this._http.post<any>(`${url}`, data);
    };
    /**
     * _________________________________________________________________________________________________________
     * PLAZAS OBSERVADAS
     * _________________________________________________________________________________________________________
     */

    getGridPlazaRotacionObservadas = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        let queryParam = new HttpParams();
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        //return this.restangular.all('plazasrotacion').all('observadas').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazasrotacion/observadas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    exportarPlazaRotacionObservadas = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasrotacion').all('exportar').all('observadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/exportar/observadas";
        return this._http.post<any>(`${url}`, data);
    };

    enviarPlazasObservadasToConvocadas = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('plazasrotacion').all('enviar').all('plazasobservadasaconvocadas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/enviar/plazasobservadasaconvocadas";
        return this._http.post<any>(`${url}`, data);
    };

    /**
     * _________________________________________________________________________________________________________
     * PLAZAS RESULTADO FINAL
     * _________________________________________________________________________________________________________
     */

    getGridPlazaRotacionResultadoFinal = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        let queryParam = new HttpParams();
        if (data.codigoSede) {
            queryParam = queryParam.set('codigoSede', data.codigoSede);
        }
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
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

        // return this.restangular.all('plazasrotacion').all('resultadosfinales').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazasrotacion/resultadosfinales";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    exportarPlazaRotacionResultadoFinal = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('plazasrotacion').all('exportar').all('resultadosfinales').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/exportar/resultadosfinales";
        return this._http.post<any>(`${url}`, data);
    };


    /**
     * _________________________________________________________________________________________________________
     * METODOS MODAL CENTRO TRABAJO
     * _________________________________________________________________________________________________________
     */

    listarInstancia = (activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        //return this.restangular.all('dres').get();
        let url = this.basePath.rotacionApi + "/dres";
        return this._http.get<any>(`${url}`);
    };

    listarSubinstancia = (idInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set("activo", activo);}

        //return this.restangular.one('dres', idInstancia).all('ugeles').get();
        let url = this.basePath.rotacionApi + `/dres/${idInstancia}/ugeles`;
        return this._http.get<any>(`${url}`);
    };

    listarTipoCentroTrabajo = (pCodigoNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (pCodigoNivelInstancia && pCodigoNivelInstancia > 0) {
            queryParam = queryParam.set('codigoNivelInstancia', pCodigoNivelInstancia);
        }
        if (activo !== null) {queryParam = queryParam.set("activo", activo);}
        //return this.restangular.all('tiposcentrotrabajo').get(queryParam);
        let url = this.basePath.rotacionApi + "/tiposcentrotrabajo";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getModalidadEducativa = (): Observable<any> => {
        //return this.restangular.all('modalidadeseducativas').get();
        let url = this.basePath.rotacionApi + "/modalidadeseducativas";
        return this._http.get<any>(`${url}`);
    };

    getNivelEducativo = (idModalidadEducativa): Observable<any> => {
        // return this.restangular.one('niveleseducativos', idModalidadEducativa).get();
        let url = this.basePath.rotacionApi + `/niveleseducativos/${idModalidadEducativa}`;
        return this._http.get<any>(`${url}`);
    };

    getListCentroTrabajo = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.codigoCentroTrabajo) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.codigoModularAmbito) {
            queryParam = queryParam.set('codigoModularAmbito', data.codigoModularAmbito);
        }
        if (data.codigoNivelInstancia && data.codigoNivelInstancia > 0) {
            queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia);
        }
        if (data.idInstancia && data.idInstancia > 0) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) {
            queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia);
        }
        if (data.idSubinstancia && data.idSubinstancia > 0) {
            queryParam = queryParam.set('idSubinstancia', data.idSubinstancia);
        }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) {
            queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo);
        }
        if ((data.institucionEducativa || '').trim().length !== 0) {
            queryParam = queryParam.set('institucionEducativa', data.institucionEducativa);
        }

        if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) {
            queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa);
        }
        if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) {
            queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo);
        }

        if (data.idCategoriaRemunerativa !== null && data.idCategoriaRemunerativa > 0) {
            queryParam = queryParam.set('idCategoriaRemunerativa', data.idCategoriaRemunerativa);
        }
        if (data.idGrupoOcupacional !== null && data.idGrupoOcupacional > 0) {
            queryParam = queryParam.set('idGrupoOcupacional', data.idGrupoOcupacional);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza > 0) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('centrostrabajo').all('consultar').get(queryParam);
        let url = this.basePath.rotacionApi + "/centrostrabajo/consultar";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

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
        //return this.restangular.all('plazas').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazas";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    /**
     * _________________________________________________________________________________________________________
     * METODOS MODAL INCORPORAR PLAZAS
     * _________________________________________________________________________________________________________
     */

    getIncorporarPlazaGrid = (data: any, pageIndex, pageSize): Observable<any> => {
        const rol = this.storageService.getPassportRolSelected();

        let queryParam = new HttpParams();

        queryParam = queryParam.set('codigoSede', rol.CODIGO_SEDE);
        queryParam = queryParam.set('codigoRolPassport', rol.CODIGO_ROL);

        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoModular) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoModular);
        }
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        // return this.restangular.all('plazas').all('consulta').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazas/consulta";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getIncorporarPlazaInformacion = (pIdPlaza: any): Observable<any> => {
        
        let queryParam = new HttpParams();
        if (pIdPlaza) {
            queryParam = queryParam.set('idPlaza', pIdPlaza);
        }
        //return this.restangular.all('plazas').all('informacion').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazas/informacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
    
    getIncorporarPlazaInformacionById = (pIdPlaza: any): Observable<any> => {
        // console.log("probado informaciion  plazas", pIdPlaza)
        let queryParam = new HttpParams();
        if (pIdPlaza) {
            queryParam = queryParam.set('idPlaza', pIdPlaza);
        }
        // return this.restangular.all('plazas').all('informacionbyid').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazas/informacionbyid";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarIncorporarPlaza = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        data.codigoRolPassport = this.storageService.getPassportRolSelected().CODIGO_ROL;
        //return this.restangular.all('plazas').all('exportar').post(data);
        let url = this.basePath.rotacionApi + "/plazas/exportar";
        return this._http.post<any>(`${url}`, data);
    };

    incorporarPlaza = (data: any): Observable<any> => {
        console.log("enviar back", data);
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('plazasrotacion').all('incorporarplazas').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/incorporarplazas";
        return this._http.post<any>(`${url}`, data);
    };

    /**
     * _________________________________________________________________________________________________________
     * METODOS POSTULACION
     * _________________________________________________________________________________________________________
     */
    getTiposDocumentoIdentidad = (): Observable<any> => {
        // return this.restangular.all('tiposdocumentoidentidad').get();
        let url = this.basePath.rotacionApi + `/tiposdocumentoidentidad`;
        return this._http.get<any>(`${url}`);
    };

    getTiposRegistro = (): Observable<any> => {
        // return this.restangular.all('tiposregistro').get();
        let url = this.basePath.rotacionApi + `/tiposregistro`;
        return this._http.get<any>(`${url}`);
    };

    getTiposRotacion = (): Observable<any> => {
        // return this.restangular.all('tiposrotacion').get();
        let url = this.basePath.rotacionApi + `/tiposrotacion`;
        return this._http.get<any>(`${url}`);
    };

    getEstadosPostulacion = (): Observable<any> => {
        // return this.restangular.all('estadospostulante').get();
        let url = this.basePath.rotacionApi + `/estadospostulante`;
        return this._http.get<any>(`${url}`);
    };

    getInformeEscalafonario = (pIdTipoDocumentoIdentidad, pNumeroDocumentoIdentidad, pNumeroInformeEscalafonario): Observable<any> => {
        console.log("buscar inforne escalafonario",pIdTipoDocumentoIdentidad, pNumeroDocumentoIdentidad, pNumeroInformeEscalafonario )
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
        // return this.restangular.all('informesescalafonarios').get(queryParam);
        let url = this.basePath.rotacionApi + "/informesescalafonarios";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getGridPostulacion = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        let queryParam = new HttpParams();
        if (data.idEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.idTipoDocumentoIdentidad) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.numeroExpediente) {
            queryParam = queryParam.set('numeroExpediente', data.numeroExpediente);
        }
        if (data.idTipoRegistro) {
            queryParam = queryParam.set('idTipoRegistro', data.idTipoRegistro);
        }
        if (data.idEstadoPostulacion) {
            queryParam = queryParam.set('idEstadoPostulacion', data.idEstadoPostulacion);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        // return this.restangular.all('postulaciones').get(queryParam);
        let url = this.basePath.rotacionApi + "/postulaciones";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarPostulacion = (data: any): Observable<any> => {
        // return this.restangular.all('postulaciones').all('exportar').post(data);
        let url = this.basePath.rotacionApi + "/postulaciones/exportar";
        return this._http.post<any>(`${url}`, data);
    };

    aprobarPostulacion = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('postulaciones').all('aprobar').post(data);
        let url = this.basePath.rotacionApi + "/postulaciones/aprobar";
        return this._http.post<any>(`${url}`, data);
    };

    getPostulacion = (pIdPostulacion, pIdEtapaProceso): Observable<any> => {
        let queryParam = new HttpParams();
        if (pIdEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', pIdEtapaProceso);
        }
        // return this.restangular.one("postulaciones", pIdPostulacion).get(queryParam);
        let url = this.basePath.rotacionApi + `/postulaciones/${pIdPostulacion}`;
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getValidarPublicacion = (pIdEtapaProceso, pIdDesarrolloProceso): Observable<any> => {
        let queryParam = new HttpParams();
        if (pIdEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', pIdEtapaProceso);
        }
        if (pIdDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', pIdDesarrolloProceso);
        }
        // return this.restangular.all("postulaciones").all("validarpublicacion").get(queryParam);
        let url = this.basePath.rotacionApi + "/postulaciones/validarpublicacion";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };



    crearPostulacion = (data: any): Observable<any> => {
        console.log("registrar postulacion", data)
        data.codigoRolPassport = this.storageService.getPassportRolSelected().CODIGO_ROL;
        // return this.restangular.all('postulaciones').post(data);
        let url = this.basePath.rotacionApi + "/postulaciones";
        return this._http.post<any>(`${url}`, data);
    };

    modificarPostulacion = (data: any): Observable<any> => {
        data.codigoRolPassport = this.storageService.getPassportRolSelected().CODIGO_ROL;
        // return this.restangular.all('postulaciones').all('modificar').post(data);
        let url = this.basePath.rotacionApi + "/postulaciones/modificar";
        return this._http.post<any>(`${url}`, data);
    };

    eliminarPostulacion = (data: any): Observable<any> => {
        // return this.restangular.all('postulaciones').all('eliminar').post(data);
        let url = this.basePath.rotacionApi + "/postulaciones/eliminar";
        return this._http.post<any>(`${url}`, data);
    };


    /**
     * _________________________________________________________________________________________________________
     * MODAL BUSCAR DOCUMENTO IDENTIDAD
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
        let url = this.basePath.rotacionApi + "/servidorespublicos/consultar";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getServidorPublico(
        pIdTipoDocumento: any,
        pNumeroDocumento: any,
        pidRegimenLaboral: any,
        pIdServidorPublico: any
    ): Observable<any> {

        let queryParam: HttpParams = new HttpParams()
            .set("idTipoDocumentoIdentidad", pIdTipoDocumento)
            .set("numeroDocumentoIdentidad", pNumeroDocumento)
            .set("codigoSede", this.storageService.getPassportRolSelected().CODIGO_SEDE)
            .set("idRegimenLaboral", pidRegimenLaboral);
        if (pIdServidorPublico != null) {
            queryParam = queryParam.set("idServidorPublico", pIdServidorPublico);
        }
        // return this.restangular.all("servidorespublicos").get(queryParam);
        let url = this.basePath.rotacionApi + "/servidorespublicos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    }

    /**
     * _________________________________________________________________________________________________________
     * METODOS POSTULACION
     * _________________________________________________________________________________________________________
     */
    getEstadosCalificacion = (): Observable<any> => {
        // return this.restangular.all('estadoscalificacion').get();
        let url = this.basePath.rotacionApi + "/estadoscalificacion";
        return this._http.get<any>(`${url}`);
    };

    /**
     * _________________________________________________________________________________________________________
     * METODOS CALIFICACIONES
     * _________________________________________________________________________________________________________
     */
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
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.idTipoRotacion) {
            queryParam = queryParam.set('idTipoRotacion', data.idTipoRotacion);
        }
        if (data.idEstadoCalificacion) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);

        // return this.restangular.all('calificaciones').all('preliminares').get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/preliminares";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarCalificacionesPreliminares = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('calificaciones').all('exportar').all('preliminares').post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/exportar/preliminares";
        return this._http.post<any>(`${url}`, data);
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
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.idTipoRotacion) {
            queryParam = queryParam.set('idTipoRotacion', data.idTipoRotacion);
        }
        if (data.idEstadoCalificacion) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);

        // return this.restangular.all('calificaciones').all('finales').get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/finales";
        return this._http.get<any>(`${url}`, { params: queryParam });        
    };

    exportarCalificacionesFinales = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('calificaciones').all('exportar').all('finales').post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/exportar/finales";
        return this._http.post<any>(`${url}`, data);
    };


    getPostulacionDestino = (pIdPostulacion, pIdEtapaProceso): Observable<any> => {
        let queryParam = new HttpParams();
        if (pIdEtapaProceso) {
            queryParam = queryParam.set('idEtapaProceso', pIdEtapaProceso);
        }
        if (pIdPostulacion) {
            queryParam = queryParam.set('idPostulacion', pIdPostulacion);
        }
        // return this.restangular.all("calificaciones").all("postulante").get(queryParam);

        let url = this.basePath.rotacionApi + "/calificaciones/postulante";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getRequesitosGeneralesGrid = (idCalificacionDetalle = 0): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);
        
        console.log('idCalificacionDetalleXXXX',idCalificacionDetalle);
        if(idCalificacionDetalle > 0)
        queryParam = queryParam.set('idCalificacionDetalle', idCalificacionDetalle.toString());
        
        // return this.restangular.all("calificaciones").all("requisitosgenerales").get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/requisitosgenerales";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    getExperienciaLaboralGrid = (idCalificacionDetalle = 0): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);

        if(idCalificacionDetalle > 0)
        queryParam = queryParam.set('idCalificacionDetalle', idCalificacionDetalle.toString());

        // return this.restangular.all("calificaciones").all("experiencialaboral").get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/experiencialaboral";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getUnidadFamiliarGrid = (idCalificacionDetalle = 0): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);

        if(idCalificacionDetalle > 0)
        queryParam = queryParam.set('idCalificacionDetalle', idCalificacionDetalle.toString());

        // return this.restangular.all("calificaciones").all("unidadesfamiliares").get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/unidadesfamiliares";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getEstudiosCapacitacionGrid = (idCalificacionDetalle = 0): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);
        
        if(idCalificacionDetalle > 0)
        queryParam = queryParam.set('idCalificacionDetalle', idCalificacionDetalle.toString());

        // return this.restangular.all("calificaciones").all("estudioscapacitaciones").get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/estudioscapacitaciones";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    crearCalificacion = (data: any): Observable<any> => {
        console.log("guardar calificacion");
        // return this.restangular.all("calificaciones").post(data);
        let url = this.basePath.rotacionApi + "/calificaciones";
        return this._http.post<any>(`${url}`, data);
    };

    registrarObservacionPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("observacion").post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/observacion";
        return this._http.post<any>(`${url}`, data);
    };

    registrarReclamoPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("reclamo").post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/reclamo";
        return this._http.post<any>(`${url}`, data);
    };

    getMotivosObservacion = (): Observable<any> => {
        // return this.restangular.all('motivosobservacion').get();
        let url = this.basePath.rotacionApi + "/motivosobservacion";
        return this._http.get<any>(`${url}`);
    };

    generarOrdenMeritoCalificacionPostulante = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("ordenmerito").all("preliminares").post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/ordenmerito/preliminares";
        return this._http.post<any>(`${url}`, data);
    };

    generarOrdenMeritoCalificacionPostulanteFinal = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("ordenmerito").all("finales").post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/ordenmerito/finales";
        return this._http.post<any>(`${url}`, data);
    };

    publicarCalificacionPostulantePreliminar = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("publicar").all("preliminar").post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/publicar/preliminar";
        return this._http.post<any>(`${url}`, data);
    };
    publicarCalificacionPostulanteFinal = (data: any): Observable<any> => {
        // return this.restangular.all("calificaciones").all("publicar").all("final").post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/publicar/final";
        return this._http.post<any>(`${url}`, data);
    };

    excelCalificacionPostulantePreliminar = (pIdEtapaProceso: any, pIdDesarrolloProceso: any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idAlcanceProceso', pIdEtapaProceso);
        queryParam = queryParam.set('idDesarrolloProceso', pIdDesarrolloProceso);
        // queryParam = queryParam.set('idEtapaProceso', pIdEtapaProceso);
        // return this.restangular.all("calificaciones").all("ordenmerito").all("preliminar").all("excel").get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/ordenmerito/preliminar/excel";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    excelCalificacionPostulanteFinal = (pIdEtapaProceso: any, pIdDesarrolloProceso: any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idEtapaProceso', pIdEtapaProceso);
        queryParam = queryParam.set('idDesarrolloProceso', pIdDesarrolloProceso);
        // return this.restangular.all("calificaciones").all("ordenmerito").all("final").all("excel").get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/ordenmerito/final/excel";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };


    /**
     * _________________________________________________________________________________________________________
     * METODOS ADJUDICACION
     * _________________________________________________________________________________________________________
     */

    getEstadosAdjudicacion = (): Observable<any> => {
        // return this.restangular.all('estadosadjudicacion').get();
        let url = this.basePath.rotacionApi + "/estadosadjudicacion";
        return this._http.get<any>(`${url}`);
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
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoModular) {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.idEstadoAdjudicacion) {
            queryParam = queryParam.set('idEstadoAdjudicacion', data.idEstadoAdjudicacion);
        }
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);

        // return this.restangular.all('adjudicaciones').get(queryParam);
        let url = this.basePath.rotacionApi + "/adjudicaciones";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarAdjudicaciones = (data: any): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        // return this.restangular.all('adjudicaciones').all('exportar').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/exportar";
        return this._http.post<any>(`${url}`, data);        
    };
    //-------------------------------
    getInformacionPostulante = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idPostulacion', data.idPostulacion);
        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        // return this.restangular.all("adjudicaciones").all("postulante").get(queryParam);
        let url = this.basePath.rotacionApi + "/adjudicaciones/postulante";
        return this._http.get<any>(`${url}`, { params: queryParam });        
    };

    getValidarServidorPublico = (data: any): Observable<any> => {
        console.log('validarServidorPublico', data)
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idPostulacion', data.idPostulacion);
        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        // return this.restangular.all("adjudicaciones").all("validaServidorPublico").get(queryParam);
        let url = this.basePath.rotacionApi + "/adjudicaciones/validaServidorPublico";
        return this._http.get<any>(`${url}`, { params: queryParam });    
    }

    actualizarValidacionServidorPublico(data: any): Observable<any> {
        // return this.restangular.all('adjudicaciones/ActualizarValidacionServidorPublico').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/ActualizarValidacionServidorPublico";
        return this._http.post<any>(`${url}`, data);        
    }

    getValidarActualizacionPlaza  = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        queryParam = queryParam.set('codigoSede', data.codigoSede);
        queryParam = queryParam.set('idPlaza', data.idPlaza);
        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        // return this.restangular.all("adjudicaciones").all("validaPlaza").get(queryParam);
        let url = this.basePath.rotacionApi + "/adjudicaciones/validaPlaza";
        return this._http.get<any>(`${url}`, { params: queryParam });        
    };
    actualizarValidacionPlaza(data: any): Observable<any> {
        // return this.restangular.all('adjudicaciones/ActualizarValidacionPlaza').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/ActualizarValidacionPlaza";
        return this._http.post<any>(`${url}`, data);        
    }
    getValidarAdjudicacionPorOrden(data: any): Observable<any> {
        // return this.restangular.all('adjudicaciones/ValidarAdjudicacionPorOrden').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/ValidarAdjudicacionPorOrden";
        return this._http.post<any>(`${url}`, data);        
    }


    getAdjudicacionPlazaGrid = (data: any, paginaActual: any, tamanioPagina: any): Observable<any> => {
        // console.log("listar adjudicacion plaza grid");
        // console.log("data", data);
        let queryParam = new HttpParams();
        queryParam = queryParam.set('codigoRolPassport', this.storageService.getPassportRolSelected().CODIGO_ROL);
        queryParam = queryParam.set('codigoSede', this.storageService.getPassportRolSelected().CODIGO_SEDE);
        if (data.codigoPlaza) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if(data.codigoPlazaServidorPublico){
            queryParam = queryParam.set('codigoPlazaServidorPublico', data.codigoPlazaServidorPublico);
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
        if (data.idServidorPublico) {
            queryParam = queryParam.set('idServidorPublico', data.idServidorPublico);
        }
        queryParam = queryParam.set('idCategoriaRemunerativa', data.idCategoriaRemunerativa);
        queryParam = queryParam.set('idGrupoOcupacional', data.idGrupoOcupacional);
        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);
        // return this.restangular.all("adjudicaciones").all("plaza").get(queryParam);
        let url = this.basePath.rotacionApi + "/adjudicaciones/plaza";
        return this._http.get<any>(`${url}`, { params: queryParam });        
    };

    adjudicar = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('adjudicar').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/adjudicar";
        return this._http.post<any>(`${url}`, data);        
    };
    nodAdjudicar = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('noadjudicar').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/noadjudicar";
        return this._http.post<any>(`${url}`, data);        
    };
    subsanarObservar = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('subsanarobservacion').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/subsanarobservacion";
        return this._http.post<any>(`${url}`, data);        
    };

    getEstadosSubsanacion = (): Observable<any> => {
        // return this.restangular.all('estadossubsanacion').get();
        let url = this.basePath.rotacionApi + "/estadossubsanacion";
        return this._http.get<any>(`${url}`);
    };

    getMotivosNoAdjudicacion = (): Observable<any> => {
        // return this.restangular.all('motivosnoadjudicacion').get();
        let url = this.basePath.rotacionApi + "/motivosnoadjudicacion";
        return this._http.get<any>(`${url}`);
    };
    finalizarAdjudicacion = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('finalizaradjudicacion').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/finalizaradjudicacion";
        return this._http.post<any>(`${url}`, data);        
    };

    finalizarEtapaProceso = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('finalizaretapa').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/finalizaretapa";
        return this._http.post<any>(`${url}`, data);        
    };

    getPlazaRotacionResumen = (pIdPlazaRotacion: any, codigoCentroTrabajo: any): Observable<any> => {
        // console.log("hola codigo centro de trabajop", pIdPlazaRotacion)
        let queryParam = new HttpParams();
        if (pIdPlazaRotacion) {
            queryParam = queryParam.set('idPlazaRotacion', pIdPlazaRotacion);           
        }
        if(codigoCentroTrabajo){
            queryParam = queryParam.set('codigoCentroTrabajo', codigoCentroTrabajo);
        }
        
        // return this.restangular.all('plazasrotacion').all('resumen').get(queryParam);
        let url = this.basePath.rotacionApi + "/plazasrotacion/resumen";
        return this._http.get<any>(`${url}`, { params: queryParam });        
    };

    getMaestroPermisoPlaza = (data: any): Observable<any> => {
        // console.log("permisos data", data)
        // return this.restangular.all('plazasrotacion').all('obtenerpermisos').post(data);
        let url = this.basePath.rotacionApi + "/plazasrotacion/obtenerpermisos";
        return this._http.post<any>(`${url}`, data);        
    };

    getMaestroPermisoPostulacion = (data: any): Observable<any> => {
        // return this.restangular.all('postulaciones').all('obtenerpermisos').post(data);
        let url = this.basePath.rotacionApi + "/postulaciones/obtenerpermisos";
        return this._http.post<any>(`${url}`, data);           
    };

    getMaestroPermisoCalificacion = (data: any): Observable<any> => {
        // return this.restangular.all('calificaciones').all('obtenerpermisos').post(data);
        let url = this.basePath.rotacionApi + "/calificaciones/obtenerpermisos";
        return this._http.post<any>(`${url}`, data);
    };    

    getMaestroPermisoAdjudicacion = (data: any): Observable<any> => {
        // return this.restangular.all('adjudicaciones').all('obtenerpermisos').post(data);
        let url = this.basePath.rotacionApi + "/adjudicaciones/obtenerpermisos";
        return this._http.post<any>(`${url}`, data);
    };
    
    getValidarCalificacionesPendientes = (
        data: any
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
        if (data.idDesarrolloProceso) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.idTipoRotacion) {
            queryParam = queryParam.set('idTipoRotacion', data.idTipoRotacion);
        }
        if (data.idEstadoCalificacion) {
            queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        }
        // return this.restangular.all('calificaciones').all('verificarpendientes').get(queryParam);
        let url = this.basePath.rotacionApi + "/calificaciones/verificarpendientes";
        return this._http.get<any>(`${url}`, { params: queryParam });        
    };

   getCodigoDreUgel = (request: any): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
            .set('codSede', request.codSede);
        // return this.restangular.all('dres').all('obtenerdreugel').get(queryParam);
        let url = this.basePath.rotacionApi + "/dres/obtenerdreugel";
        return this._http.get<any>(`${url}`, { params: queryParam });        
    };

    getPassportRolSelected(): PassportRolModel {
        
        let rol = this.localStorageService.getItem(PASSPORT_ROL_SELECTED);
        if (rol) {
            const decoded = JSON.parse(rol);
            const obj = new PassportRolModel();
            return Object.assign(obj, decoded);
        } else {
            return null;
        }
    }



    private setCodigoDreUgel(codigoDreUgelData) {
        this.codigoDreUgelSubject.next(codigoDreUgelData);
    }

    get passportModel() {
        return (this.getPassportRolSelected() as IPassportResponse);
    }

    get passportInstanciaModel() {
        return (this.getInstanciaSelected());
    }

    getInstanciaSelected(): InstanciaModel {
        let instancia = this.localStorageService.getItem(INSTANCIA_SELECTED);
        if (instancia) {
            const json = JSON.parse(instancia);
            const model = new InstanciaModel();
            return Object.assign(model, json);
        } else {
            return null;
        }
    }


    getCodigoDreUgelFromServiceInit() {
        // console.log(this.passportModel);
        // console.log(this.passportInstanciaModel);

        let codSede = this.passportModel.CODIGO_SEDE;
        if (this.passportModel.CODIGO_ROL == 'AYNI_019' && this.passportInstanciaModel) {
            codSede = this.passportInstanciaModel.codigoInstancia;
        }

        const request = { codSede };

        var response = this.getCodigoDreUgel(request);

        // console.log(response);
        if (response) {
            this.setCodigoDreUgel(response);
        }
        return response;
    }

    /* LISTA DE DOCUMENTOS PUBLICADOS*/
    getBuscarDocumentoPublicado = (
        data: any
    ): Observable<any> => {
        data.codigoSede = this.storageService.getPassportRolSelected().CODIGO_SEDE;
        let queryParam = new HttpParams();               
        queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        
        //return this.restangular.all('plazasrotacion').all('observadas').get(queryParam);
        let url = this.basePath.rotacionApi + "/documentoPublicado/lista";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    generarPdfDocumentoPublicado = (data: any): Observable<any> => {
        data.usuarioCreacion = this.storageService.getInformacionUsuario().numeroDocumento;
        // return this.restangular.all('adjudicaciones').all('finalizaretapa').post(data);
        let url = this.basePath.rotacionApi + "/documentoPublicado/generarPDFDocumentoPublicado";
        return this._http.post<any>(`${url}`, data);        
    };

    actualizarEstadosDocumentoPublicados = (data: any): Observable<any> => {
        data.codigoEstadoDocumento = 2;
        // return this.restangular.all('adjudicaciones').all('finalizaretapa').post(data);
        let url = this.basePath.rotacionApi + "/documentoPublicado/pdf/actualizarEstadosDocumentoPublicados";
        return this._http.post<any>(`${url}`, data);        
    };
    
}
