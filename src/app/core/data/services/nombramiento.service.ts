import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CatalogoEstadoProcesoEnum, CatalogoSituacionValidacionEnum, CatalogoTipoProcesoEnum } from 'app/main/apps/procesos/nombramiento/_utils/constants';
import { Observable } from 'rxjs';
import { NombramientoRestangularService } from './resources/nombramiento.restangular.service';

@Injectable({
    providedIn: 'root'
})
export class NombramientoService {

    constructor(private restangular: NombramientoRestangularService) { }

    getComboRegimenLaboral = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('regimenlaboral').get();
    }

    getComboProceso = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        queryParam = queryParam.set('estadoProcesoCodigoFinalizado', CatalogoEstadoProcesoEnum.FINALIZADO.toString());
        queryParam = queryParam.set('tipoProcesoCodigoNombramiento', CatalogoTipoProcesoEnum.NOMBRAMIENTO.toString());

        return this.restangular.all('proceso').get(queryParam);
    }

    getComboEstadoProceso = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('estadosprocesos').get();
    }

    getComboCatalogoItem = (codigoCatalogo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoCatalogo !== null) {
            queryParam = queryParam.set('codigoCatalogo', codigoCatalogo);
        }
        return this.restangular.all('catalogoitem').get(queryParam);
    }

    getComboSubInstancia = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idDre !== null) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.activo !== null) {
            queryParam = queryParam.set('activo', data.activo);
        }
        return this.restangular.all('ugel').get(queryParam);
    }

    getComboGrupoInscripcion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        return this.restangular.all('grupoinscripcion').get(queryParam);
    }

    getEtapaProceso = (idEtapaProceso: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null) {
            queryParam = queryParam.set('idEtapaProceso', idEtapaProceso);
        }
        return this.restangular.all('etapaproceso').get(queryParam);
    }

    getPageCalificacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        // if (data.idInstancia !== null) {
        //     queryParam = queryParam.set('idInstancia', data.idInstancia);
        // }
        // if (data.idSubInstancia !== null) {
        //     queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        // }
        // if (data.idGrupoInscripcion !== null) {
        //     queryParam = queryParam.set('idGrupoInscripcion', data.idGrupoInscripcion);
        // }
        // if (data.codigoPlaza !== null) {
        //     queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        // }
        // if (data.idTipoDocumento !== null) {
        //     queryParam = queryParam.set('idTipoDocumento', data.idTipoDocumento);
        // }
        // if (data.numeroDocumentoIdentidad !== null) {
        //     queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        // }
        // if (data.idEstadoCalificacion !== null) {
        //     queryParam = queryParam.set('idEstadoCalificacion', data.idEstadoCalificacion);
        // }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        return this.restangular.all('calificacion/lista').get(queryParam);
    }

    getListaProcesosEtapas = (data: any, pageIndex, pageSize) => {
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
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular.all('procesos/etapas').get(queryParam);
    }

    getProcesoEtapa = (idEtapa: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', idEtapa);
        }
        return this.restangular.all('procesos/etapas/etapa').get(queryParam);
    }

    getProcesosEtapasExport = (data: any, pageIndex, pageSize) => {
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
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular.all('procesos/etapas/exportar').download(null, queryParam);
    }

    getPageEtapaProceso = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEstadoDesarrollo !== null) {
            queryParam = queryParam.set('idEstadoDesarrollo', data.idEstadoDesarrollo);
        }
        if (data.codigoDre !== null) {
            queryParam = queryParam.set('codigoDre', data.codigoDre);
        }
        if (data.codigoUgel !== null) {
            queryParam = queryParam.set('codigoUgel', data.codigoUgel);
        }
        if (data.codigoRol !== null) {
            queryParam = queryParam.set('codigoRol', data.codigoRol);
        }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        return this.restangular.all('etapaproceso/lista').get(queryParam);
    }

    getExportEtapaProceso = (data: any, pageIndex, pageSize) : Observable<any> => {
        let queryParam = new HttpParams();
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set('idProceso', data.idProceso);
        }
        if (data.idEstadoDesarrollo !== null) {
            queryParam = queryParam.set('idEstadoDesarrollo', data.idEstadoDesarrollo);
        }
        if (data.codigoRol !== null) {
            queryParam = queryParam.set('codigoRol', data.codigoRol);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        return this.restangular.all('etapaproceso/exportar').get(queryParam);
    }

    getComboInstancia = (): Observable<any> => {
        let queryParam = new HttpParams();
        return this.restangular.all('dre').get(queryParam);
    }

    getCalificacion = (idCalificacion: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idCalificacion !== null) {
            queryParam = queryParam.set('idCalificacion', idCalificacion);
        }
        return this.restangular.all('calificacion').get(queryParam);
    }

    getCalificacionResultado = (idCalificacion: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idCalificacion !== null) {
            queryParam = queryParam.set('idCalificacion', idCalificacion);
        }
        return this.restangular.all('calificacion/resultado').get(queryParam);
    }

    actualizarMotivoObservacionCalificacion = (data: any): Observable<any> => {
        return this.restangular.all("calificacion/actualizarMotivoObservacion").put(data);
    }

    modificarSituacionValidacionPlazaNombramiento = (data: any): Observable<any> => {
        return this.restangular.all("plazanombramiento/actualizarSituacionValidacion").put(data);
    }

    modificarEstadoValidacionPlazaPlazaNombramiento = (data: any): Observable<any> => {
        return this.restangular.all("plazanombramiento/actualizarEstadoValidacionPlaza").put(data);
    }

    getExportPlazaNombramiento = (data: any, codigoSituacionValidacion, pageIndex, pageSize) : Observable<any> => {
        let queryParam = new HttpParams();
        if (data.codigoModular !== null) {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoDre !== null) {
            queryParam = queryParam.set('codigoDre', data.codigoDre);
        }
        if (data.codigoUgel !== null) {
            queryParam = queryParam.set('codigoUgel', data.codigoUgel);
        }

        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        if(codigoSituacionValidacion != -1 )
        { 
            queryParam = queryParam.set('codigoSituacionValidacion', codigoSituacionValidacion);
            
        } 
        else
        { 
            queryParam = queryParam.set('codigoSituacionValidacion', CatalogoSituacionValidacionEnum.PRE_PUBLICADA.toString());
        } 
        
        return this.restangular.all('plazanombramiento/exportar').get(queryParam);
    }

    getPlazaNombramientoPorEtapaProceso = (idEtapaProceso: any, codigoDre: any, codigoUgel: any, codigoRol: any): Observable<any> => {
        let queryParam = new HttpParams();
        
        queryParam = queryParam.set('idEtapaProceso', idEtapaProceso);
        queryParam = queryParam.set('codigoDre', codigoDre);
        queryParam = queryParam.set('codigoUgel', codigoUgel);
        queryParam = queryParam.set('codigoRol', codigoRol);
        return this.restangular.all('plazanombramiento/porEtapaProceso').get(queryParam);
    }

    getPagePlazaNombramiento = (data: any, codigoSituacionValidacion, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.codigoModular !== null) {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.codigoDre !== null) {
            queryParam = queryParam.set('codigoDre', data.codigoDre);
        }
        if (data.codigoUgel !== null) {
            queryParam = queryParam.set('codigoUgel', data.codigoUgel);
        }

        queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        if(codigoSituacionValidacion != -1 )
        { 
            queryParam = queryParam.set('codigoSituacionValidacion', codigoSituacionValidacion);
            return this.restangular.all('plazanombramiento/lista').get(queryParam);
        } 
        else
        { 
            queryParam = queryParam.set('codigoSituacionValidacion', CatalogoSituacionValidacionEnum.PRE_PUBLICADA.toString());
            return this.restangular.all('plazanombramiento/listaResumen').get(queryParam);
        } 
    }

    getExportAdjudicacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        // if (data.idDre !== null && data.idDre !== 0) {
        //     queryParam = queryParam.set('idDre', data.idDre);
        // }
        // if (data.idUgel !== null && data.idUgel !== 0) {
        //     queryParam = queryParam.set('idUgel', data.idUgel);
        // }
        // if (data.idEstadoConsolidado !== null && data.idEstadoConsolidado !== 0) {
        //     queryParam = queryParam.set('idEstadoConsolidado', data.idEstadoConsolidado);
        // }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        return this.restangular.all('adjudicacion/lista').get(queryParam);
    }

    getPageAdjudicacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        // if (data.idDre !== null && data.idDre !== 0) {
        //     queryParam = queryParam.set('idDre', data.idDre);
        // }
        // if (data.idUgel !== null && data.idUgel !== 0) {
        //     queryParam = queryParam.set('idUgel', data.idUgel);
        // }
        // if (data.idEstadoConsolidado !== null && data.idEstadoConsolidado !== 0) {
        //     queryParam = queryParam.set('idEstadoConsolidado', data.idEstadoConsolidado);
        // }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        return this.restangular.all('adjudicacion/lista').get(queryParam);
    }

    getPlazaNombramientoDetalle = (idPlazaNombramientoDetalle): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idPlazaNombramientoDetalle', idPlazaNombramientoDetalle);
        return this.restangular.all('plazanombramiento').get(queryParam);
    }

    modificarFechaRechazoConsolidadoPlaza = (data: any): Observable<any> => {
        return this.restangular.all("consolidadoPlaza/actualizarFechaRechazo").put(data);
    }

    agregarDocumentoSustentoPlazaNombramiento = (data: any): Observable<any> => {
        return this.restangular.all("plazanombramiento/agregarDocumentoSustento").put(data);
    }

    getPageDocucmentoSustento = (idPlazaNombramientoDetalle): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idPlazaNombramientoDetalle', idPlazaNombramientoDetalle);
        queryParam = queryParam.set('paginaActual', '1');
        queryParam = queryParam.set('tamanioPagina', '100');

        return this.restangular.all('documentosustento/lista').get(queryParam);
    }

    modificarFechaAprobacionMasivoConsolidadoPlaza = (data: any): Observable<any> => {
        return this.restangular.all("consolidadoPlaza/actualizarFechaAprobacionMasivo").put(data);
    }

    getExportConsolidadoPlaza = (data: any, pageIndex, pageSize) : Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idDre', data.idInstancia);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.idEstadoConsolidado !== null) {
            queryParam = queryParam.set('idEstadoConsolidado', data.idEstadoConsolidado);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        //return this.restangular.all('etapaproceso/exportar').download(null, queryParam);
        return this.restangular.all('consolidadoPlaza/exportar').getFile(queryParam);
    }

    getPageConsolidadoPlaza = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idDre !== null && data.idDre !== 0) {
            queryParam = queryParam.set('idDre', data.idDre);
        }
        if (data.idUgel !== null && data.idUgel !== 0) {
            queryParam = queryParam.set('idUgel', data.idUgel);
        }
        if (data.idEstadoConsolidado !== null && data.idEstadoConsolidado !== 0) {
            queryParam = queryParam.set('idEstadoConsolidado', data.idEstadoConsolidado);
        }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        
        return this.restangular.all('consolidadoplaza/lista').get(queryParam);
    }

    // Incorporacion
    searchPlazaPaginado(data: any, pageIndex, pageSize): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null && data.idEtapaProceso !== 0) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idDesarrolloProceso !== null && data.idDesarrolloProceso !== 0) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.codigoModular !== null && data.codigoModular !== "") {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza !== "") {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazanombramiento/listaPlaza').get(queryParam);
    }

    getPlaza(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null && data.idEtapaProceso !== 0) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idDesarrolloProceso !== null && data.idDesarrolloProceso !== 0) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.codigoModular !== null && data.codigoModular !== "") {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza !== "") {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        
        //queryParam = queryParam.set('paginaActual', pageIndex);
        //queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('/plazanombramiento/listaPlaza').get(queryParam);
    }

    exportPlazaIncorporar(data: any): Observable<any> {
      
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null && data.idEtapaProceso !== 0) {
            queryParam = queryParam.set('idEtapaProceso', data.idEtapaProceso);
        }
        if (data.idDesarrolloProceso !== null && data.idDesarrolloProceso !== 0) {
            queryParam = queryParam.set('idDesarrolloProceso', data.idDesarrolloProceso);
        }
        if (data.codigoModular !== null && data.codigoModular !== "") {
            queryParam = queryParam.set('codigoModular', data.codigoModular);
        }
        if (data.codigoPlaza !== null && data.codigoPlaza !== "") {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        return this.restangular.all('plazanombramiento/listaPlazaExportar').get(queryParam);
    }

    registrarPlazaIncorporar(data: any): Observable<any> {
        
        console.log('data',data);
        return this.restangular.all('plazanombramiento/registrarPlazaIncorporar').post(data);
    }
}