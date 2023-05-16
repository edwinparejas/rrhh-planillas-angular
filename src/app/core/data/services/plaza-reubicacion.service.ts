import { Injectable } from "@angular/core";
import { PlazaReubicacionRestangularService } from "./resources/plaza-reubicacion-restangular.service";
import { Observable } from "rxjs";
import { HttpParams } from "@angular/common/http";

@Injectable({
    providedIn: "root",
})
export class PlazaReubicacionService {
    constructor(private restangular: PlazaReubicacionRestangularService) { }

    accesoRolPassport(codigoRolPassport: any, codigoTipoSede: any): Observable<any> {
        let queryParam = new HttpParams();   
        if (codigoRolPassport) { queryParam = queryParam.set('codigoRolPassport', codigoRolPassport); }
        if (codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', codigoTipoSede); }
        return this.restangular.all('rolespassport').get(queryParam);
      }
    
    listarInstancia() {
        return this.restangular.all('instancias').get();
    }

    listarSubinstancia(idInstancia: any) {
        return this.restangular.one('instancias', idInstancia).all('subinstancias').get();
    }

    accesoInstanciaTipoSede(codigoTipoSede: any): Observable<any> {
        let queryParam = new HttpParams();
        if (codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', codigoTipoSede); }
        return this.restangular.all('nivelesinstanciatiposede').get(queryParam);
    }

    getCentroTrabajoPorSede(codigoSede: any) {
        let queryParam = new HttpParams();
        if (codigoSede) { queryParam = queryParam.set('codigoSede', codigoSede); }
        return this.restangular.all('entidades').get(queryParam);
    }

    getAreasDesempenioLaboral(idRegimenLaboral: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        return this.restangular.all('areasdesempeniolaboral').get(queryParam);
    }

    getTiposCargo(idRegimenLaboral: any, idAreaDesempenioLaboral: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        if (idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', idAreaDesempenioLaboral); }
        return this.restangular.all('tiposcargo').get(queryParam);
    }

    getCargos(idRegimenLaboral: any, idAreaDesempenioLaboral: any, idTipoCargo: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        if (idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', idAreaDesempenioLaboral); }
        if (idTipoCargo && idTipoCargo > 0) { queryParam = queryParam.set('idTipoCargo', idTipoCargo); }
        return this.restangular.all('cargos').get(queryParam);
    }

    getTodoRegimenesLaborales() {
        return this.restangular.all('regimeneslaborales').all("todos").get();
    }

    getRegimenesLaborales(pIdGrupoAccion: any, pIdAccion: any, pIdMotivoAccion: any ,codigoRolPassport: any) {
        let queryParam = new HttpParams();
        if (pIdGrupoAccion) { queryParam = queryParam.set('idGrupoAccion', pIdGrupoAccion); }
        if (pIdAccion) { queryParam = queryParam.set('idAccion', pIdAccion); }
        if (pIdMotivoAccion > 0) { queryParam = queryParam.set('idMotivoAccion', pIdMotivoAccion); }
        if (codigoRolPassport != null) { queryParam = queryParam.set('codigoRolPassport', codigoRolPassport); }
        return this.restangular.all('regimeneslaborales').get(queryParam);
    }

    getNecesidadesAreasCurriculares(pIdDetalleNecesidad: any) {
        let queryParam = new HttpParams();
        if (pIdDetalleNecesidad) { queryParam = queryParam.set('idDetalleNecesidad', pIdDetalleNecesidad); }
        return this.restangular.all('areascurriculares').get(queryParam);
    }

    getAreasCurriculares(idAreaCurricular: any) {
        let queryParam = new HttpParams();
        if (idAreaCurricular) { queryParam = queryParam.set('idAreaCurricular', idAreaCurricular); }
        return this.restangular.all('areascurriculares').all('buscar').get(queryParam);
    }

    getAreasCurricularesCodigoPlazas(codigoPlazaOrigen: any , codigoPlazaDestino: any ) {
        let queryParam = new HttpParams();
        if (codigoPlazaOrigen) { queryParam = queryParam.set('codigoPlazaOrigen', codigoPlazaOrigen); }
        if (codigoPlazaDestino) { queryParam = queryParam.set('codigoPlazaDestino', codigoPlazaDestino); }
        return this.restangular.all('areascurriculares').all('buscarCodigoPlaza').get(queryParam);
    }


    listarUnidadesOrganizacionales(pIdCentroTrabajo: any, pIdUnidadOrganizacionalPadre?: any) {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idCentroTrabajo', pIdCentroTrabajo);
        if (pIdUnidadOrganizacionalPadre) {
            queryParam = queryParam.set('idUnidadOrganizacionalPadre', pIdUnidadOrganizacionalPadre);
        }
        return this.restangular.all('unidadesorganizacionales').get(queryParam);
    }

    buscarPlazaExcedente(data: any) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idMotivoAccion && data.idMotivoAccion > 0) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idModalidadEducativa) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
        if ((data.codigoPlaza || '').trim().length !== 0) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if (data.idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        return this.restangular.all('plazasexcedentes').get(queryParam);
    }

    listarPlazaExcedente(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idMotivoAccion && data.idMotivoAccion > 0) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idModalidadEducativa) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
        if ((data.codigoPlaza || '').trim().length !== 0) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if (data.idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', data.idAreaDesempenioLaboral); }
        if (data.idTipoCargo) { queryParam = queryParam.set('idTipoCargo', data.idTipoCargo); }
        if (data.idCargo) { queryParam = queryParam.set('idCargo', data.idCargo); }
        if (data.idJornadaLaboral) { queryParam = queryParam.set('idJornadaLaboral', data.idJornadaLaboral); }
        if (data.idCentroTrabajo) { queryParam = queryParam.set('idCentroTrabajo', data.idCentroTrabajo); }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazasexcedentes').all("plaza").all('buscar').get(queryParam);
    }

    listarSoloPlazaExcedente(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idMotivoAccion && data.idMotivoAccion > 0) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idModalidadEducativa) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
        if ((data.codigoPlaza || '').trim().length !== 0) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if (data.idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', data.idAreaDesempenioLaboral); }
        if (data.idTipoCargo) { queryParam = queryParam.set('idTipoCargo', data.idTipoCargo); }
        if (data.idCargo) { queryParam = queryParam.set('idCargo', data.idCargo); }
        if (data.idJornadaLaboral) { queryParam = queryParam.set('idJornadaLaboral', data.idJornadaLaboral); }
        if (data.idCentroTrabajo) { queryParam = queryParam.set('idCentroTrabajo', data.idCentroTrabajo); }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazasexcedentes').all("plaza").all('exedentes').get(queryParam);
    }

