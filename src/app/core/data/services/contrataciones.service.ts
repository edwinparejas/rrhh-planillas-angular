import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { 
    IActualizarEtapaProcesoViewModel,
    IActualizarIdDocumentoSustentoViewModel,
    IActualizarPlazaContratacionSiEsBecarioViewModel,
    IActualizarPlazaPrePublicacionViewModel,
    IActualizarPlazaPublicacionSituacionValidacionViewModel,
    IAprobarPostulanteContratacionDirecta,
    IEliminarPostulanteContratacionDirecta,
    IGenerarPdfPlazasContratacionDirecta,
    IGenerarPdfPlazasPrePublicadas,
    IGenerarPdfPlazasPublicadas,
    IModificarPostulanteContratacionDirecta,
    InstanciaModel,
    IPlazasContratacion,
    IPlazasContratacionDirecta,
    IPlazasContratacionValidacion,
    IPostulanteContratacionDirecta,
    IPublicarPlazasContratacionDirectaViewModel,
    ISustentoMotivosObservacionViewModel
} from "app/main/apps/procesos/contratacion/models/contratacion.model";
import { Observable } from "rxjs";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { ContratacionesRestangularService } from "./resources/contrataciones.restangular.service";
import { IPlazasContratacionResultadosPUN, IPublicarPlazasContratacionResultadosPUNViewModel } from '../../../main/apps/procesos/contratacion/models/contratacion.model';
import { AnyNaptrRecord } from "dns";
import { CodigoCentroTrabajoMaestroEnum } from '../../../main/apps/procesos/reasignacion/_utils/constants';

@Injectable({
    providedIn: "root",
})
export class ContratacionesService {
    constructor(
        private restangular: ContratacionesRestangularService,
        private _http: HttpClient,
        private basePath: RestangularBasePath
    ) {}

    getComboTipodocumento = (): Observable<any> => {
        return this.restangular.all("tiposdocumentoidentidad").get();
    };

