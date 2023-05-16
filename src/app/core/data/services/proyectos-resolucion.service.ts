import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ProyectosResolucionRestangularService } from "./resources/proyectos-resolucion-restangular.service";
// import { convertObjectToGetParams } from "@minedu/functions/http.helpers";

@Injectable({
    providedIn: "root",
})
export class ProyectosResolucionService {
    constructor(private restangular: ProyectosResolucionRestangularService) {}

    getAnios = (): Observable<any> => {
        return this.restangular.all("anios").get();
    };

    getComboRegimenesLaborales = (): Observable<any> => {
        return this.restangular.all("regimeneslaborales").get();
    };

    getComboTiposResolucion = (): Observable<any> => {
        return this.restangular.all("tiposresolucion").get();
    };

    getComboEstadosResolucion = (): Observable<any> => {
        return this.restangular.all("estadosresolucion").get();
    };

    getComboGruposAccion = (
        idRolRegimenLaboral: string,
        codigoSistema: string
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idRolRegimenLaboral !== null) {
            queryParam = queryParam.set(
                "idRolRegimenLaboral",
                idRolRegimenLaboral
            );
        }

        if (codigoSistema !== null) {
            queryParam = queryParam.set("codigoSistema", codigoSistema);
        }

        return this.restangular.all("gruposaccion").get(queryParam);
    };

    getComboAcciones = (
        idRolRegimenLaboral: string,
        idGrupoAccion: string,
        codigoSistema: string
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idRolRegimenLaboral !== null) {
            queryParam = queryParam.set(
                "idRolRegimenLaboral",
                idRolRegimenLaboral
            );
        }
        if (idGrupoAccion !== null) {
            queryParam = queryParam.set("idGrupoAccion", idGrupoAccion);
        }
        if (codigoSistema !== null) {
            queryParam = queryParam.set("codigoSistema", codigoSistema);
        }
        return this.restangular.all("acciones").get(queryParam);
    };

    getComboMotiviosAccion = (
        idRolRegimenLaboral: string,
        idGrupoAccion: string,
        idAccion: string,
        codigoSistema: string
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idRolRegimenLaboral !== null) {
            queryParam = queryParam.set(
                "idRolRegimenLaboral",
                idRolRegimenLaboral
            );
        }
        if (idGrupoAccion !== null) {
            queryParam = queryParam.set("idGrupoAccion", idGrupoAccion);
        }
        if (idAccion !== null) {
            queryParam = queryParam.set("idAccion", idAccion);
        }
        if (codigoSistema !== null) {
            queryParam = queryParam.set("codigoSistema", codigoSistema);
        }
        return this.restangular.all("motivosaccion").get(queryParam);
    };

    bandejaProyectosResolucion(
        proyectorRequest: any,
        paginaActual: any,
        tamanioPagina: any
    ): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
            .set("paginaActual", paginaActual)
            .set("tamanioPagina", tamanioPagina);
        return this.restangular
            .all("proyectosresolucion/buscar")
            .post(proyectorRequest, queryParam);
    }

    exportarBandejaProyectoResolucion(proyectorRequest: any) {
        return this.restangular
            .all("proyectosresolucion/exportar")
            .download(proyectorRequest);
    }
    exportarBandejaProyectoResolucionExcel(proyectorRequest: any){
        return this.restangular
            .all("proyectosresolucion/exportar")
            .postText(proyectorRequest);
    }
    downloadFile(blob: any, nombreFile: string) {
        const downloadURL = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadURL;
        link.download = nombreFile;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadURL);
        }, 100);
    }

    getSeccionVistaProyectoById = (
        idDetalleProyectoResolucion: string
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idDetalleProyectoResolucion !== null) {
            queryParam = queryParam.set(
                "idDetalleProyectoResolucion",
                idDetalleProyectoResolucion
            );
        }
        return this.restangular
            .all("formatosvistaproyecto/seccionesvistaproyecto/detallado")
            .get(queryParam);
    };

    listarDetallesSeccionesVistaProyectoById = (
        idProyectoResolucion
    ): Observable<any> => {
        return this.restangular
            .one("proyectosresolucion", idProyectoResolucion)
            .all("vistas")
            .get();
    };

    GenerarProyectoResolucion(generarProyectoResolucion: any): Observable<any> {
        let queryParam = new HttpParams();
        //if (idTipoResolucion !== null && idTipoResolucion > 0) { queryParam = queryParam.set('idTipoResolucion', idTipoResolucion); }
        return this.restangular
            .all("proyectosresolucion/generarproyectoresolucion")
            .post(generarProyectoResolucion);
    }

    EliminarProyectoResolucion(
        idProyectoResolucion: any,
        eliminarProyectoResolucion: any
    ): Observable<any> {
        let queryParam = new HttpParams();
        return this.restangular
            .one("proyectosresolucion", idProyectoResolucion)
            .all("eliminar")
            .patch(eliminarProyectoResolucion);
    }

    /**FIN*/

    getComboRolespassport = (idSistema: string): Observable<any> => {
        return this.restangular.one("rolespassport", idSistema).get();
    };

    getRegistroAlerta = (idAlerta: string): Observable<any> => {
        return this.restangular.one("alertas", idAlerta).get();
        // return this.restangular.one('alertas', idAlerta).patch();
    };

    getListaAlertas = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idSistema !== null) {
            queryParam = queryParam.set("idSistema", data.idSistema);
        }
        if (data.idTipoAlerta !== null) {
            queryParam = queryParam.set("idTipoAlerta", data.idTipoAlerta);
        }
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set("idRolPassport", data.idRolPassport);
        }
        if (data.activo !== null) {
            queryParam = queryParam.set("activo", data.activo);
        }
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("alertas").get(queryParam);
    };

    getComboTipodocumento = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposdocumentoidentidad").get();
    };

    getListaServidorPublico = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                "idTipoDocumentoIdentidad",
                data.idTipoDocumentoIdentidad
            );
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                "numeroDocumentoIdentidad",
                data.numeroDocumentoIdentidad
            );
        }
        if (data.primerApellido !== null) {
            queryParam = queryParam.set("primerApellido", data.primerApellido);
        }
        if (data.segundoApellido !== null) {
            queryParam = queryParam.set(
                "segundoApellido",
                data.segundoApellido
            );
        }
        if (data.nombres !== null) {
            queryParam = queryParam.set("nombres", data.nombres);
        }
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);

        return this.restangular.all("servidorespublicos").get(queryParam);
    };

    getComboRegimenLaboral = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("regimeneslaborales").get();
    };

    buscarPlaza = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
        .set("paginaActual", pageIndex)
        .set("tamanioPagina", pageSize);
    return this.restangular
        .all("plazas")
        .all("consultar")
        .post(data, queryParam);
    };

    getComboInstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        return this.restangular.all("instancias/filtroInstancia").get(queryParam);
    }

    getComboSubinstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);
        if (data.idInstancia !== null) queryParam = queryParam.append("idInstancia", data.idInstancia);

        return this.restangular.all("instancias/filtroSubInstancia").get(queryParam);
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

    listarTipoCentroTrabajo(idNivelInstancia: any, activo: any) {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) {
            queryParam = queryParam.set("idNivelInstancia", idNivelInstancia);
        }
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposcentrotrabajo").get(queryParam);
    }

    getModalidadEducativa(data: any) {
        let queryParam = new HttpParams();
        if (data.idModalidadEducativa != null) queryParam = queryParam.append("idModalidadEducativa", data.idModalidadEducativa);

        return this.restangular.all("modalidadeseducativa").get();
    }

    getNivelEducativo(data: any) {
        let queryParam = new HttpParams();
        if (data.idModalidadEducativa != null) queryParam = queryParam.append("idModalidadEducativa", data.idModalidadEducativa);
        if (data.idNivelEducativo != null) queryParam = queryParam.append("idNivelEducativo", data.idNivelEducativo);

        return this.restangular.all("niveleseducativo").get(queryParam);
    }
    
    listarCentroTrabajo(data: any, pageIndex, pageSize) {
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

        if ((data.codigoSede || "").trim().length !== 0) {
            queryParam = queryParam.set(
                "codigoSede",
                data.codigoSede
            );
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


        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        
        return this.restangular.all("centrostrabajo").get(queryParam);
    }

    accesoRolPassport(
        codigoRolPassport: any,
        codigoTipoSede: any
    ): Observable<any> {
        let queryParam = new HttpParams();
        if ((codigoRolPassport || "").trim().length !== 0) {
            queryParam = queryParam.set("codigoRolPassport", codigoRolPassport);
        }
        if ((codigoTipoSede || "").trim().length !== 0) {
            queryParam = queryParam.set("codigoTipoSede", codigoTipoSede);
        }
        return this.restangular.all("rolespassport").get(queryParam);
    }

    entidadPassport(codigoEntidadSede: any) {
        let queryParam = new HttpParams();
        if ((codigoEntidadSede || "").trim().length !== 0) {
            queryParam = queryParam.set("codigoEntidadSede", codigoEntidadSede);
        }
        return this.restangular.all("entidades").get(queryParam);
    }

    listarRegimenLaboral(
        idNivelInstancia: any,
        idRolPassport: any,
        codigoSistema: any,
        idGrupoAccion: any,
        idAccion: any,
        idMotivoAccion: any,
        activo: any,
        esCreacionPlaza: any
    ) {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) {
            queryParam = queryParam.set("idNivelInstancia", idNivelInstancia);
        }
        if (idRolPassport !== null && idRolPassport > 0) {
            queryParam = queryParam.set("idRolPassport", idRolPassport);
        }
        if (codigoSistema !== null && codigoSistema > 0) {
            queryParam = queryParam.set("codigoSistema", codigoSistema);
        }
        if (idGrupoAccion !== null && idGrupoAccion > 0) {
            queryParam = queryParam.set("idGrupoAccion", idGrupoAccion);
        }
        if (idAccion !== null && idAccion > 0) {
            queryParam = queryParam.set("idAccion", idAccion);
        }
        if (idMotivoAccion !== null && idMotivoAccion > 0) {
            queryParam = queryParam.set("idMotivoAccion", idMotivoAccion);
        }
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        if (esCreacionPlaza !== null) {
            queryParam = queryParam.set("esCreacionPlaza", esCreacionPlaza);
        }
        return this.restangular
            .all("regimeneslaborales")
            .all("filtrado")
            .get(queryParam);
    }

    buscarCentroTrabajo(data: any) {
        let queryParam = new HttpParams();
        if ((data.codigoCentroTrabajo || "").trim().length !== 0) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                data.codigoCentroTrabajo
            );
        }
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) {
            queryParam = queryParam.set(
                "idNivelInstancia",
                data.idNivelInstancia
            );
        }
        if (data.idEntidadSede !== null && data.idEntidadSede > 0) {
            queryParam = queryParam.set("idEntidadSede", data.idEntidadSede);
        }
        if (data.registrado !== null) {
            queryParam = queryParam.set("registrado", data.registrado);
        }
        return this.restangular
            .all("centrostrabajo")
            .all("buscar")
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

    getDefaultValueComboInstanciasByCodSede = (codSede: any): Observable<any> => {
        let queryParam = new HttpParams();
    
        if (codSede !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codSede);

        return this.restangular
        .all("instancias")
        .all("instaciaDetallePorCodigoSede")            
        .get(queryParam);
    };
}
