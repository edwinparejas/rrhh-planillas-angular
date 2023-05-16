import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpParams } from "@angular/common/http";
import { convertObjectToGetParams } from "@minedu/functions/http.helpers";
import * as moment from "moment";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { AccionesGrabadasRestangularService } from "./resources/acciones-grabadas-restangular.service";

@Injectable({
    providedIn: "root",
})
export class AccionesGrabadasService {
    constructor(
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private restangular: AccionesGrabadasRestangularService
    ) {}

    /*     crearProyectoResolucion(proyectoResolucion: any): Observable<any> {

        let url = this.basePath.accionesGrabadasApi + "/proyectoresolucion/generarproyectoresolucioninterno/";
        return this._http.post<any>(`${url}`, proyectoResolucion);
    } */
    crearProyectoResolucion(proyectoResolucion: any): Observable<any> {
        return this.restangular
            .all("proyectoresolucion")
            .all("generarproyectoresolucioninternoconarchivo")
            .post(proyectoResolucion);
    }

    getTiposResolucion(codigoTipoSede: any,codigoSede:any,anio:any): Observable<any> {
        let queryParam = new HttpParams();
        queryParam = queryParam.append("codigoTipoSede", codigoTipoSede);
        queryParam = queryParam.append("codigoSede", codigoSede);
        queryParam = queryParam.append("anio", anio);
        let url = this.basePath.accionesGrabadasApi + "/tiposresolucion";
        return this._http.get<any>(url, { params: queryParam });
    }

    getTiposFormatoSustento(): Observable<any> {
        let url = this.basePath.accionesGrabadasApi + "/tiposformatosustento";
        return this._http.get<any>(`${url}`);
    }

    getTiposDocumentoIdentidad(): Observable<any> {
        let url =
            this.basePath.accionesGrabadasApi + "/tiposdocumentoidentidad";
        return this._http.get<any>(`${url}`);
    }

    getTiposDocumentoSustento(): Observable<any> {
        let url = this.basePath.accionesGrabadasApi + "/tiposdocumentosustento";
        return this._http.get<any>(`${url}`);
    }

    buscarServidorPublico(
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
            .set("paginaActual", paginaActual)
            .set("tamanioPagina", tamanioPagina);
        return this.restangular
            .all("servidorespublicos")
            .all("consultar")
            .post(data, queryParam);
    }

    getRegimenesLaborales(): Observable<any> {
        return this.restangular.all("regimeneslaborales").get();
    }
    buscarPlaza(
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
            .set("paginaActual", paginaActual)
            .set("tamanioPagina", tamanioPagina);
        return this.restangular
            .all("plazas")
            .all("consultar")
            .post(data, queryParam);
    }