    getListaprocesos = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.anio !== null) {
            queryParam = queryParam.set("anio", data.anio);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                "idRegimenLaboral",
                data.idRegimenLaboral
            );
        }
        if (data.idEstadoProceso !== null) {
            queryParam = queryParam.set(
                "idEstadoProceso",
                data.idEstadoProceso
            );
        }
        if (data.codigoRolPassport !== null) {
            queryParam = queryParam.set(
                "codigoRolPassport",
                data.codigoRolPassport
            );
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("procesos/etapas").get(queryParam);
    };

    buscarDesarrolloEtapaProcesoPaginado = (data: any, pageIndex, pageSize) => {
        const filtro = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize),
        };
        // console.log(data);

        // let queryParam = new HttpParams();
        // if (data.anio != null) { queryParam = queryParam.set("anio", data.anio); console.log(data.anio); }
        // if (data.codigoCentroTrabajo != null) { queryParam =  queryParam.set("codigoCentroTrabajo", data.codigoCentroTrabajo); }
        // if (data.codigoCentroTrabajoMaestro != null) { queryParam = queryParam.set("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);}
        // if (data.codigoRolPassport != null) queryParam = queryParam.set("codigoRolPassport", data.codigoRolPassport);
        // if (data.idRegimenLaboral != null) queryParam = queryParam.set("idRegimenLaboral", data.idRegimenLaboral);
        // if (data.idEstadoEtapa != null) queryParam = queryParam.set("idEstadoEtapa", data.idEstadoEtapa);
        // if (data.idTipoProceso != null) queryParam = queryParam.set("idTipoProceso", data.idTipoProceso);
        // queryParam = queryParam.set("paginaActual", pageIndex);
        // queryParam = queryParam.set("tamanioPagina", pageSize);
        // console.log(queryParam);
        //  let url = this.basePath.contratacionesApi + "/desarrollos/procesos/etapas/buscar";
        //     return this._http.get<any>(url, { params: queryParam });

        return this.restangular
            .all("desarrollos/procesos/etapas/buscar")//.get(queryParam);
            .post(filtro);

    };

    exportarBuscarEtapaProcesoPaginado(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                "idRegimenLaboral",
                data.idRegimenLaboral
            );
        }
        if (data.idEstadoProceso !== null) {
            queryParam = queryParam.set(
                "idEstadoProceso",
                data.idEstadoProceso
            );
        }
        if (data.anio !== null) {
            queryParam = queryParam.set("anio", data.anio);
        }
        if (data.codigoRolPassport !== null) {
            queryParam = queryParam.set(
                "codigoRolPassport",
                data.codigoRolPassport
            );
        }
        if (data.codigoCentroTrabajoMaestro !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajoMaestro",
                data.codigoCentroTrabajoMaestro
            );
        }
        if (data.codigoTipoSede!== null) {
            queryParam = queryParam.set(
                "codigoTipoSede",
                data.codigoTipoSede
            );
        }
        return this.restangular
            .all("desarrollos/procesos/etapas/exportar")
            .download(data);
    }

    exportarBusquedaPlazasContratacionPaginado(data: any): Observable<any> {
        return this.restangular
            .all("desarrollos/prepublicaciones/exportar")
            .download(data);
    }

    getListaplazasPrepublicadas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set("idDre", data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set("idUgel", data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                data.codigoCentroTrabajo
            );
        }
        if (data.idResumenPlaza !== null) {
            queryParam = queryParam.set("idResumenPlaza", data.idResumenPlaza);
        }
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("plazas/prepublicadas").get(queryParam);
    };

    ExportaExcelPlazasPrepublicadas(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set("idDre", data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set("idUgel", data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                data.codigoCentroTrabajo
            );
        }
        return this.restangular
            .all("plazas/prepublicadas/exportar")
            .download(null, queryParam);
    }

    getListaPlazasContratacionObservadas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set("idDre", data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set("idUgel", data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                data.codigoCentroTrabajo
            );
        }
        if (data.idResumenPlaza !== null) {
            queryParam = queryParam.set("idResumenPlaza", data.idResumenPlaza);
        }
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular
            .all("plazascontratacion/observadas")
            .get(queryParam);
    };

    getPlazaById = (idPlaza) => {
        return this.restangular.one("plazas", idPlaza).get();
    };

    convocarPlazas(data: any): Observable<any> {
        return this.restangular.all("plazascontratacion/convocar").post(data);
    }

    observarPlazas(data: any): Observable<any> {
        return this.restangular.all("plazascontratacion/observar").post(data);
    }

    getComboMotivoNoPublicacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("motivosnopublicacion").get();
    };

    getComboTipoSustento = (
        codigoTipoOperacion: any = null,
        activo: any = null
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoTipoOperacion !== null) {
            queryParam = queryParam.set(
                "codigoTipoOperacion",
                codigoTipoOperacion
            );
        }
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposdocumentosustento").get(queryParam);
    };

    getComboTipoFormato = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposformato").get();
    };

    buscarPlazasPaginado = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        console.log("data recibida para servicio del modal", data);
        const filtroPaginado = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize),
        };

        console.log("valor booleano incorporacion",data.esIncorporacion);
        if (data.esIncorporacion){
            return this.restangular.all("plazas/buscarincorporar").post(filtroPaginado);
        }else{
            return this.restangular.all("plazas/buscar").post(filtroPaginado);
        }
    };
    buscarPlazasPostulantePaginado = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        const filtroPaginado = {
            ...data,
            paginaActual: parseInt(pageIndex),
            tamanioPagina: parseInt(pageSize),
        };

            return this.restangular.all("plazas/buscarPostulante").post(filtroPaginado);
    };

    getComboOrigenesRegistro = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("origenesregistro").get(queryParam);
    };

    getComboEstadosPostulacion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("estadospostulacion").get(queryParam);
    };

    getComboTipoVia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposvia").get(queryParam);
    };

    getComboTipoZona = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposzona").get(queryParam);
    };

    getComboDepartamento = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("departamentos").get(queryParam);
    };

    getComboProvincia = (
        idDepartamento: any,
        activo: any = null
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idDepartamento !== null) {
            queryParam = queryParam.set("idDepartamento", idDepartamento);
        }
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("provincias").get(queryParam);
    };

    getComboDistrito = (
        idDepartamento: any,
        idProvincia: any,
        activo: any = null
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idDepartamento !== null) {
            queryParam = queryParam.set("idDepartamento", idDepartamento);
        }
        if (idProvincia !== null) {
            queryParam = queryParam.set("idProvincia", idProvincia);
        }
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("distritos").get(queryParam);
    };

    getListaPostulacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
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
        if (data.idOrigenRegistro !== null) {
            queryParam = queryParam.set(
                "idOrigenRegistro",
                data.idOrigenRegistro
            );
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.idEstadoPostulacion !== null) {
            queryParam = queryParam.set(
                "idEstadoPostulacion",
                data.idEstadoPostulacion
            );
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("postulaciones").get(queryParam);
    };

    crearPostulacion(data: any): Observable<any> {
        return this.restangular.all("postulaciones").post(data);
    }

    modificarPostulacion = (postulacion: any): Observable<any> => {
        return this.restangular.all("postulaciones").put(postulacion);
    };

    getConsolidadoPlaza = (data: any) => {
        return this.restangular.all("consolidadosplaza/" + data.idProceso + "/" + data.idEtapa + "/" + data.idDre + "/" + data.idUgel).get();
    };

    getComboCargo = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("cargos").get(queryParam);
    };

    getComboModalidadEducativa = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("modalidadeseducativa").get(queryParam);
    };

    getComboAreacurricular = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("areascurricular").get(queryParam);
    };

    getComboNivelEducativa = (idModalidadEducativa: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idModalidadEducativa !== null) {
            queryParam = queryParam.set(
                "idModalidadEducativa",
                idModalidadEducativa
            );
        }
        return this.restangular
            .one("niveleseducativo", idModalidadEducativa)
            .get();
    };

    getAllComboNivelEducativa = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("niveleseducativo").get(queryParam);
    };
    getComboCentroEstudio = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("centrosestudio").get(queryParam);
    };

    getComboGradoEstudio = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("gradosestudio").get(queryParam);
    };

    getListaServidorPublico = (data: any, pageIndex, pageSize): Observable<any> => {
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

    getComboTipoCapacitacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposcapacitacion").get(queryParam);
    };

    getComboNivelExperiencia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular
            .all("nivelesexperiencialaboral")
            .get(queryParam);
    };

    getComboTipoExperiencia = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposexperiencialaboral").get(queryParam);
    };

    getComboTipoEntidad = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("tiposentidad").get(queryParam);
    };

    getComboColegioProfesional = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("colegiosprofesional").get(queryParam);
    };

    getComboEstudioCompleto = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("estudioscompleto").get(queryParam);
    };

    exportarExcelPostulacion(data: any, pageIndex, pageSize): Observable<any> {
        let queryParam = new HttpParams();

        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set("numeroDocumentoIdentidad", data.numeroDocumentoIdentidad);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set("idTipoDocumentoIdentidad", data.idTipoDocumentoIdentidad);
        }
        if (data.idOrigenRegistro !== null) {
            queryParam = queryParam.set("idOrigenRegistro", data.idOrigenRegistro);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.idEstadoPostulacion !== null) {
            queryParam = queryParam.set("idEstadoPostulacion", data.idEstadoPostulacion);
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);

        return this.restangular.all("postulaciones/exportar").download(null, queryParam);
    }

    getPostulacionById = (idPostulacion) => {
        return this.restangular.one("postulaciones", idPostulacion).get();
    };

    deletePostulacion = (idPostulacion: any): Observable<any> => {
        return this.restangular.one("postulaciones", idPostulacion).patch({ idPostulacion: idPostulacion });
    };

    getComboEstadosCalificacion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("estadoscalificacion").get(queryParam);
    };

    getCentroTrabajoByCodigo = (codigoCentroTrabajo: any, activo: any) => {
        let queryParam = new HttpParams();
        if (codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                codigoCentroTrabajo
            );
        }
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("centrostrabajo/buscarporcodigo").get(queryParam);
    };

    getListaplazasResultadoFinal = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set("idDre", data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set("idUgel", data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                data.codigoCentroTrabajo
            );
        }
        if (data.idResumenPlaza !== null) {
            queryParam = queryParam.set("idResumenPlaza", data.idResumenPlaza);
        }
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular
            .all("plazascontratacion/resultadofinal")
            .get(queryParam);
    };

    ExportaExcelPlazasResultadoFinal(data: any, pageIndex, pageSize): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set("idDre", data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set("idUgel", data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                data.codigoCentroTrabajo
            );
        }
        return this.restangular.all("plazascontratacion/resultadofinal/exportar").download(null, queryParam);
    }

    enviarConsolidadoPlazas(data: any): Observable<any> {
        return this.restangular.all("consolidadosplaza/enviarconsolidado").post(data);
    }

    publicarPlazas(data: any): Observable<any> {
        return this.restangular.all("consolidadosplaza/publicarconsolidadoplazas").post(data);
    }

    getResumenPlazas = (data: any) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idDre !== null) {
            queryParam = queryParam.set("idDre", data.idDre);
        }
        if (data.idUgel !== null) {
            queryParam = queryParam.set("idUgel", data.idUgel);
        }
        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set(
                "codigoCentroTrabajo",
                data.codigoCentroTrabajo
            );
        }
        return this.restangular
            .all("plazascontratacion/resumen")
            .get(queryParam);
    };

    getListaCalificacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
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
        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.idEstadoCalificacion !== null) {
            queryParam = queryParam.set(
                "idEstadoCalificacion",
                data.idEstadoCalificacion
            );
        }
        if (data.idGrupoInscripcion !== null) {
            queryParam = queryParam.set(
                "idGrupoInscripcion",
                data.idGrupoInscripcion
            );
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("calificaciones").get(queryParam);
    };

    getComboGrupoInscripcion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("desarrollos/contratacion/resultadospun/calificaciones/gruposinscripcion").get(queryParam);
    };
    getComboModalidadEducativaList = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("desarrollos/contratacion/evaluacionexpedientes/calificaciones/combomodalidadeducativa").get(queryParam);
    };
    getComboNivelEducativo = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("desarrollos/contratacion/evaluacionexpedientes/calificaciones/comboniveleducativo").get(queryParam);
    };

    getCalificacion = (idCalificacion) => {
        return this.restangular.all("calificaciones/" + idCalificacion).get();
    };

    eliminarMasivo(data: any): Observable<any> {
        let url = "calificaciones/" + data.idProceso + "/" + data.idEtapa + "/eliminarmasivo";
        return this.restangular.all(url).patch(data);
    }

    getComboEstadosAdjudicacion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("estadosadjudicacion").get(queryParam);
    };

    getComboGruposInscripcion = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("gruposinscripcion").get(queryParam);
    };

    getListaAdjudicacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set("idTipoDocumentoIdentidad", data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set("numeroDocumentoIdentidad", data.numeroDocumentoIdentidad);
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }

        if (data.idModalidadEducativa !== null) {
            queryParam = queryParam.set("idModalidadEducativa", data.idModalidadEducativa);
        }

        if (data.idNivelEducativo !== null) {
            queryParam = queryParam.set("idNivelEducativo", data.idNivelEducativo);
        }

        if (data.idAreaCurricular !== null) {
            queryParam = queryParam.set("idAreaCurricular", data.idAreaCurricular);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.idEstadoAdjudicacion !== null) {
            queryParam = queryParam.set("idEstadoAdjudicacion", data.idEstadoAdjudicacion);
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("adjudicaciones").get(queryParam);
    };

    crearCalificacion = (calificacion: any): Observable<any> => {
        return this.restangular.all("calificaciones").post(calificacion);
    };

    modificarCalificacion = (calificacion: any): Observable<any> => {
        return this.restangular.all("calificaciones").put(calificacion);
    };

    exportarExcelCalificacion(data: any, pageIndex, pageSize): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set("idTipoDocumentoIdentidad", data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set("numeroDocumentoIdentidad", data.numeroDocumentoIdentidad);
        }
        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.idEstadoCalificacion !== null) {
            queryParam = queryParam.set("idEstadoCalificacion", data.idEstadoCalificacion);
        }
        if (data.idGrupoInscripcion !== null) {
            queryParam = queryParam.set("idGrupoInscripcion", data.idGrupoInscripcion);
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("calificaciones/exportar").download(null, queryParam);
    }

    getListaPlazaAdjudicacion = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }

        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }
        if (data.descripcionCentroTrabajo !== null) {
            queryParam = queryParam.set("descripcionCentroTrabajo", data.descripcionCentroTrabajo);
        }
        if (data.codigoCentroTrabajo !== null) {
            queryParam = queryParam.set("codigoCentroTrabajo", data.codigoCentroTrabajo);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set("idRegimenLaboral", data.idRegimenLaboral);
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("plazas/adjudicacion").get(queryParam);
    };

    adjudicarPlaza(data: any): Observable<any> {
        return this.restangular.all("calificaciones/" + data.idCalificacion + "/adjudicarplaza").post(data);
    }

    noAdjudicarPlaza(data: any): Observable<any> {
        return this.restangular.all("calificaciones/" + data.idCalificacion + "/noadjudicarplaza").post(data);
    }

    getMotivoNoAdjudicacion = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }
        return this.restangular.all("motivosnoadjudicacion").get();
    };

    exportarExcelAdjudicacion(data: any, pageIndex, pageSize): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set("idTipoDocumentoIdentidad", data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set("numeroDocumentoIdentidad", data.numeroDocumentoIdentidad);
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }

        if (data.idModalidadEducativa !== null) {
            queryParam = queryParam.set("idModalidadEducativa", data.idModalidadEducativa);
        }

        if (data.idNivelEducativo !== null) {
            queryParam = queryParam.set("idNivelEducativo", data.idNivelEducativo);
        }

        if (data.idAreaCurricular !== null) {
            queryParam = queryParam.set("idAreaCurricular", data.idAreaCurricular);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.idEstadoAdjudicacion !== null) {
            queryParam = queryParam.set("idEstadoAdjudicacion", data.idEstadoAdjudicacion);
        }

        return this.restangular.all("adjudicaciones/exportar").download(null, queryParam);
    }

    registrarReclamoCalificacion(data: any): Observable<any> {
        return this.restangular.all("calificaciones/" + data.idCalificacion + "/registrarreclamo").post(data);
    }

    calificarAutomatica(data: any): Observable<any> {
        return this.restangular.all("calificaciones/calificacionautomatica").post(data);
    }

    publicarCalificacion(data: any): Observable<any> {
        return this.restangular.all("calificaciones/publicacioncalificaciones").post(data);
    }

    finalizarEtapa(data: any): Observable<any> {
        return this.restangular.all("etapas/" + data.idEtapa + "/finalizaretapa").post(data);
    }

    publicarAdjudicaciones(data: any): Observable<any> {
        return this.restangular.all("adjudicaciones/publicaradjudicaciones").post(data);
    }

    getListaResumenAdjudicacion = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idProceso !== null) {
            queryParam = queryParam.set("idProceso", data.idProceso);
        }
        if (data.idEtapa !== null) {
            queryParam = queryParam.set("idEtapa", data.idEtapa);
        }
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set("idTipoDocumentoIdentidad", data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set("numeroDocumentoIdentidad", data.numeroDocumentoIdentidad);
        }

        if (data.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        }

        if (data.idModalidadEducativa !== null) {
            queryParam = queryParam.set("idModalidadEducativa", data.idModalidadEducativa);
        }

        if (data.idNivelEducativo !== null) {
            queryParam = queryParam.set("idNivelEducativo", data.idNivelEducativo);
        }

        if (data.idAreaCurricular !== null) {
            queryParam = queryParam.set("idAreaCurricular", data.idAreaCurricular);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubInstancia !== null) {
            queryParam = queryParam.set("idSubInstancia", data.idSubInstancia);
        }
        if (data.idEstadoAdjudicacion !== null) {
            queryParam = queryParam.set("idEstadoAdjudicacion", data.idEstadoAdjudicacion);
        }

        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this.restangular.all("adjudicaciones/resumen").get(queryParam);
    };

    getAdjudicacionCustom = (idAdjudicacion) => {
        return this.restangular.all("adjudicaciones/" + idAdjudicacion).get();
    };

    /* DESARROLLO DE PROCESO DE CONTRATACIÓN ÚNICA-PUBLICACIÓN-CONTRATACIÓN_DIRECTA-RESULTADOS_PUN-EVALUACIÓN_EXPEDIENTES */

    obtenerCabeceraEtapaProcesoById = (idEtapa: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/procesos/etapas/cabecera/" + idEtapa;
        return this._http.get<any>(url);
    };
    
    obtenerCabeceraEstadoDesarrolloEtapaProceso = (idEtapaProceso: any, codigoCentroTrabajoMaestro:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codigoCentroTrabajoMaestro); 

        let url = this.basePath.contratacionesApi + "/desarrollos/procesos/etapas/cabecera/estadodesarrollo";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerFechaDeCortePrepublicacion = (idEtapaProceso: any, codigoCentroTrabajoMaestro:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codigoCentroTrabajoMaestro); 

        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/fechadecorte";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerFechaDeCortePublicacion = (idEtapaProceso: any, codigoCentroTrabajoMaestro:any, codigoMaestroActividad:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codigoCentroTrabajoMaestro); 
        if (codigoMaestroActividad !== null) queryParam = queryParam.append("codigoMaestroActividad", codigoMaestroActividad); 

        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/fechadecorte";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboAnio = (): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/procesos/anios";
        return this._http.get<any>(url);
    };

    getComboTipoProceso = (): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/procesos/tipos";
        return this._http.get<any>(url);
    };

    getComboTipoProcesoPorRolSede = (data:any): Observable<any> => {
        
        let queryParam = new HttpParams();
        if (data.idRegimenLaboral !== null && data.idRegimenLaboral > 0) queryParam = queryParam.append("idRegimenLaboral", data.idRegimenLaboral);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol );
        if (data.tipoSede !== null) queryParam = queryParam.append("tipoSede", data.tipoSede);


        let url = this.basePath.contratacionesApi + "/procesos/tiposPorRolSedeRegimen";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboEstadoDesarrolloEtapaProceso = (): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/procesos/etapas/estados";
        return this._http.get<any>(url);
    };

    getTipoCentroTrabajo = (idNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.contratacionesApi + "/centrostrabajo/tipos";
        return this._http.get<any>(url, { params: queryParam });
    };

    buscarCentrosTrabajoPaginado = (data: any, pageIndex, pageSize) => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/centrostrabajo/buscar"; 
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getComboEstadoProceso = (): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/procesos/etapas/estados";
        return this._http.get<any>(url);
    };

    getComboInstancia = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.contratacionesApi + "/instancias";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboSubinstancia = (idInstancia: any, activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) queryParam = queryParam.append("activo", activo);
        if (idInstancia !== null) queryParam = queryParam.append("idInstancia", idInstancia);

        let url = this.basePath.contratacionesApi + "/instancias/subinstancias";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboRegimenLaboral = (): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/regimeneslaborales";
        return this._http.get<any>(url);
    };

    getComboRegimenLaboralPorRol = (codigoRol:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoRol !== null) queryParam = queryParam.append("codigoRol", codigoRol);
        
        let url = this.basePath.contratacionesApi + "/regimeneslaborales/rol";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboEstadosConsolidadoPlaza = (codigo: number): Observable<any> => {        
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/catalogoitem/" + codigo;
        return this._http.get<any>(url);
    };

    getDefaultValueComboInstanciasByCodSede = (codSede: any): Observable<any> => {
        let queryParam = new HttpParams();
        
        let url = this.basePath.contratacionesApi + "/instancias/instaciaDetallePorCodigoSede";
        if (codSede !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codSede);

        return this._http.get<any>(url, { params: queryParam });
    };

    buscarPlazasContratacionPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    exportarExcelPrePublicacionPlazas = (request: IPlazasContratacion): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/exportar";        
        return this._http.post<any>(`${url}`, request,{
	    responseType:'blob' as 'json'
	});
    };

    eliminarPlazaIncorporada = (detallesPlaza:any): Observable<any> => {
        let queryParam = new HttpParams();
        console.log("datos detallesPlaza: ", detallesPlaza);
        if (detallesPlaza.idPlazaContratacionDetalleIncorporada !== null) queryParam = queryParam.append("idPlazaContratacionDetalleIncorporada", detallesPlaza.idPlazaContratacionDetalleIncorporada);
        if (detallesPlaza.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", detallesPlaza.codigoCentroTrabajoMaestro);
        if (detallesPlaza.codigoRolPassport !== null) queryParam = queryParam.append("codigoRolPassport", detallesPlaza.codigoRolPassport);
        if (detallesPlaza.usuarioModificacion !== null) queryParam = queryParam.append("usuarioModificacion", detallesPlaza.usuarioModificacion);
        console.log("queryes parametros: ", queryParam);
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/retirarplazaincorporada";
        //return this._http.post<any>(url, { params: queryParam });
        return this._http.post<any>(url, detallesPlaza);

    };

    actualizarPlazaContratacionSiEsBecario = (request: IActualizarPlazaContratacionSiEsBecarioViewModel): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/esbecario";        
        return this._http.put<any>(`${url}`, request);
    };

    actualizarEstadoEtapaProceso = (request: IActualizarEtapaProcesoViewModel): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/procesos/etapas/etapaproceso";
        return this._http.put<any>(`${url}`, request);
    }

    registrarPlazaContratacionSiguienteEtapaPublicacion = (request: IActualizarEtapaProcesoViewModel): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/registrarplazas";
        return this._http.post<any>(`${url}`, request);
    }

    registrarPlazaContratacionSiguienteEtapaDirectaResultadosPUN = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/registrarplazas";
        return this._http.post<any>(`${url}`, request);
    }

    buscarPlazasContratacionPrepublicacionPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/buscar";
        //return this._http.get<any>(`${url}`, filtroPaginado);
        
        let queryParam = new HttpParams();
        if (filtroPaginado.idPlaza !== null) queryParam = queryParam.append("idPlaza", filtroPaginado.idPlaza);
        if (filtroPaginado.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", filtroPaginado.codigoPlaza);
        if (filtroPaginado.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", filtroPaginado.idCentroTrabajo);
        if (filtroPaginado.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", filtroPaginado.codigoCentroTrabajo);
        if (filtroPaginado.esBecario !== null) queryParam = queryParam.append("esBecario", filtroPaginado.esBecario);
        if (filtroPaginado.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", filtroPaginado.idEtapaProceso);
        if (filtroPaginado.idSituacionValidacion !== null) queryParam = queryParam.append("idSituacionValidacion", filtroPaginado.idSituacionValidacion);
        if (filtroPaginado.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", filtroPaginado.codigoCentroTrabajoMaestro);
        if (filtroPaginado.anio !== null) queryParam = queryParam.append("anio", filtroPaginado.anio);
        
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        return this._http.get<any>(url, { params: queryParam });
    };

    actualizarPlazaSituacionValidacion = (request: IActualizarPlazaPublicacionSituacionValidacionViewModel): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/finalizarvalidacion";
        return this._http.put<any>(`${url}`, request);
    };

    actualizarPlazaContratacionEstadoValidacion = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/actualizarestado";
        return this._http.put<any>(`${url}`, request);
    };

    actualizarEstadoDocumento = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/actualizar/estado";
        return this._http.put<any>(`${url}`, request);
    };

    exportarExcelValidacionPublicacionPlazas = (request: IPlazasContratacionValidacion): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/exportar";        
        return this._http.post<any>(`${url}`, request);
    };

    getValidacionPublicacionPlazaById = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/plaza";
        return this._http.post<any>(`${url}`, request);
    };

    getCombosModalPlazasObservadas = (codigo: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/catalogoitem/" + codigo;
        return this._http.get<any>(url);
    };

    registrarSustentoNoPublicacion = (request: ISustentoMotivosObservacionViewModel): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/sustento";        
        return this._http.post<any>(`${url}`, request);
    };

    actualizarIdDocumentoSustento = (request: IActualizarIdDocumentoSustentoViewModel): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/actualizarsustento";        
        return this._http.put<any>(`${url}`, request);
    }

    getDocumentoSustentoById = (idPlazaContratacion: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/documentosustento/" + idPlazaContratacion;
        return this._http.get<any>(url);
    };

    postBuscarPlazasPublicadasPaginadoDirecta = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/buscarincorporar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    postBuscarPlazaContratacionDirecta = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/plaza";        
        return this._http.post<any>(`${url}`, request);
    };

    getBuscarPlazasDirectaPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idPlaza !== null) queryParam = queryParam.append("idPlaza", data.idPlaza);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.idResultadoFinal !== null) queryParam = queryParam.append("idResultadoFinal", data.idResultadoFinal);
        if (data.idSituacionValidacion !== null) queryParam = queryParam.append("idSituacionValidacion", data.idSituacionValidacion);
        if (data.idRegimenLaboral !== null) queryParam = queryParam.append("idRegimenLaboral", data.idRegimenLaboral);

        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/buscar"; 
        return this._http.get<any>(url, { params: queryParam });
    };

    exportarExcelContratacionDirectaPlazas = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/exportar";        
        return this._http.post<any>(`${url}`, data);
    };

    exportarExcelPlazasIncorporar = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/exportarplazas";        
        return this._http.post<any>(`${url}`, data);
    };

    registrarPlazasIncorporarContratacionDirecta = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/registrarincorporar";        
        return this._http.post<any>(`${url}`, request);
    };
    validarPlazaReglaJob = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/validarplazareglajob";        
        return this._http.post<any>(`${url}`, request);
    };

    generarPdfPlazasPrePublicadas = (request: IGenerarPdfPlazasPrePublicadas): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/generarpdf";        
        return this._http.post<any>(`${url}`, request);
    };

    prepublicarPlazasEtapaPrePublicacion = (request: IGenerarPdfPlazasPrePublicadas): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/prepublicarplazas";        
        return this._http.post<any>(`${url}`, request);
    };

    eliminarPlazasContratacionDirecta = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/actualizarplaza";        
        return this._http.put<any>(`${url}`, request);
    };

    publicarPlazasContratacionDirecta = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/publicarplazas";        
        return this._http.put<any>(`${url}`, request);
    };

    getComboTipoDocumentos = (codigo: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/catalogoitem/" + codigo;
        return this._http.get<any>(url);
    };

    buscarServidorPublicoPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/servidorpublico/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getPostulanteByNumeroDocumento = (idTipoDocumento: any, numeroDocumento: any, usuarioModificacion: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", idTipoDocumento);
        if (numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", numeroDocumento);
        if (numeroDocumento !== null) queryParam = queryParam.append("usuarioModificacion", usuarioModificacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/servidorpublico";
        return this._http.get<any>(url, { params: queryParam });
    };

    postBuscarPlazasPublicadasPaginadoPUN = (data: any, pageIndex, pageSize): Observable<any> => { 
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/buscarincorporar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    exportarExcelContratacionResultadosPUN = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/exportar";        
        return this._http.post<any>(`${url}`, data);
    };

    publicarPlazasContratacionResultadosPUN = (request: IPublicarPlazasContratacionResultadosPUNViewModel): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/publicarplazas";        
        return this._http.put<any>(`${url}`, request);
    };

    getPostulanteRegistradoByNumeroDocumento = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/existepostulanteregistrado";
        return this._http.get<any>(url, { params: queryParam });
    };

    getVinculacionPostulanteByNumeroDocumento = (numeroDocumento: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (numeroDocumento !== null) queryParam = queryParam.append("numeroDocumentoIdentidad", numeroDocumento);

        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/servidorpublico/vinculacion";
        return this._http.get<any>(url, { params: queryParam });
    };

    getVinculacionPostulanteByNumeroDocumentoApiRest = (numeroDocumento: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (numeroDocumento !== null) queryParam = queryParam.append("numeroDocumentoIdentidad", numeroDocumento);

        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/servidorpublico/vinculacion";
        return this._http.get<any>(url, { params: queryParam });
    };

    getPaisNacionalidad = (activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/pais";
        return this._http.get<any>(url, { params: queryParam });
    };

    getContratacionDirectaPlazaByCodigo = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/buscarplaza";
        return this._http.post<any>(`${url}`, request);
    };

    buscarPostulantesPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    registrarContratacionDirectaPostulante = (request: IPostulanteContratacionDirecta): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes";
        return this._http.post<any>(`${url}`, request);
    };

    eliminarContratacionDirectaPostulante = (request: IEliminarPostulanteContratacionDirecta): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/eliminar";
        return this._http.put<any>(`${url}`, request);
    };

    aprobarContratacionDirectaPostulantes = (request: IAprobarPostulanteContratacionDirecta): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/aprobar";
        return this._http.put<any>(`${url}`, request);
    };

    exportarPostulantes = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/exportar";        
        return this._http.post<any>(`${url}`, request);
    };

    actualizarContratacionDirectaPostulante = (request: IModificarPostulanteContratacionDirecta): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/editar";
        return this._http.put<any>(`${url}`, request);
    };

    buscarPostulantesCalificacionPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/calificaciones/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getCombosEstadosPUN = (codigo: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/catalogoitem/" + codigo;
        return this._http.get<any>(url);
    };

    getCombosEstadosEtapaEvaluacion = (codigo: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/catalogoitem/" + codigo;
        return this._http.get<any>(url);
    };

    getBuscarDocumentoPublicado = (data: any, pageIndex, pageSize): Observable<any> => {
        /*
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/buscar";        
        return this._http.get<any>(`${url}`, filtroPaginado);
        */
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("idGrupoDocumento", data.idGrupoDocumento);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);


        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/buscar";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarDocumentoPublicadoDetallePaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        /*
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/buscar";        
        return this._http.get<any>(`${url}`, filtroPaginado);
        */
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("codigoGrupoDocumento", data.idGrupoDocumento);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);


        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/detalle/paginado";
        return this._http.get<any>(url, { params: queryParam });
    };
    getBuscarDocumentoPublicadoDetallePaginadoPorDre = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("codigoGrupoDocumento", data.idGrupoDocumento);
        if (data.codigoDre!== null) queryParam = queryParam.append("codigoDre", data.codigoDre);


        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/detalle/paginadopordre";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarDocumentoPublicadoPorFecha = (data: any, pageIndex, pageSize): Observable<any> => {
        /*
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/buscar";        
        return this._http.get<any>(`${url}`, filtroPaginado);
        */
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("idGrupoDocumento", data.idGrupoDocumento);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/buscarPorFecha";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarDocumentoPublicadoPorDre = (data: any, pageIndex, pageSize): Observable<any> => {
        /*
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/buscar";        
        return this._http.get<any>(`${url}`, filtroPaginado);
        */
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoDocumento !== null) queryParam = queryParam.append("idGrupoDocumento", data.idGrupoDocumento);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        if (data.codigoDocumentoPublicacion !== null) queryParam = queryParam.append("codigoDocumentoPublicacion", data.codigoDocumentoPublicacion);
        if (data.idDocumentoPublicado !== null) queryParam = queryParam.append("idDocumentoPublicado", data.idDocumentoPublicado);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/documentopublicado/buscarpordre";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboEstadosResultadoFinal = (codigo: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/catalogoitem/" + codigo;
        return this._http.get<any>(url);
    };

    getImpedimentosPostulante = (anio: any, idEtapaProceso: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (anio !== null && anio > 0) queryParam = queryParam.append("anio", anio);
        if (idEtapaProceso !== null && idEtapaProceso > 0) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);

        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/maestroimpedimento/buscar";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarMeritoPUNPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoInscripcion !== null) queryParam = queryParam.append("idGrupoInscripcion", data.idGrupoInscripcion);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEstadoCalificacion !== null) queryParam = queryParam.append("idEstadoCalificacion", data.idEstadoCalificacion);
        if (data.idResultadoCalificacion !== null) queryParam = queryParam.append("idResultadoCalificacion", data.idResultadoCalificacion);

        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/buscar";
        return this._http.get<any>(url, { params: queryParam });
    };

    getNoExistePendiente = (data: any): Observable<any> => {
	const httpParams = new HttpParams({ fromObject: {...data} });
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/noexistependiente";
        return this._http.get<any>(url, { params: httpParams});
    };

    getVerificarEstadoCalificion= (data: any): Observable<any> => {
	const httpParams = new HttpParams({ fromObject: {...data} });
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/verificarestado";
        return this._http.get<any>(url, { params: httpParams});
    };

    getExisteCambio = (data: any): Observable<any> => {
	const httpParams = new HttpParams({ fromObject: {...data} });
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/existecambio";
        return this._http.get<any>(url, { params: httpParams});
    };

    getEstadoConsolidadoPlaza = (idConsolidado: any, idEtapaProceso: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", idEtapaProceso);
        if (idConsolidado !== null) queryParam = queryParam.append("idConsolidado", idConsolidado);

        let url = this.basePath.contratacionesApi + "/consolidadoplaza/detalle/informacionEstadoConsolidado";
        return this._http.get<any>(url,  { params: queryParam });
    };

    getListaConsolidadoPlaza = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getPremitirAprobar = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/permitiraprobar";        
        return this._http.post<any>(`${url}`, data);
    };
    getPremitirGenerarPDF = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/permitirgenerarpdf";        
        return this._http.post<any>(`${url}`, data);
    };

    getConsolidadoPlazaById = (idConsolidado: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/consolidado/" + idConsolidado;
        return this._http.get<any>(url);
    };

    getListaplazasContratacionConvocar = (data: any, pageIndex, pageSize) : Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/detalle/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    exportarConsolidadoPlaza(data: any): Observable<any> {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/exportar";        
        return this._http.post<any>(`${url}`, data);
    }

    ExportaExcelPlazasConvocadas = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/detalle/exportar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    }

    ExportaExcelPlazasObservadas(data: any, pageIndex, pageSize): Observable<any> {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/detalle/exportar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    }

    aprobarMasivoConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/masivo/aprobar";
        return this._http.put<any>(`${url}`, data);
    }

    generarPdfConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/generarpdf";
        return this._http.post<any>(`${url}`, data);
    }

    aprobarConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/detalle/aprobar";
        return this._http.put<any>(`${url}`, data);
    }

    rechazarConsolidadoPlazas(data: any): Observable<any> {
        let url = this.basePath.contratacionesApi + "/consolidadoplaza/detalle/rechazar";
        return this._http.put<any>(`${url}`, data);
    }

    getObtenerInformacionPostulante = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idPersona !== null) queryParam = queryParam.append("idPersona", data.idPersona);

        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/informacionpostulante";
        return this._http.get<any>(url, { params: queryParam });
    };

    putEliminarCargaMasivaCalificacion = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/eliminarcargamasiva";
        return this._http.put<any>(`${url}`, request);
    };

    getComboCatalogoItem = (codigo: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/catalogoitem/" + codigo;
        return this._http.get<any>(url);
    };

    getObtenerInformacionPostulacion = (id: number): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/informacion/" + id;
        return this._http.get<any>(url);
    };

    putObservarCalificacionPUN = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/observar";        
        return this._http.put<any>(`${url}`, request);
    };

    putReclamoPUN = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/reclamo";        
        return this._http.put<any>(`${url}`, request);
    };

    getObtenerCalificacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacion !== null) queryParam = queryParam.append("idCalificacion", data.idCalificacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/obtener";
        return this._http.get<any>(url, { params: queryParam });
    };

    getObtenerCalificacionRubro = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacionDetalle !== null) queryParam = queryParam.append("idCalificacionDetalle", data.idCalificacionDetalle);
        if (data.idMaestroProcesoCalificacion !== null) queryParam = queryParam.append("idMaestroProcesoCalificacion", data.idMaestroProcesoCalificacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/obtenerrubro";
        return this._http.get<any>(url, { params: queryParam });
    };

    getObtenerCalificacionRubroDetalle = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacionResultadoRubro !== null) queryParam = queryParam.append("idCalificacionResultadoRubro", data.idCalificacionResultadoRubro);
        if (data.idMaestroRubroCalificacion !== null) queryParam = queryParam.append("idMaestroRubroCalificacion", data.idMaestroRubroCalificacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/obtenerrubrodetalle";
        return this._http.get<any>(url, { params: queryParam });
    };

    postPublicarPreliminarCalificacion = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/publicarpreliminar";
        return this._http.put<any>(`${url}`, data);
    };

    postPublicarFinalCalificacion = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/publicarfinal";
        return this._http.put<any>(`${url}`, data);
    };

    postOrdenMeritoCalificacion = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/generarorden";
        return this._http.put<any>(`${url}`, data);
    };

    postGuardarCalificacion = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/guardar";
        return this._http.post<any>(`${url}`, data);
    };

    getBuscarAdjudicacionPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEstadoAdjudicacion !== null) queryParam = queryParam.append("idEstadoAdjudicacion", data.idEstadoAdjudicacion);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);
        
        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/buscar";
        return this._http.get<any>(url, { params: queryParam });
    };

    getExportarExcelContratacionResultadosPUNCalificaciones = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idResultadoCalificacion !== null) queryParam = queryParam.append("idResultadoCalificacion", data.idResultadoCalificacion);
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoInscripcion !== null) queryParam = queryParam.append("idGrupoInscripcion", data.idGrupoInscripcion);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEstadoCalificacion !== null) queryParam = queryParam.append("idEstadoCalificacion", data.idEstadoCalificacion);
        
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/exportar";
        return this._http.get<any>(url, { params: queryParam });
    }

    getExportarExcelContratacionResultadosEvalExpCalificaciones = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idResultadoCalificacion !== null) queryParam = queryParam.append("idResultadoCalificacion", data.idResultadoCalificacion);
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoInscripcion !== null) queryParam = queryParam.append("idGrupoInscripcion", data.idGrupoInscripcion);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEstadoCalificacion !== null) queryParam = queryParam.append("idEstadoCalificacion", data.idEstadoCalificacion);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);
        
        
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/calificaciones/exportar";
        return this._http.get<any>(url, { params: queryParam });
    }
    
    getBuscarContratacionDirectaAdjudicacionPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/contrataciondirecta/adjudicacion/buscar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getObtenerInformacionAdjudicacion = (data: any): Observable<any> => {
        const filtro = { ...data };
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/contrataciondirecta/adjudicacion/informacion";        
        return this._http.post<any>(`${url}`, filtro);
    };

    getObtenerInformacionAdjudicacionDesdePostulacion = (data: any): Observable<any> => {
        const filtro = { ...data };
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/contrataciondirecta/adjudicacion/informacionadjudicacionpostulacion";        
        return this._http.post<any>(`${url}`, filtro);
    };


    getVerificarExisteEstado = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/contrataciondirecta/adjudicacion/verificarExisteEstado";        
        return this._http.post<any>(`${url}`, data);
    };

    exportarExcelContratacionResultadosPUNCalificaciones = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/exportar";        
        return this._http.post<any>(`${url}`, request);
    };

    exportarExcelContratacionResultadosCalificaciones = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/calificaciones/exportar";        
        return this._http.post<any>(`${url}`, request);
    };

    exportarExcelContratacionDirectaAdjudicaciones = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/contrataciondirecta/adjudicacion/exportar";        
        return this._http.post<any>(`${url}`, request);
    };

    adjudicarPlazaContratacionDirectaAdjudicaciones = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/contrataciondirecta/adjudicacion/adjudicar";        
        return this._http.post<any>(`${url}`, request);
    };

    noAdjudicarPlazaContratacionDirectaAdjudicaciones = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/contrataciondirecta/adjudicacion/noadjudicar";        
        return this._http.post<any>(`${url}`, request); // cambio de post a put (post en back)
    };

    generarPdfContratacionResultadosCalificaciones = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/calificaciones/generarpdf";        
        return this._http.post<any>(`${url}`, request);
    };

    veficarCalificacionesPendientes = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/calificaciones/pendientes";        
        return this._http.post<any>(`${url}`, request);
    };

    veficarExisteReclamo = (request: any): Observable<any> => {
	const httpParams = new HttpParams({ fromObject: {...request} });
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/calificaciones/existereclamo";        
        return this._http.get<any>(`${url}`, { params:  httpParams  });
    };

    getGenerarPdfPlazasContratacionResultadosPUN = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.maestroProceso !== null) queryParam = queryParam.append("maestroProceso", data.maestroProceso);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        if (data.subInstancia !== null) queryParam = queryParam.append("subInstancia", data.subInstancia);
        if (data.usuarioCreacion !== null) queryParam = queryParam.append("usuarioCreacion", data.usuarioCreacion);
        if (data.fechapublicacion !== null) queryParam = queryParam.append("fechapublicacion", data.fechapublicacion);
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/generarpdf";
        return this._http.get<any>(url, { params: queryParam });
    };

    getGenerarPdfCuadroMeritoResultadosPUN = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.maestroProceso !== null) queryParam = queryParam.append("maestroProceso", data.maestroProceso);
        if (data.idResultadoCalificacion !== null) queryParam = queryParam.append("idResultadoCalificacion", data.idResultadoCalificacion);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        if (data.subInstancia !== null) queryParam = queryParam.append("subInstancia", data.subInstancia);
        if (data.usuarioCreacion !== null) queryParam = queryParam.append("usuarioCreacion", data.usuarioCreacion);
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/calificaciones/generarpdf";
        return this._http.get<any>(url, { params: queryParam });
    };

    putNoAdjudicar = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/noadjudicar";        
        return this._http.put<any>(`${url}`, request);
    };

    putSubsanarObservacion = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/subsanarobservacion";        
        return this._http.put<any>(`${url}`, request);
    };

    getObtenerAdjudicacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAdjudicacion !== null) queryParam = queryParam.append("idAdjudicacion", data.idAdjudicacion);
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/obtener";
        return this._http.get<any>(url, { params: queryParam });
    };

    getEstadoAdjudicacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/estadosubsanacion";
        return this._http.get<any>(url, { params: queryParam });
    };

    getExportarExcelAdjudicacionPUN = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEstadoAdjudicacion !== null) queryParam = queryParam.append("idEstadoAdjudicacion", data.idEstadoAdjudicacion);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/exportar";
        return this._http.get<any>(url, { params: queryParam });
    };

    getExportarExcelAdjudicacionEvaluacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEstadoAdjudicacion !== null) queryParam = queryParam.append("idEstadoAdjudicacion", data.idEstadoAdjudicacion);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/adjudicaciones/exportar";
        return this._http.get<any>(url, { params: queryParam });
    };


    postFinalizarAdjudicacion = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/finalizaradjudicacion";
        return this._http.put<any>(`${url}`, data);
    };

    postFinalizarEtapa = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/finalizaretapa";
        return this._http.put<any>(`${url}`, data);
    };

    getVerificarcondicionesFinalizarEtapaEvaluacion(data: any){
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/verificarcondicionesfinalizaretapa"; 
        return this._http.get<any>(url, { params: queryParam });
    }

    getBuscarPlazasPUNPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        /*
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/buscar";        
        return this._http.get<any>(`${url}`, filtroPaginado);
        */
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idSituacionValidacion !== null) queryParam = queryParam.append("idSituacionValidacion", data.idSituacionValidacion);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.idResultadoFinal !== null) queryParam = queryParam.append("idResultadoFinal", data.idResultadoFinal);
        if (data.esResultadoFinal !== null) queryParam = queryParam.append("esResultadoFinal", data.esResultadoFinal);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/buscar"; 
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarPlazasDisponiblePUN = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idAdjudicacion !== null) queryParam = queryParam.append("idAdjudicacion", data.idAdjudicacion);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/plazasdisponible";
        return this._http.get<any>(url, { params: queryParam });
    };

    putAdjudicarPlazaPUN = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/adjudicarplaza";        
        return this._http.put<any>(`${url}`, request);
    };

    postEliminarAdjudicacionPlazaPUN = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/eliminarplazaadjudicada";        
        return this._http.post<any>(`${url}`, request);
    };

    getBuscarPlazasAdjudicadaPUN = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAdjudicacion !== null) queryParam = queryParam.append("idAdjudicacion", data.idAdjudicacion);
        
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/plazasadjudicada";
        return this._http.get<any>(url, { params: queryParam });
    };

    getGenerarPdfActaAdjudicacionResultadosPUN = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAdjudicacionDetalle !== null) queryParam = queryParam.append("idAdjudicacionDetalle", data.idAdjudicacionDetalle);
        if (data.usuarioCreacion !== null) queryParam = queryParam.append("usuarioCreacion", data.usuarioCreacion);
        if (data.maestroProceso !== null) queryParam = queryParam.append("maestroProceso", data.maestroProceso);
        if (data.descripcionEtapa !== null) queryParam = queryParam.append("descripcionEtapa", data.descripcionEtapa);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.nombreSede !== null) queryParam = queryParam.append("nombreSede", data.nombreSede);
        if (data.descripcionTipoSede !== null) queryParam = queryParam.append("descripcionTipoSede", data.descripcionTipoSede);
        if (data.codigoCentroTrabajoMaestro != null) queryParam = queryParam.append("codigoCentroTrabajoMaestro",data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/generarpdfacta";
        return this._http.get<any>(url, { params: queryParam });
    };

    getGenerarPdfContratoAdjudicacionResultadosPUN = (data: any): Observable<any> => {
        // debugger;
        let queryParam = new HttpParams();
        if (data.idAdjudicacionDetalle !== null) queryParam = queryParam.append("idAdjudicacionDetalle", data.idAdjudicacionDetalle);
        if (data.usuarioCreacion !== null) queryParam = queryParam.append("usuarioCreacion", data.usuarioCreacion);
        if (data.maestroProceso !== null) queryParam = queryParam.append("maestroProceso", data.maestroProceso);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.nombreSede !== null) queryParam = queryParam.append("nombreSede", data.nombreSede);
        if (data.descripcionTipoSede !== null) queryParam = queryParam.append("descripcionTipoSede", data.descripcionTipoSede);
        if (data.descripcionEtapa !== null) queryParam = queryParam.append("descripcionEtapa", data.descripcionEtapa);
        if (data.codigoCentroTrabajoMaestro != null) queryParam = queryParam.append("codigoCentroTrabajoMaestro",data.codigoCentroTrabajoMaestro);


        // let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/generarpdfcontratoplaza";
        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/generarpdfcontratoplaza";


        return this._http.get<any>(url, { params: queryParam });
    };

    getGenerarPdfContratoAdjudicacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAdjudicacionDetalle !== null) queryParam = queryParam.append("idAdjudicacionDetalle", data.idAdjudicacionDetalle);
        if (data.usuarioCreacion !== null) queryParam = queryParam.append("usuarioCreacion", data.usuarioCreacion);
        if (data.maestroProceso !== null) queryParam = queryParam.append("maestroProceso", data.maestroProceso);
        if (data.descripcionEtapa !== null) queryParam = queryParam.append("descripcionEtapa", data.descripcionEtapa);

        let url = this.basePath.contratacionesApi + "/desarrollos/adjudicacion/generarpdfcontrato";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarActasAdjudicadasPaginado = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAdjudicacion !== null) queryParam = queryParam.append("idAdjudicacion", data.idAdjudicacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/actasadjudicadas";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarContratosAdjudicadasPaginado = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAdjudicacion !== null) queryParam = queryParam.append("idAdjudicacion", data.idAdjudicacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/adjudicacion/contratosadjudicadas";
        return this._http.get<any>(url, { params: queryParam });
    };

    getVerificarCargaMasiva = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);

        let url = this.basePath.contratacionesApi + "/desarrollos/calificacion/verificarcargamasiva";
        return this._http.get<any>(url, { params: queryParam });
    };

    putAperturarPlazaPUN = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/aperturarplaza";        
        return this._http.put<any>(`${url}`, request);
    };

    putActualizarEtapaProceso = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/procesos/etapas/etapaproceso";        
        return this._http.put<any>(`${url}`, request);
    };

    VerificarEtapaProcesoAnteriorFinalizado = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/procesos/etapas/VerificarEtapaProcesoAnterior";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getBuscarPlazasPaginadoEvalExp = (data: any, pageIndex, pageSize): Observable<any> => { 
        let queryParam = new HttpParams();
        //console.log("data - recibida para procesar servicio", data)
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.idSituacionValidacion !== null) queryParam = queryParam.append("idSituacionValidacion", data.idSituacionValidacion);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/buscar"; 
        return this._http.get<any>(url, { params: queryParam });
    };

    putEvalExpConvocar = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/convocar";        
        return this._http.put<any>(`${url}`, request);
    };

    putEvalExpObservar = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/observar";        
        return this._http.put<any>(`${url}`, request);
    };

    getExportarExcelContratacionEvalExp = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.idSituacionValidacion !== null) queryParam = queryParam.append("idSituacionValidacion", data.idSituacionValidacion);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/exportar";
        return this._http.get<any>(url, { params: queryParam });
    }

    postRegistrarSustentoNoPublicacionEvalExp = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/observar";        
        return this._http.put<any>(`${url}`, request);
    };

    getObtenerPlazaContratacionPorIdEtapaProceso = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/plazacontratacion/obtener";
        return this._http.get<any>(url, { params: queryParam });
    };

    getMotivoRechazoPlazaContratacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/consolidadoplaza/informacionMotivoRechazoPorEtapaProceso";
        return this._http.get<any>(url, { params: queryParam });
    };

    getDetalleEstadosYCantidadesConsolidado = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/consolidadoplaza/detalleEstadosYCantidadesCalculadas";
        return this._http.get<any>(url, { params: queryParam });
    };

    getObtenerAccesoUsuariosValidacionPlazas = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);

        let url = this.basePath.contratacionesApi + "/desarrollos/acceso/obtenerAccesoPorEtapaProcesoPlazas";
        return this._http.get<any>(url, { params: queryParam });
    };

    getObtenerAccesoUsuariosCalificaciones = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);
        if (data.codigoEtapa !== null) queryParam = queryParam.append("codigoEtapa", data.codigoEtapa);
        let url = this.basePath.contratacionesApi + "/desarrollos/acceso/obtenerAccesoPorEtapaProcesoCalificacion";
        return this._http.get<any>(url, { params: queryParam });
    };

    getObtenerAccesoUsuariosPostulacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codRol !== null) queryParam = queryParam.append("codRol", data.codRol);
        if (data.codTipoSede !== null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);

        let url = this.basePath.contratacionesApi + "/desarrollos/acceso/obtenerAccesoPorEtapaProcesoPostulacion";
        return this._http.get<any>(url, { params: queryParam });
    };

    getObtenerAccesoUsuariosAdjudicacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idTipoSede !== null) queryParam = queryParam.append("idTipoSede", data.idTipoSede);
        if (data.idRol !== null) queryParam = queryParam.append("idRol", data.idRol);

        let url = this.basePath.contratacionesApi + "/desarrollos/acceso/obtenerAccesoPorEtapaProcesoAdjudicacion";
        return this._http.get<any>(url, { params: queryParam });
    };

    obtenerCalificacionPorIdEtapaProceso = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/calificaciones/obtener";
        return this._http.post<any>(`${url}`, data);
    };

    putPublicarPlazasContratacionEvalExp = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/publicar";        
        return this._http.put<any>(`${url}`, data);
    };

    putAperturarPlazasContratacionEvalExp = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/aperturar";        
        return this._http.put<any>(`${url}`, data);
    };

    getVerificarAperturarPlazasPrepublicacion= (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/verificaraperturarprepublicacion";        
        return this._http.get<any>(`${url}?idEtapaProceso=${data.idEtapaProceso}`, data);
    };

    getVerificarEjecucionJobPlazas= (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data !== null) queryParam = queryParam.append("idEtapaProceso", data);

        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/verificarejecucionjobplazas";        
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    putAperturarPlazasPrepublicacion= (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/prepublicaciones/aperturar";        
        return this._http.put<any>(`${url}`, data);
    };

    putAperturarPlazasValidacion= (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/validacionespublicaciones/aperturar";        
        return this._http.put<any>(`${url}`, data);
    };

    getVerificarExistePostulantes = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + `/desarrollos/validacionespublicaciones/existepostulante/${data.idEtapaProceso}/${data.codigoCentroTrabajo}`;        
        return this._http.get<any>(`${url}`);
    };

    getVerificarEstadoIniciadoEtapa= (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + `/desarrollos/procesos/etapa/iniciado/`;        
        let queryParam = new HttpParams();
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        if (data.codigoEtapa !== null) queryParam = queryParam.append("codigoEtapa", data.codigoEtapa);
        return this._http.get<any>(url, { params: queryParam });
    };

    getVerificarEstadoFinalizadoEtapa = (data: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + `/desarrollos/procesos/etapa/finalizado/`;        
        let queryParam = new HttpParams();
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.anio !== null) queryParam = queryParam.append("anio", data.anio);
        if (data.codigoEtapa !== null) queryParam = queryParam.append("codigoEtapa", data.codigoEtapa);
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarPostulantesPaginadoEvalExp = (data: any, pageIndex, pageSize): Observable<any> => { 
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.numeroExpediente !== null) queryParam = queryParam.append("numeroExpediente", data.numeroExpediente);
        if (data.idEstado !== null) queryParam = queryParam.append("idEstado", data.idEstado);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/postulantes/buscar"; 
        return this._http.get<any>(url, { params: queryParam });
    };

    getExportarExcelPostulacionEvalExp = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.numeroExpediente !== null) queryParam = queryParam.append("numeroExpediente", data.numeroExpediente);
        if (data.idEstado !== null) queryParam = queryParam.append("idEstado", data.idEstado);
        
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/postulantes/exportar";
        return this._http.get<any>(url, { params: queryParam });
    }

    postGuardarContratacionEvalExpPostulante = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/postulantes/registrarpostulante";
        return this._http.post<any>(`${url}`, request);
    };

    registrarPlazasIncorporarContratacionResultdoPUN = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/resultadospun/plazas/registrarincorporar";        
        return this._http.post<any>(`${url}`, request);
    };

    postBuscarPlazasPublicadasPaginadoEvalExp = (data: any, pageIndex, pageSize): Observable<any> => { 
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/buscarincorporar";        
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    registrarPlazasIncorporarContratacionEvalExp = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/plazas/registrarincorporar";        
        return this._http.post<any>(`${url}`, request);
    };

    postEliminarContratacionEvalExpPostulante = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/postulantes/eliminar";
        return this._http.put<any>(`${url}`, request);
    };

    postAprobarContratacionEvalExpPostulante = (request: any): Observable<any> => {
        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/postulantes/aprobar";
        return this._http.put<any>(`${url}`, request);
    };

    getBuscarMeritoEvalExpPaginado = (data: any, pageIndex, pageSize): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.idGrupoInscripcion !== null) queryParam = queryParam.append("idGrupoInscripcion", data.idGrupoInscripcion);
        if (data.idTipoDocumento !== null) queryParam = queryParam.append("idTipoDocumento", data.idTipoDocumento);
        if (data.numeroDocumento !== null) queryParam = queryParam.append("numeroDocumento", data.numeroDocumento);
        if (data.idEstadoCalificacion !== null) queryParam = queryParam.append("idEstadoCalificacion", data.idEstadoCalificacion);
        if (data.idResultadoCalificacion !== null) queryParam = queryParam.append("idResultadoCalificacion", data.idResultadoCalificacion);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        if (data.idModalidadEducativa !== null) queryParam = queryParam.append("idModalidadEducativa", data.idModalidadEducativa);
        if (data.idNivelEducativo !== null) queryParam = queryParam.append("idNivelEducativo", data.idNivelEducativo);


        queryParam = queryParam.append("paginaActual", pageIndex);
        queryParam = queryParam.append("tamanioPagina", pageSize);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/calificaciones/buscar";
        return this._http.get<any>(url, { params: queryParam });
    };

    getBuscarMeritoEvalExpPaginadoPorId = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idCalificacion !== null) queryParam = queryParam.append("idCalificacion", data.idCalificacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/contratacion/evaluacionexpedientes/calificaciones/buscarPorId";
        return this._http.get<any>(url, { params: queryParam });
    };

    getObtenerModalidadEducativa = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idModalidadEducativa != null) queryParam = queryParam.append("idModalidadEducativa", data.idModalidadEducativa);
        
        let url = this.basePath.contratacionesApi + "/desarrollos/modalidadeducativa/obtener";
        return this._http.get<any>(url, { params: queryParam });
    }

    getObtenerNivelEducativo = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idModalidadEducativa != null) queryParam = queryParam.append("idModalidadEducativa", data.idModalidadEducativa);
        if (data.idNivelEducativo != null) queryParam = queryParam.append("idNivelEducativo", data.idNivelEducativo);

        let url = this.basePath.contratacionesApi + "/desarrollos/niveleducativo/obtener";
        return this._http.get<any>(url, { params: queryParam });
    }

    getObtenerAreaCurricular = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAreaCurricular != null) queryParam = queryParam.append("idAreaCurricular", data.idAreaCurricular);
        
        let url = this.basePath.contratacionesApi + "/desarrollos/areacurricular/obtener";
        return this._http.get<any>(url, { params: queryParam });
    }

    getObtenerEspecialidad = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAreaCurricular != null) queryParam = queryParam.append("idAreaCurricular", data.idAreaCurricular);
        if (data.idEspecialidad != null) queryParam = queryParam.append("idEspecialidad", data.idEspecialidad);

        let url = this.basePath.contratacionesApi + "/desarrollos/especialidad/obtener";
        return this._http.get<any>(url, { params: queryParam });
    }

    getControlesHabilitados = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idAreaCurricular != null) queryParam = queryParam.append("idAreaCurricular", data.idAreaCurricular);
        if (data.idEspecialidad != null) queryParam = queryParam.append("idEspecialidad", data.idEspecialidad);

        let url = this.basePath.contratacionesApi + "/desarrollos/especialidad/obtener";
        return this._http.get<any>(url, { params: queryParam });
    }

    getPrepublicacionBotonesActivos = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.codRol != null) queryParam = queryParam.append("codRol", data.codRol);
        if (data.codTipoSede != null) queryParam = queryParam.append("codTipoSede", data.codTipoSede);

        let url = this.basePath.contratacionesApi + "/desarrollos/acceso/obtenerAccesoPorEtapaProcesoDesarrollo";
        return this._http.get<any>(url, { params: queryParam });
    }


    // INICIO ROL MONITOR
    getInstancias(data:any): Observable<any> {
        // return this.restangular.all("instancias/menu").get();
        let queryParam = new HttpParams();
        if (data.activo != null) queryParam = queryParam.append("activo", data.activo);
        if (data.codigoSede != null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.codigoRol != null) queryParam = queryParam.append("codigoRol", data.codigoRol);
        if (data.codigoTipoSede != null) queryParam = queryParam.append("codigoTipoSede", data.codigoTipoSede);


        let url = this.basePath.contratacionesApi + "/instancias/menu";
        return this._http.get<any>(url, { params: queryParam });
    }

    getInstanciaSelected(): InstanciaModel {
        // let instancia = "MINEDU";//this.localService.getItem(INSTANCIA_SELECTED);
        let instancia = null;//'{"idDre": 1,"idUgel": null,"codigoInstancia": "010000","descripcionInstancia": "DIRECCIÓN REGIONAL DE EDUCACIÓN AMAZONAS","codigoTipoSede": "TS001","idInstancia": null,"id": 0,"subInstancias": null}';//'{"name":"John", "age":30, "city":"New York"}';
        // console.log("Ingreso Instancia Selected", instancia);
        if (instancia) {
            const json = JSON.parse(instancia);
            const model = new InstanciaModel();
            console.log("objetos instancia", json, model );
            return Object.assign(model, json);
        } else {
            return null;
        }
    }
    setInstanciaSelected(rol: any) {
        //this.localService.setItem(INSTANCIA_SELECTED, JSON.stringify(rol));
        console.log("SetInstancia - cod para modificar sesion en backend:", rol);
    }

    // FIN ROL MONITOR

    migratePlazaContrataciones(data:any){
        // return this.restangular.all("instancias/menu").get();
  /*      let queryParam = new HttpParams();
        if (data.codigoCentroTrabajoMaestro != null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);
        if (data.idEtapaProceso != null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);

        let url = this.basePath.contratacionesApi + "/plazas/migrarplazasconvocatoria";
        return this._http.post<any>(url, { params: queryParam });
    */
        let url = this.basePath.contratacionesApi + "/plazas/migrarplazasconvocatoria";
        return this._http.post<any>(`${url}`, data);
    }

    migratePlazaContratacionesEtapaContratacionDirecta(data:any){
        // return this.restangular.all("instancias/menu").get();
  /*      let queryParam = new HttpParams();
        if (data.codigoCentroTrabajoMaestro != null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);
        if (data.idEtapaProceso != null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);

        let url = this.basePath.contratacionesApi + "/plazas/migrarplazasconvocatoria";
        return this._http.post<any>(url, { params: queryParam });
    */
        let url = this.basePath.contratacionesApi + "/plazas/migrarplazasContratacionDirectaToPun";
        return this._http.post<any>(`${url}`, data);
    }

    getExportarExcelContratacionGrillaGenerica = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoPlaza !== null) queryParam = queryParam.append("codigoPlaza", data.codigoPlaza);
        if (data.idCentroTrabajo !== null) queryParam = queryParam.append("idCentroTrabajo", data.idCentroTrabajo);
        if (data.codigoCentroTrabajo !== null) queryParam = queryParam.append("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.idSituacionValidacion !== null) queryParam = queryParam.append("idSituacionValidacion", data.idSituacionValidacion);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/plazas/exportar";
        return this._http.get<any>(url, { params: queryParam });
    }



    getObtenerIndicadoresEstadoPostulacion = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idEtapaProceso !== null) queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        if (data.codigoCentroTrabajoMaestro !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);

        let url = this.basePath.contratacionesApi + "/desarrollos/contrataciondirecta/postulantes/estadosPostulacion";

        return this._http.get<any>(url, { params: queryParam });
    };

    getFlujoEstado = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.append("codigoCentroTrabajoMaestro", data.codigoCentroTrabajoMaestro);
        queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        queryParam = queryParam.append("codigoTipoAccion", data.codigoTipoAccion);
	queryParam = queryParam.append("codigoEstadoInformacion", data.codigoEstadoInformacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/flujoestado/buscar/porestado";

        return this._http.get<any>(url, { params: queryParam });
    };
    getFlujoEstadoPorCodigoDre = (data: any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.append("codigoDre", data.codigoDre);
        queryParam = queryParam.append("idEtapaProceso", data.idEtapaProceso);
        queryParam = queryParam.append("codigoTipoAccion", data.codigoTipoAccion);
	queryParam = queryParam.append("codigoEstadoInformacion", data.codigoEstadoInformacion);

        let url = this.basePath.contratacionesApi + "/desarrollos/flujoestado/buscar/porcodigodre";

        return this._http.get<any>(url, { params: queryParam });
    };
}