    buscarCentroTrabajoNecesidad(data: any) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idModalidadEducativa) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
        if ((data.codigoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if (data.idCondicionPlaza && data.idCondicionPlaza > 0) { queryParam = queryParam.set('idCondicionPlaza', data.idCondicionPlaza); }
        if (data.clasificadorNuevaUbicacion) { queryParam = queryParam.set('clasificadorNuevaUbicacion', data.clasificadorNuevaUbicacion); }
        if (data.idMotivoAccion) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        
        return this.restangular.all('necesidades').all('buscar').get(queryParam);
    }

    listarCentroTrabajoNecesidad(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idNivelInstancia && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idModalidadEducativa) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
        if (data.idServidorPublico) { queryParam = queryParam.set('idServidorPublico', data.idServidorPublico); }
        if (data.idCondicionPlaza) { queryParam = queryParam.set('idCondicionPlaza', data.idCondicionPlaza); }
        if (data.esIEConPlazasVacantes) { queryParam = queryParam.set('esIEConPlazasVacantes', data.esIEConPlazasVacantes); }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }
        if (data.clasificadorNuevaUbicacion) { queryParam = queryParam.set('clasificadorNuevaUbicacion', data.clasificadorNuevaUbicacion); }
        if (data.idMotivoAccion) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if (data.idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.codigoModular) { queryParam = queryParam.set('codigoModular', data.codigoModular); }
        if (data.codigoPlaza) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if (data.idAreaDesempenioLaboralOrigen) { queryParam = queryParam.set('idAreaDesempenioLaboralOrigen', data.idAreaDesempenioLaboralOrigen); }
        if (data.idCentroTrabajoOrigen) { queryParam = queryParam.set('idCentroTrabajoOrigen', data.idCentroTrabajoOrigen); }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('necesidades').get(queryParam);
    }

    listarPlazaCentroTrabajoNecesidad(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idNivelInstancia && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idModalidadEducativa) { queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa); }
        if (data.idServidorPublico) { queryParam = queryParam.set('idServidorPublico', data.idServidorPublico); }
        if (data.idCondicionPlaza) { queryParam = queryParam.set('idCondicionPlaza', data.idCondicionPlaza); }
        if (data.esIEConPlazasVacantes) { queryParam = queryParam.set('esIEConPlazasVacantes', data.esIEConPlazasVacantes); }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }
        if (data.codigoCentroTrabajo) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if (data.idRegimenLaboral && data.idRegimenLaboral > 0) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.clasificadorNuevaUbicacion) { queryParam = queryParam.set('clasificadorNuevaUbicacion', data.clasificadorNuevaUbicacion); }
        if (data.idMotivoAccion) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if (data.codigoModular) { queryParam = queryParam.set('codigoModular', data.codigoModular); }
        if (data.codigoPlaza) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if (data.idAreaDesempenioLaboralOrigen) { queryParam = queryParam.set('idAreaDesempenioLaboralOrigen', data.idAreaDesempenioLaboralOrigen); }
        if (data.idCentroTrabajoOrigen) { queryParam = queryParam.set('idCentroTrabajoOrigen', data.idCentroTrabajoOrigen); }
        if (data.idNivelEducativo) { queryParam = queryParam.set('idNivelEducativo', data.idNivelEducativo); }
        

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('necesidades').all('plaza').get(queryParam);
    }

    buscarCentroTrabajoExcedente(data: any) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idMotivoAccion) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if ((data.codigoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }        
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idRegimenLaboral && data.idRegimenLaboral > 0) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }

        return this.restangular.all('plazasexcedentes').all("centrotrabajo").all('buscar').get(queryParam);
    }

    listarCentroTrabajoExcedente(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idNivelInstancia && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idMotivoAccion) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }
        if (data.idRegimenLaboral && data.idRegimenLaboral > 0) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.codigoCentroTrabajo && data.codigoCentroTrabajo > 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazasexcedentes').all("centrotrabajo").get(queryParam);
    }


     obtenerPlazaExcedente(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idNivelInstancia && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idMotivoAccion) { queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion); }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }
        if (data.idRegimenLaboral && data.idRegimenLaboral > 0) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.codigoCentroTrabajo && data.codigoCentroTrabajo > 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if (data.codigoPlaza) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if (data.codigoSede) { queryParam = queryParam.set('codigoSede', data.codigoSede); }
        if (data.codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede); }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazasexcedentes').all("centrotrabajo").all('plaza').get(queryParam);
    }



    buscarCentroTrabajo(data: any) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set("idNivelInstancia",data.idNivelInstancia);}
        if (data.idEntidadSede) { queryParam = queryParam.set('idEntidadSede', data.idEntidadSede); }
        if (data.registrado !== null) { queryParam = queryParam.set("registrado", data.registrado);}
        if ((data.codigoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if (data.registrado !== null) { queryParam = queryParam.set('registrado', data.registrado); }
        if (data.idDre !== null) {queryParam = queryParam.set("idDre", data.idDre);}
        if (data.idUgel !== null) { queryParam = queryParam.set("idUgel", data.idUgel);}
        return this.restangular.all('centrostrabajo').all('buscar').get(queryParam);
    }

    listarCentroTrabajo(data: any, pageIndex, pageSize) {
        let queryParam = new HttpParams();
        if (data.codigoNivelInstancia && data.codigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
        if (data.idInstancia && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idOtraInstancia && data.idOtraInstancia > 0) { queryParam = queryParam.set('idOtraInstancia', data.idOtraInstancia); }
        if (data.idSubinstancia && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idTipoCentroTrabajo && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }
        if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) {queryParam = queryParam.set("idModalidadEducativa", data.idModalidadEducativa);}
        if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) {queryParam = queryParam.set("idNivelEducativo", data.idNivelEducativo);}
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('centrostrabajo').get(queryParam);
    }


    listarAreaDesempenioLaboral(idRegimenLaboral: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        return this.restangular.all('areasdesempeniolaboral').get(queryParam);
      }
    
      listarTipoCargo(idRegimenLaboral: any, idAreaDesempenioLaboral: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        if (idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', idAreaDesempenioLaboral); }
        return this.restangular.all('tiposcargo').get(queryParam);
      }
    
      listarCargo(idRegimenLaboral: any, idAreaDesempenioLaboral: any, idTipoCargo: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        if (idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', idAreaDesempenioLaboral); }
        if (idTipoCargo && idTipoCargo > 0) { queryParam = queryParam.set('idTipoCargo', idTipoCargo); }
        return this.restangular.all('cargos').get(queryParam);
      }
    

    listarJornadaLaboral(idRegimenLaboral: any, idAreaDesempenioLaboral: any, idTipoCargo: any, idCargo: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        if (idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', idAreaDesempenioLaboral); }
        if (idTipoCargo && idTipoCargo > 0) { queryParam = queryParam.set('idTipoCargo', idTipoCargo); }
        if (idCargo && idCargo > 0) { queryParam = queryParam.set('idCargo', idCargo); }
        return this.restangular.all('jornadaslaborales').get(queryParam);
    }

    listarCategoriaRemunerativa(idRegimenLaboral: any, idAreaDesempenioLaboral: any, idTipoCargo: any, idCargo: any) {
        let queryParam = new HttpParams();
        if (idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        if (idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', idAreaDesempenioLaboral); }
        if (idTipoCargo && idTipoCargo > 0) { queryParam = queryParam.set('idTipoCargo', idTipoCargo); }
        if (idCargo && idCargo > 0) { queryParam = queryParam.set('idCargo', idCargo); }
        return this.restangular.all('categoriasremunerativas').get(queryParam);
    }

    listarTipoDocumentoSustento() {
        return this.restangular.all('tiposdocumentosustento').get();
    }

    listarTipoFormatoSustento() {
        return this.restangular.all('tiposformatosustento').get();
    }

    listarTiposResolucion() {
        return this.restangular.all('tiposresolucion').get();
    }

    getMotivosAccion(idGrupoAccion: any, idAccion: any ) {
        let queryParam = new HttpParams();
        if (idGrupoAccion !== null && idGrupoAccion > 0) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
        if (idAccion !== null && idAccion > 0) { queryParam = queryParam.set('idAccion', idAccion); }
      
        return this.restangular.all('motivosaccion').get(queryParam);
    }

    buscarCodigoPlaza(data: any) {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idEntidadSede) { queryParam = queryParam.set('idEntidadSede', data.idEntidadSede); }
        if (data.codigoPlaza != null) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        return this.restangular.all('plazas').get(queryParam);
    }


    listarAccion(idNivelInstancia: any, idGrupoAccion: any) {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', idNivelInstancia); }
        if (idGrupoAccion !== null && idGrupoAccion > 0) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
        return this.restangular.all('acciones').get(queryParam);
    }

    listarTipoCentroTrabajo(pCodigoNivelInstancia: any) {
        let queryParam = new HttpParams();
        if (pCodigoNivelInstancia && pCodigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', pCodigoNivelInstancia); }
        return this.restangular.all('tiposcentrotrabajo').get(queryParam);
    }

    getEstados() {
        return this.restangular.all('estados').get();
    }

    getTiposPlaza(pIdRegimenLaboral: any): Observable<any> {
        let queryParam = new HttpParams();
        if (pIdRegimenLaboral && pIdRegimenLaboral > 0) { queryParam = queryParam.set('idRegimenLaboral', pIdRegimenLaboral); }
        return this.restangular.all('tiposplaza').get(queryParam);
    }

    getAccion() {
        return this.restangular.all('acciones').get();
    }


    getModalidadEducativa() {
        return this.restangular.all("modalidadeseducativa").get();
    }

    getNivelEducativo(idModalidadEducativa) {
        return this.restangular
            .one("niveleseducativo", idModalidadEducativa)
            .get();
    }


    buscarDocumentosustento(data: any, pageIndex, pageSize): Observable<any> {
        data.paginaActual = pageIndex;
        data.tamanioPagina = pageSize;
        return this.restangular.all("documentossustento").post(data);
    }

    crearReubicacion(data: any): Observable<any> {
        console.log(data);
        return this.restangular.all("propuestasreubicaciones").post(data);
    }

    validarReubicacion(data: any): Observable<any> {
        console.log(data);
        return this.restangular.all("propuestasreubicaciones").all("validar").post(data);
    }

    crearReubicacionMasivo(data: any): Observable<any> {
        return this.restangular.all("propuestasreubicaciones").all("masivo").post(data);
    }

    eliminar(datos: any): Observable<any> {
        return this.restangular.all('propuestasreubicaciones').all("eliminar").post(datos);
    }

    validacionCodigoApropacion(data: any): Observable<any> {
        return this.restangular.all('propuestasreubicaciones').all("validadacionCodigoApropacion").post(data);
      }

    listaPropuestaReubicacion(data: any, pageIndex: any, pageSize: any) {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idEntidadSede !== null && data.idEntidadSede > 0) { queryParam = queryParam.set('idEntidadSede', data.idEntidadSede); }
        if (data.idRolPassport !== null && data.idRolPassport > 0) { queryParam = queryParam.set('idRolPassport', data.idRolPassport); }
        if ((data.codigoPlaza || '').trim().length !== 0) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if ((data.codigoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if ((data.anexoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('anexoCentroTrabajo', data.anexoCentroTrabajo); }
        if (data.idInstancia) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idUnidadOrganizacional1) { queryParam = queryParam.set('idUnidadOrganizacional1', data.idUnidadOrganizacional1); }
        if (data.idUnidadOrganizacional2) { queryParam = queryParam.set('idUnidadOrganizacional2', data.idUnidadOrganizacional2); }
        if (data.idUnidadOrganizacional3) { queryParam = queryParam.set('idUnidadOrganizacional3', data.idUnidadOrganizacional3); }
        if (data.idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', data.idAreaDesempenioLaboral); }
        if (data.idTipoPlaza) { queryParam = queryParam.set('idTipoPlaza', data.idTipoPlaza); }
        if (data.idTipoCargo) { queryParam = queryParam.set('idTipoCargo', data.idTipoCargo); }
        if (data.idCargo) { queryParam = queryParam.set('idCargo', data.idCargo); }
        if (data.idEstadoPlaza) { queryParam = queryParam.set('idEstadoPlaza', data.idEstadoPlaza); }
        if (data.mostrarRegistrosCargaMasiva) { queryParam = queryParam.set('mostrarRegistrosCargaMasiva', data.mostrarRegistrosCargaMasiva); }
        if (data.codigoSede) { queryParam = queryParam.set('codigoSede', data.codigoSede); }
        if (data.codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede); }
        if ((data.institucionEducativa || "").trim().length !== 0) queryParam = queryParam.set("institucionEducativa", data.institucionEducativa);
        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) queryParam = queryParam.set("idTipoCentroTrabajo", data.idTipoCentroTrabajo);
        if (data.idRol) { queryParam = queryParam.set('idRol', data.idRol); }
        if (data.codigoRol) { queryParam = queryParam.set('codigoRol', data.codigoRol); }


        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('propuestasreubicaciones').get(queryParam);
    }

    descargarPropuestaReubicacion(data: any) {
        let queryParam = new HttpParams();
        data.idNivelInstancia = data.idNivelInstancia==null ? 0 : parseInt(data.idNivelInstancia);
        data.idEntidadSede = data.idEntidadSede==null ? 0 : parseInt(data.idEntidadSede);
        data.idOtraInstancia = data.idOtraInstancia==null ? 0 : parseInt(data.idOtraInstancia);
        data.idInstancia = data.idInstancia==null ? 0 : parseInt(data.idInstancia);
        data.idSubinstancia= data.idSubinstancia==null ? 0 : parseInt(data.idSubinstancia);
        data.idRolPassport = data.idRolPassport==null ? 0 : parseInt(data.idRolPassport);
        data.idUnidadOrganizacional1 = data.idUnidadOrganizacional1==null ? 0 : parseInt(data.idUnidadOrganizacional1);
        data.idUnidadOrganizacional2 = data.idUnidadOrganizacional2==null ? 0 : parseInt(data.idUnidadOrganizacional2);
        data.idUnidadOrganizacional3 = data.idUnidadOrganizacional3==null ? 0 : parseInt(data.idUnidadOrganizacional3);
        data.idTipoPlaza = data.idTipoPlaza==null ? 0 : parseInt(data.idTipoPlaza);
        data.idRegimenLaboral = data.idRegimenLaboral==null ? 0 : parseInt(data.idRegimenLaboral);
        data.idAreaDesempenioLaboral = data.idAreaDesempenioLaboral==null ? 0 : parseInt(data.idAreaDesempenioLaboral);
        data.idTipoCargo = data.idTipoCargo==null ? 0 : parseInt(data.idTipoCargo);
        data.idCargo = data.idCargo==null ? 0 : parseInt(data.idCargo);
        data.idEstadoPlaza = data.idEstadoPlaza==null ? 0 : parseInt(data.idEstadoPlaza); 
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idEntidadSede !== null && data.idEntidadSede > 0) { queryParam = queryParam.set('idEntidadSede', data.idEntidadSede); }
        if ((data.codigoPlaza || '').trim().length !== 0) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if ((data.codigoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if ((data.anexoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('anexoCentroTrabajo', data.anexoCentroTrabajo); }
        if (data.idInstancia) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idUnidadOrganizacional1) { queryParam = queryParam.set('idUnidadOrganizacional1', data.idUnidadOrganizacional1); }
        if (data.idUnidadOrganizacional2) { queryParam = queryParam.set('idUnidadOrganizacional2', data.idUnidadOrganizacional2); }
        if (data.idUnidadOrganizacional3) { queryParam = queryParam.set('idUnidadOrganizacional3', data.idUnidadOrganizacional3); }
        if (data.idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', data.idAreaDesempenioLaboral); }
        if (data.idTipoPlaza) { queryParam = queryParam.set('idTipoPlaza', data.idTipoPlaza); }
        if (data.idTipoCargo) { queryParam = queryParam.set('idTipoCargo', data.idTipoCargo); }
        if (data.idCargo) { queryParam = queryParam.set('idCargo', data.idCargo); }
        if (data.idEstadoPlaza) { queryParam = queryParam.set('idEstadoPlaza', data.idEstadoPlaza); }
        if (data.codigoSede) { queryParam = queryParam.set('codigoSede', data.codigoSede); }
        if (data.codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede); }
        if ((data.institucionEducativa || "").trim().length !== 0) queryParam = queryParam.set("institucionEducativa", data.institucionEducativa);
        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) queryParam = queryParam.set("idTipoCentroTrabajo", data.idTipoCentroTrabajo); 
        queryParam = queryParam.set('codigoRol', data.codigoRol); 
        return this.restangular.all('propuestasreubicaciones').all('excel').get(queryParam);
    }

    descargarPropuestaReubicacionMasivo(data: any) {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idEntidadSede !== null && data.idEntidadSede > 0) { queryParam = queryParam.set('idEntidadSede', data.idEntidadSede); }
        if ((data.codigoPlaza || '').trim().length !== 0) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
        if ((data.codigoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if ((data.anexoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('anexoCentroTrabajo', data.anexoCentroTrabajo); }
        if (data.idInstancia) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idUnidadOrganizacional1) { queryParam = queryParam.set('idUnidadOrganizacional1', data.idUnidadOrganizacional1); }
        if (data.idUnidadOrganizacional2) { queryParam = queryParam.set('idUnidadOrganizacional2', data.idUnidadOrganizacional2); }
        if (data.idUnidadOrganizacional3) { queryParam = queryParam.set('idUnidadOrganizacional3', data.idUnidadOrganizacional3); }
        if (data.idRegimenLaboral) { queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral); }
        if (data.idAreaDesempenioLaboral) { queryParam = queryParam.set('idAreaDesempenioLaboral', data.idAreaDesempenioLaboral); }
        if (data.idTipoPlaza) { queryParam = queryParam.set('idTipoPlaza', data.idTipoPlaza); }
        if (data.idTipoCargo) { queryParam = queryParam.set('idTipoCargo', data.idTipoCargo); }
        if (data.idCargo) { queryParam = queryParam.set('idCargo', data.idCargo); }
        if (data.idEstadoPlaza) { queryParam = queryParam.set('idEstadoPlaza', data.idEstadoPlaza); }
        if (data.mostrarRegistrosCargaMasiva) { queryParam = queryParam.set('mostrarRegistrosCargaMasiva', data.mostrarRegistrosCargaMasiva); }
        if (data.codigoSede) { queryParam = queryParam.set('codigoSede', data.codigoSede); }
        if (data.codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede); }
        if (data.idRol) { queryParam = queryParam.set('idRol', data.idRol); }
        if (data.codigoRol) { queryParam = queryParam.set('codigoRol', data.codigoRol); }
        return this.restangular.all('propuestasreubicaciones').all('excel-masivo').get(queryParam);
    }

    eliminarCargaMasiva(data: any) {
        return this.restangular.all("propuestasreubicaciones").all("eliminar-carga").post(data);
    }

    generarProyectoResolucion = (data: any  ): Observable<any> => {
        console.log(data);
        return this.restangular.all("propuestasreubicaciones").all("proyectaresolucion").post(data);
    }

    enviarAccionesGrabadas = (
        data: any
    ): Observable<any> => {
        return this.restangular.all("propuestasreubicaciones").all("acciongrabada").post(data);
    }

    consultaPropuestaReubicacion(idPropuestaReubicacion: any) {
        return this.restangular
            .one("propuestasreubicaciones", idPropuestaReubicacion)
            .get();
    }

    proyectarReubicacion(data: any): Observable<any> {
        return this.restangular.all("propuestasreubicaciones").patch(data);
    }

    GetPropuestaReubicacion( idPropuestaReubicacion: any ): Observable<any> {
        return this.restangular.one("propuestasreubicaciones", idPropuestaReubicacion).get();
    }

    GenerarProyectoResolucionConReplica( generarProyectoResolucion: any): Observable<any> {
        let queryParam = new HttpParams();
        //if (idTipoResolucion !== null && idTipoResolucion > 0) { queryParam = queryParam.set('idTipoResolucion', idTipoResolucion); }
        return this.restangular
            .all("proyectosresolucion/generar")
            .post(generarProyectoResolucion);
    }

    EliminarProyectoResolucionConReplica(
        codigoProyectoResolucion: any,
        eliminarProyectoResolucion: any
    ): Observable<any> {
        return this.restangular
            .one("proyectosresolucion", codigoProyectoResolucion)
            .all("eliminar")
            .patch(eliminarProyectoResolucion);
    }

    Aprobar = (data: any): Observable<any> => {
        return this.restangular.all("propuestasreubicaciones").all("aprobar").post(data);
    }

    Rechazar = (data: any): Observable<any> => {
        return this.restangular.all("propuestasreubicaciones").all("rechazar").post(data);
    }

    Visualizar = (data: any): Observable<any> => {
        return this.restangular.all("documentossustento").all("visualizar").post(data);
    }
}