    eliminar(
        pIdAccionGrabada: any,
        pMotivoEliminacion: string
    ): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
            .set("idAccionGrabada", pIdAccionGrabada)
            .set("motivoEliminacion", pMotivoEliminacion);
        return this.restangular
            .all("accionesgrabadas")
            .one("eliminar", pIdAccionGrabada)
            .one("motivo", pMotivoEliminacion)
            .delete();
    }

    getObtenerCodigoDreUgel(codigoTipoSede: string) {
        let queryParam: HttpParams = new HttpParams().set(
            "codigoEntidadSede",
            codigoTipoSede
        );
        return this.restangular
            .all("entidadpassport")
            .all("obtienecodigosdreugel")
            .get(queryParam);
    }

    entidadPassport = (codigoEntidadSede: string): Observable<any> => {
        let queryParam = new HttpParams()
            .set("codigoEntidadSede", codigoEntidadSede);

            return this.restangular
            .all("entidadpassport")
            .all("entidadPassport")
            .get(queryParam);

    }

    postValidarAccionesGrabadasParaGenerarProyecto(
        listaAcciones: any,
        idUgel,
        idDre
    ): Observable<any> {
        let queryParam = new HttpParams();
        queryParam = queryParam.set("idUgel", idUgel);
        queryParam = queryParam.set("idDre", idDre);

        return this.restangular
            .all("accionesgrabadas")
            .all("validaraccionesgrabadasproyectoresolucion")
            .post(listaAcciones, queryParam);
    }

    getAccionesGrabadas(
        data: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> {
        data.paginaActual = paginaActual;
        data.tamanioPagina = tamanioPagina;
        if (data.fechaInicio != null) {
            data.fechaInicio = moment(data.fechaInicio);
        }
        if (data.fechaFin != null) {
            data.fechaFin = moment(data.fechaFin);
        }
        let queryParams = convertObjectToGetParams(data);
        return this.restangular.all("accionesgrabadas").getData(queryParams);
    }

    exportar(data: any): Observable<string> {
        if (data.fechaInicio != null) {
            data.fechaInicio = moment(data.fechaInicio);
        }
        if (data.fechaFin != null) {
            data.fechaFin = moment(data.fechaFin);
        }

        let url = this.basePath.accionesGrabadasApi + "/accionesgrabadas/exportar";
        return this._http.post(`${url}`, data,{responseType:"text"});

    }

    getAcciones(): Observable<any> {
        return this.restangular.all("acciones").all("todos").get();
    }

    getAccionesporGrupo(data: any): Observable<any> {
        return this.restangular.all("acciones").get(data);
    }

    getGruposAccion(): Observable<any> {
        return this.restangular.all("gruposaccion").all("todos").get();
    }

    getGruposAccionPorSistema(data: string): Observable<any> {
        let queryParam: HttpParams = new HttpParams().set("sistema", data);
        return this.restangular
            .all("gruposaccion")
            .all("todosporsistema")
            .get(queryParam);
    }

    getGruposAccionPorRegimenLaboral(data: any): Observable<any> {
        return this.restangular
            .all("gruposaccion")
            .get(data);
    }

    getMotivosAccion() {
        return this.restangular.all("motivosaccion").all("todos").get();
    }

    getMotivosAccionporAccion(data: any) {
        return this.restangular.all("motivosaccion").get(data);
    }
    getAniosAperturados(): Observable<any> {
        return this.restangular.all("anioaperturado").get();
    }

    getEstadosAccionesGrabadas() {
        return this.restangular.all("estadosaccionesgrabas").get();
    }
    listarInstancia(activo: any) {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("instancias").get(queryParam);
    }

    listarSubinstancia(idInstancia: any, activo: any) {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular
            .one("instancias", idInstancia)
            .all("subinstancias")
            .get(queryParam);
    }
    obtenerCentroTrabajoPorCodigoSede = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
       
        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        return this.restangular
            .all("centrostrabajo")
            .all("centrotrabajoporcodigosede")
            .get(queryParam);
    };
    obtenerDetalleProyecto(idAccionGrabada: any) {
        let queryParam: HttpParams = new HttpParams().set("idAccionGrabada", idAccionGrabada);
        return this.restangular
        .all("accionesgrabadas")
        .all("obtenerdetalleproyecto").get(queryParam);
    }
    obtenerAccesoUsuario(data: any): Observable<any> {
        let queryParam = new HttpParams();       
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        return this.restangular
            .all("acceso")
            .get(queryParam);
    };
    
    getRegimenesLaboralesPorRolyTipoSede(data: any,): Observable<any> {
            let queryParam = new HttpParams();       
            if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
            if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);
    
            return this.restangular
                .all("regimeneslaborales")
                .all("getRegimenesLaboralesPorRolPorTipoSede")
                .get(queryParam);
    };    

    getGrupoAccionPorRegimenLaboralPorRolTipoSede(data: any): Observable<any> {
        let queryParam = new HttpParams();       
        if (data.idRegimenLaboral !== null) queryParam = queryParam.append("idRegimenLaboral", data.idRegimenLaboral);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);
        return this.restangular
            .all("gruposaccion")
            .all("getGrupoAccionPorRegimenLaboralPorRolPorTipoSede")            
            .get(queryParam);
    }

    getAccionPorRegimenLaboralPorGrupoAccionPorRolPorTipoSede(data: any): Observable<any> {
        let queryParam = new HttpParams();       
        if (data.idRegimenLaboral !== null) queryParam = queryParam.append("idRegimenLaboral", data.idRegimenLaboral);
        if (data.idGrupoAccion !== null) queryParam = queryParam.append("idGrupoAccion", data.idGrupoAccion);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);
        return this.restangular
            .all("acciones")
            .all("getAccionPorRegimenLaboralPorGrupoAccionPorRolPorTipoSede")            
            .get(queryParam);
    }

    getMotivoAccionPorRegimenLaboralPorGrupoAccionPorAccionPorRolPorTipoSede(data: any): Observable<any> {
        let queryParam = new HttpParams();       
        if (data.idRegimenLaboral !== null) queryParam = queryParam.append("idRegimenLaboral", data.idRegimenLaboral);
        if (data.idGrupoAccion !== null) queryParam = queryParam.append("idGrupoAccion", data.idGrupoAccion);
        if (data.idAccion !== null) queryParam = queryParam.append("idAccion", data.idAccion);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);
        return this.restangular
            .all("motivosaccion")
            .all("getMotivoAccionPorRegimenLaboralPorGrupoAccionPorAccionPorRolPorTipoSede")            
            .get(queryParam);
    }
}



