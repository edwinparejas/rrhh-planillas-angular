import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AscensoRestangularService } from './resources/ascenso.restangular.service';


@Injectable({
    providedIn: 'root'
})
export class AscensoService {

    constructor(private restangular: AscensoRestangularService) { }

    getComboRegimenLaboral = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('regimenlaboral').get();
    }

    // getComboEstadoEtapa = (activo: any = null): Observable<any> => {
    //     let queryParam = new HttpParams();
    //     if (activo !== null) {
    //         queryParam = queryParam.set('activo', activo);
    //     }
    //     return this.restangular.all('estadosetapa').get();
    // }
    getComboEstadoEtapa = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        queryParam = queryParam.set('codigoCatalogo', '8');
        return this.restangular.all('catalogoitem').get(queryParam);
    }
    getComboEstadoProceso = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('estadosproceso').get();
    }
    getComboInstancia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('instancias/listarinstancias').get();
    }
    getComboSubInstancia = (data: any = null ) => {
        let queryParam = new HttpParams();
        
        if (data.instancias !== null) {
            queryParam = queryParam.set('idInstancia', data.instanciaValue);
            queryParam = queryParam.set('activo', data.activo);
        }
        return this.restangular.all('instancias/listarsubinstancias' ).get(queryParam);
    }
    getComboNivel = (data: any = null) => {
        let queryParam = new HttpParams();
        if(data.modalidad !== null) {
            queryParam = queryParam.set('codigoModalidadEducativa', data.modalidadValue);
            queryParam = queryParam.set('activo', data.activo);
        }
        return this.restangular.all('niveleducativo').get(queryParam);
    }

    getComboTipodocumento = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tipodocumento/listartipodocumentodeidentidad').get();
    }

    // getComboModalidad = (activo: any = null): Observable<any> => {
    //     let queryParam = new HttpParams();
    //     if (activo !== null) {
    //         queryParam = queryParam.set('activo', activo);
    //     }
    //     // activo=true;
    //     // queryParam = queryParam.set('activo', activo);
    //     return this.restangular.all('modalidadeducativa').get();
    // }
    getComboModalidad = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('modalidadeducativa').get();
    }
   
    /*for delete*/
    getComboEstado = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('estadosproceso').get();
    }
    // getListarAdjudicacion = (activo: any = null): Observable<any> => {
    //     let queryParam = new HttpParams();
    //     if (activo !== null) {
    //         queryParam = queryParam.set('activo', activo);
    //     }
    //     return this.restangular.all('adjudicacion/Paginado').get();
    // }
    getComboEstadoAdjudicaciones = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('estadosadjudicacion').get();
    }
    getComboEstadoSubsanacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('estadossubsanacion').get();
    }
    getComboGrupoCompetencia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        /*if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }*/
        activo=true;
        queryParam = queryParam.set('activo', activo);
        return this.restangular.all('grupocompetencia').get(queryParam);
    }

    getListaprocesos = (data: any, pageIndex, pageSize) => {
        data.paginaActual=pageIndex;
        data.tamanioPagina=pageSize;
        console.log('buscar2', data); 
        return this.restangular.all('procesos').get(data);
    }

    getListaCalificacion = (data: any, pageIndex, pageSize) => {

        let queryParam = new HttpParams();
        if (data.idTipoDocumento !== null) {
            queryParam = queryParam.set('idTipoDocumento', data.idTipoDocumento);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumento', data.numeroDocumentoIdentidad);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idGrupoCompetencia !== null) {
            queryParam = queryParam.set('idGrupoCompetencia', data.idGrupoCompetencia);
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
        
        return this.restangular.all('calificaciones').get(queryParam);
    }
    getListaAdjudicar = (data: any, pageIndex, pageSize) => {
        data.paginaActual=pageIndex;
        data.tamanioPagina=pageSize;
        return this.restangular.all('adjudicacion').post(data);
    }

    getListaPlazasPrePublicadas = (data: any, pageIndex, pageSize) => {
        data.paginaActual=pageIndex;
        data.tamanioPagina=pageSize;
        return this.restangular.all('plazas').get(data);
    }

    generarPlazaAscenso = (data: any) => {
        console.log('entraste a generarPlazaAscenso')
        return this.restangular.all('plazasAscenso/generar').post(data);
    }

    getListaPlazasObservadas = (data: any, pageIndex, pageSize) => {
        data.paginaActual=pageIndex;
        data.tamanioPagina=pageSize;
        return this.restangular.all('plazas/observadas').get(data);
    }
    
    actualizarPlazaAscenso = (data: any) => {
        console.log('actualizarPlazaAscenso',data);
        return this.restangular.all('plazasAscenso/actualizarPlazaAscenso').put(data);
    }
    // getListaAdjudicacion = (data: any, pageIndex, pageSize) => {
        
    //     let queryParam = new HttpParams();
    //     if (data.idInstancia !== null) {
    //         queryParam = queryParam.set('idInstancia', data.idInstancia);
    //     }
    //     if (data.idSubInstancia !== null) {
    //         queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
    //     }
    //     if (data.idTipoDocumento !== null) {
    //         queryParam = queryParam.set('idTipoDocumento', data.idTipoDocumento);
    //     }
    //     if (data.idModalidadEducativa !== null) {
    //         queryParam = queryParam.set('idModalidadEducativa', data.idModalidadEducativa);
    //     }
    //     if (data.idEstado !== null) {
    //         queryParam = queryParam.set('idEstadoAdjudicacion', data.idEstado);
    //     }
    //     if (data.idEtapa !== null) {
    //         queryParam = queryParam.set('idProcesoEtapa', "2");
    //     }
    //     queryParam = queryParam.set('paginaActual', pageIndex);
    //     queryParam = queryParam.set('tamanioPagina', pageSize);
    //     return this.restangular.all('adjudicacion/paginado').post(queryParam);
    // }
    exportarExcelAdjudicacion = (data: any, pageIndex, pageSize) => {

        let queryParam = new HttpParams();
        if (data.idTipoDocumento !== null) {
            queryParam = queryParam.set('idTipoDocumento', data.idTipoDocumento);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumento', data.numeroDocumentoIdentidad);
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

        return this.restangular.all('adjudicacion/exportar').download(null, queryParam);
    }
    exportarExcelAscenso(
        
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idEstadoProceso !== null) {
            queryParam = queryParam.set('idEstadoProceso', data.idEstadoProceso);
        }
        if (data.anio !== null) {
            queryParam = queryParam.set('anio', data.anio);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set('idRolPassport', data.idRolPassport);
        }
        return this.restangular
            .all('procesos/exportar')
            .download(null, queryParam);
    }
    exportarExcelCalificaciones = (data: any, pageIndex, pageSize) => {

        let queryParam = new HttpParams();
        if (data.idTipoDocumento !== null) {
            queryParam = queryParam.set('idTipoDocumento', data.idTipoDocumento);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumento', data.numeroDocumentoIdentidad);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set('idInstancia', data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set('idSubInstancia', data.idSubInstancia);
        }
        if (data.idGrupoCompetencia !== null) {
            queryParam = queryParam.set('idGrupoCompetencia', data.idGrupoCompetencia);
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
    
    }
    //etablabyid debe ser proceso byid 
    getEtapaById = (idEtapa) => {
        return this.restangular.one('etapas', idEtapa).get();
    }

    getProcesoById = (idProceso) => {
       
        return this.restangular.one('procesos/procesobyid', idProceso).get();
    }
    getEliminarCargaMasiva = (idProceso) => {
        console.log('getEliminarCargaMasiva', idProceso);
       // return this.restangular.all('adjudicacion/eliminarcargamasiva').patch(idEtapaProceso);
       return this.restangular.one('adjudicacion/eliminarcargamasiva', idProceso).patch({ idProcesoEtapa: idProceso });
    }

    //--------------------
    getAdjudicacionById = (idAdjudicacion) => {
        return this.restangular.one('adjudicacion/obtenerPorId', idAdjudicacion).post(idAdjudicacion);
    }
    getDetalleCalificacion= (idCalificacion) =>{
        return this.restangular.one('calificaciones', idCalificacion).get();
    }
    // getPlazaById = (idPlaza) => {
    //     console.log("returid", idPlaza);
    //     return ;
    // }
     
    getListaplazas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idEtapa !== null) {
            queryParam = queryParam.set('idEtapa', data.idEtapa);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazas').get(queryParam);
    }

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
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
 
        console.log('params',queryParam)
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
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazascontratacion/observadas').get(queryParam);
    }
    getListaGrupoModalidad = (idProceso , pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('idProceso',idProceso);
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular.all('grupomodalidad').get(queryParam);
    }

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
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        /*   queryParam = queryParam.set('paginaActual', pageIndex);
          queryParam = queryParam.set('tamanioPagina', pageSize); */
        return this.restangular
            .all('plazascontratacion/observadas/exportar')
            .download(null, queryParam);
    }

    getPlazaById = (idPlaza) => {
        console.log("byId", idPlaza)
        return this.restangular.one('accionpersonal/accionpersonabyid', idPlaza).get();
    }

    convocarPlazas(data: any): Observable<any> {
        console.log(data);
        return this.restangular.all('plazas/prepublicadas/convocar').post(data);
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
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazascontratacion/convocadas').get(queryParam);
    }

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
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
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
        return this.restangular.all('motivosnopublicacion').get();
    }


    getListaServidorPublico = (data: any,pageIndex,pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad',data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad',data.numeroDocumentoIdentidad
            );
        }
        if (data.primerApellido !== null) {
            queryParam = queryParam.set('primerApellido', data.primerApellido);
        }
        if (data.segundoApellido !== null) {
            queryParam = queryParam.set('segundoApellido',data.segundoApellido);
        }
        if (data.nombres !== null) {
            queryParam = queryParam.set('nombres', data.nombres);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('servidorespublicos').get(queryParam);
    }


    buscarPlaza = (data: any,pageIndex,pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set('codigoPlaza', data.codigoPlaza);
        }
        if (data.centroTrabajo !== null) {
            queryParam = queryParam.set('centroTrabajo', data.centroTrabajo);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('plazas').get(queryParam);
    }

    updateObservacionAjudicacion = (data: any) => {
        var ruta = 'adjudicaciones/' + data.idAdjudicacion + '/subsanar'
        return this.restangular.all(ruta).post(data);
    }
    AdjudicarAptos(data: any): Observable<any> {
       let url= 'procesos/' + data.idProceso + '/' + data.idEtapa + '/adjudicar'
        return this.restangular.all(url).post(data);
    }
    Finalizar(data: any): Observable<any> {
        let url= 'adjudicaciones/' + data.idProceso + '/' + data.idEtapa + '/finalizar'
         return this.restangular.all(url).post(data);
     }

     eliminarMasivo(data:any):Observable<any>{
        let url= 'calificaciones/' + data.idProceso + '/' + data.idEtapa + '/eliminarmasivo'
        return this.restangular.all(url).patch(data);
     }
     contarMasivoCargado(data:any):Observable<any>{
        let url= 'calificaciones/' + data.idProceso + '/' + data.idEtapa + '/contarregistros'
        return this.restangular.all(url).get(data);
     }

}
