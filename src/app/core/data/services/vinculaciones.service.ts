import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { GlobalUtil } from "./global";


import {
    InstanciaModel
} from "app/main/apps/procesos/contratacion/models/contratacion.model";

@Injectable({
    providedIn: "root",
})
export class VinculacionesService {
    constructor(
        // private restangular: ContratacionesRestangularService,
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private global: GlobalUtil,
    ) { }

    getComboAnio = (): Observable<any> => {
        let url = this.basePath.vinculacionesApi + "/comun/anios";
        return this._http.get<any>(url);
    };

    getComboRegimenLaboral = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/regimeneslaboral/obtenertodos?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getComboRegimenLaboralPorEstado = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/regimeneslaboral/obtenerporestado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getComboAccion = (): Observable<any> => {
        let url = this.basePath.vinculacionesApi + "/accion/obtenertodos";
        return this._http.get<any>(url);
    }



    getComboAccionPorRegimenLaboral = (id_regimen_laboral: number): Observable<any> => {
        // let url = this.basePath.vinculacionesApi + "/accion/listar/{}";
        let url = `${this.basePath.vinculacionesApi}/accion/listar/${id_regimen_laboral}`
        return this._http.get<any>(url);
    }

    getComboTipoCentroTrabajo = (): Observable<any> => {
        let url = this.basePath.vinculacionesApi + "/tipocentrotrabajo/obtenertodos";
        return this._http.get<any>(url);
    }

    getComboMotivoAccion = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/motivoaccion/obtenertodos?${this.global.formatParameter(param, false)}`
        return this._http.get<any>(url);
    }

    getComboMotivoAccionPorAccion = (param: any): Observable<any> => {
        // let url = this.basePath.vinculacionesApi + "/motivoaccion/obtenertodos";
        // let url = `${this.basePath.vinculacionesApi}/motivoaccion/listar/${id_accion}`
        let url = `${this.basePath.vinculacionesApi}/motivoaccion/listar?${this.global.formatParameter(param, false)}`
        return this._http.get<any>(url);
    }

    getCatalogoItem = (param: any): Observable<any> => {
        // let url = this.basePath.contratacionesApi + "/catalogoitem/obtenerporcodigocatalogo?";
        let url = `${this.basePath.vinculacionesApi}/catalogoitem/obtenerporcodigocatalogo?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getAfp = (): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/afp/obteneractivos`;
        return this._http.get<any>(url);
    }

    getRegimenesPensionarios = (): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/regimenpensionario/obteneractivos`;
        return this._http.get<any>(url);
    }

    getComboDreInstancia = (): Observable<any> => {
        let url = this.basePath.vinculacionesApi + "/dre/obtenertodos";
        return this._http.get<any>(url);
    }

    getComboUgelSubInstancia = (idDre): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/ugel/obtener/${idDre}`;
        return this._http.get<any>(url);
    }


    getPlazaPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/plaza/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getCentroTrabajoPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/centrotrabajo/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getBuscarPersona = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/persona/buscar?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }
    getPersona = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/buscarpersonareniecmigraciones?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }
    
    getPersonaDatosEstudiosPensionario = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/buscarpensionariosestudiospersona?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }
    getPersonaConProcesoAdjudicacion = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/buscarpersonaconprocesoadjudicacion?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    //Se busca vinculacion por id
    getVinculacionPorId = (id_gestion_vinculacion: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/obtener/${id_gestion_vinculacion}`;
        return this._http.get<any>(url);
    }


    //Se busca las adjudicaciones vigentes por persona
    getAdjudicacionesVigentes = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/adjudicacionesvigentes/${param}`;
        return this._http.get<any>(url);
    }

    //Se busca las vinculaciones vigentes por persona
    getVinculacionesVigentes = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/vinculacionesvigentes/${param}`;
        return this._http.get<any>(url);
    }

    getSancionesAdministrativas = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/buscarsancionesadministrativas?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    guardarNuevaGestionVinculacion = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/nuevo`;
        return this._http.post<any>(url, data);
    }

    guardarVinculacionPorObservacion = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/nuevavinculacionporobservacion`;
        return this._http.post<any>(url, data);
    }

    gestionVinculacionConProyecto = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/gestionVinculacionConProyecto`;
        return this._http.post<any>(url, data);
    }

    generarProyectoResolucionVinculacion = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/registrarProyectoResolucion`;
        return this._http.post<any>(url, data);
    }

    observarGestionVinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/observar`;
        return this._http.post<any>(url, data);
    }

    eliminarGestionVinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/eliminar`;
        return this._http.post<any>(url, data);
    }

    getPlazaPorCodigo = (codigo_plaza: string): Observable<any> => {
        // let url = this.basePath.vinculacionesApi + "/motivoaccion/obtenertodos";
        let url = `${this.basePath.vinculacionesApi}/plaza/obtener/${codigo_plaza}`
        return this._http.get<any>(url);
    }

    getPlazaPorId = (id_plaza: number): Observable<any> => {
        // let url = this.basePath.vinculacionesApi + "/motivoaccion/obtenertodos";
        let url = `${this.basePath.vinculacionesApi}/plaza/obtenerPlazaPorId/${id_plaza}`
        return this._http.get<any>(url);
    }

    getDiferencia = (id_gestion_vinculacion: number): Observable<any> => {
        // let url = this.basePath.vinculacionesApi + "/motivoaccion/obtenertodos";
        let url = `${this.basePath.vinculacionesApi}/plaza/validarDiferencia/${id_gestion_vinculacion}`
        return this._http.get<any>(url);
    }

    ObservarDiferenciaPlaza = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/plaza/ObtenerDiferenciaPlaza?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    actualizarPlazaDetalle = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/plaza/actualizarPlazaDetalle`;
        return this._http.post<any>(url, data);
    }



    getGestionVinculacionPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getGestionVinculacionExcel = (body: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/excel`;
        return this._http.post<any>(url, body);
    }

    enviarAccionesGrabadas = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/enviaraccionesgrabadas`;
        return this._http.post<any>(url, data);
    }

    getCatalogoTipoResolucion = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/obtenertiporesolucion?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

 //propios de pronoei

 getCodigoDreUgelPronoei = (param: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/obtenerdreugel?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
}

 getPersonaPronoei = (param: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/buscarpersonareniecmigraciones?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
}

 generarProyectoResolucionPronoeiSimple = (data: FormData): Observable<Response> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/registrarproyectoresolucionsimple`;
    return this._http.post<any>(url, data);
}

generarProyectoResolucionPronoeiComplejo = (data: FormData): Observable<Response> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/registrarproyectoresolucioncomplejo`;
    return this._http.post<any>(url, data);
}

enviarAccionesGrabadasPronoei = (data: any): Observable<Response> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/enviaraccionesgrabadas`;
    return this._http.post<any>(url, data);
}

enviarAccionesGrabadasPronoeiMasivo = (data: any): Observable<Response> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/enviaraccionesgrabadasmasivo`;
    return this._http.post<any>(url, data);
}

getGestionPronoeiExcel = (body: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/excel`;
    return this._http.post<any>(url, body);
}

eliminarGestionPronoei = (data: any): Observable<Response> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/eliminar`;
    return this._http.post<any>(url, data);
}

guardarNuevaGestionPronoei = (data): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/nuevo`;
    return this._http.post<any>(url, data);
}

getGestionPronoeiPaginado = (param: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/paginado?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
}

getCentroTrabajoxCodMod = (param: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/centrotrabajo/codigomodular?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
}


getRegimenGrupoAccion = (param: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/regimengrupoaccion?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
}

getPronoeiPorId = (pronoeiId: number): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/obtener/${pronoeiId}`
    return this._http.get<any>(url);
}

getCatalogoTipoResolPronoei = (param: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/obtenertiporesolucionpordreugel?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
}

getMaestroPermisoPronoei = (param: any): Observable<any> => {
    let url = `${this.basePath.vinculacionesApi}/gestionpronoei/obtenermaestropermisopronoei?${this.global.formatParameter(param, false)}`;
    return this._http.get<any>(url);
}



//fin propios de pronoei


    //------------- GESTION CONTRATO ------------------------ >>>>

    getGestionContratoPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getGestionContratoExcel = (body: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/excel`;
        return this._http.post<any>(url, body);
    }

    getGestionContratoPorId = (id_gestion_contrato: number): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/cabecera/${id_gestion_contrato}`;
        return this._http.get<any>(url);
    }

    getGestionContratoDocumentos = (id_gestion_contrato: number): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/documentos/${id_gestion_contrato}`;
        return this._http.get<any>(url);
    }

    guardarNuevoGestionContrato = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/nuevo`;
        return this._http.post<any>(url, data);
    }

    eliminarGestionContrato = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/eliminar`;
        return this._http.post<any>(url, data);
    }

    adjuntarContratoFirmado = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/adjuntarcontrato`;
        return this._http.post<any>(url, data);
    }

    generarContrato = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/generarcontrato`;
        return this._http.post<any>(url, data);
    }

    //Se busca contrato por id
    getContratoPorId = (id_gestion_contrato: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestioncontrato/obtener/${id_gestion_contrato}`;
        return this._http.get<any>(url);
    }


    




    //------------- GESTION ADENDA ------------------------ >>>>

    getGestionAdendaPaginado = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getGestionAdendaExcel = (body: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/excel`;
        return this._http.post<any>(url, body);
    }

    getGestionAdendaDocumentos = (id_gestion_adenda: number): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/documentos/${id_gestion_adenda}`;
        return this._http.get<any>(url);
    }

    guardarNuevoGestionAdenda = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/nuevo`;
        return this._http.post<any>(url, data);
    }

    eliminarGestionAdenda = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/eliminar`;
        return this._http.post<any>(url, data);
    }

    adjuntarAdendaFirmada = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/adjuntaradenda`;
        return this._http.post<any>(url, data);
    }

    generarAdenda = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/generaradenda`;
        return this._http.post<any>(url, data);
    }

    //Se busca contrato por id
    getAdendaPorId = (id_gestion_adenda: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionadenda/obtener/${id_gestion_adenda}`;
        return this._http.get<any>(url);
    }

    //------------- OTROS COMBOS ------------------------ >>>>

    getComboNivelEducativo = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/niveleducativo/obtener`;
        return this._http.get<any>(url);
    }
    
    getComboGradoAcademico = (idNivelEducativo: number, idSituacionAcademica: number): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gradoacademico/obtener/${idNivelEducativo}/${idSituacionAcademica}`;
        return this._http.get<any>(url);
    }

    getUbigeoDepartamentos = (): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/ubigeo/obtenerdepartamentos`;
        return this._http.get<any>(url);
    }
    getUbigeoProvincias = (id_departamento: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/ubigeo/obtenerprovincias/${id_departamento}`;
        return this._http.get<any>(url);
    }
    getUbigeoDistritos = (id_provincia: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/ubigeo/obtenerdistritos/${id_provincia}`;
        return this._http.get<any>(url);
    }


    //---------------------- DATA PASSPORT
    getCodigoDreUgel = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/obtienecodigosdreugel?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getObtenerPermisoVinculacion = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/maestropermiso/obtienepermisovinculacion?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }


    //------------- PERIODO LECTIVO ------------------------ >>>>
    getFechaLectivo = (): Observable<any> => {
        let url = this.basePath.vinculacionesApi + "/periodolectivo/buscarperiodolectivo";
        return this._http.get<any>(url);
    }

    // INICIO ROL MONITOR
    getInstancias(data: any): Observable<any> {
        // return this.restangular.all("instancias/menu").get();
        let queryParam = new HttpParams();
        if (data.activo != null) queryParam = queryParam.append("activo", data.activo);
        if (data.codigoSede != null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.codigoRol != null) queryParam = queryParam.append("codigoRol", data.codigoRol);
        if (data.codigoTipoSede != null) queryParam = queryParam.append("codigoTipoSede", data.codigoTipoSede);


        let url = this.basePath.vinculacionesApi + "/instancias/menu";
        return this._http.get<any>(url, { params: queryParam });
    }

    getInstanciaSelected(): InstanciaModel {
        // let instancia = "MINEDU";//this.localService.getItem(INSTANCIA_SELECTED);
        let instancia = null;//'{"idDre": 1,"idUgel": null,"codigoInstancia": "010000","descripcionInstancia": "DIRECCIÓN REGIONAL DE EDUCACIÓN AMAZONAS","codigoTipoSede": "TS001","idInstancia": null,"id": 0,"subInstancias": null}';//'{"name":"John", "age":30, "city":"New York"}';
        // console.log("Ingreso Instancia Selected", instancia);
        debugger
        if (instancia) {
            const json = JSON.parse(instancia);
            const model = new InstanciaModel();
            console.log("objetos instancia", json, model);
            return Object.assign(model, json);
        } else {
            return null;
        }
    }
    setInstanciaSelected(rol: any) {
        //this.localService.setItem(INSTANCIA_SELECTED, JSON.stringify(rol));
        console.log("SetInstancia - cod para modificar sesion en backend:", rol);
    }


    //-------------Modal Centro de Trabajo------------------------

    getDefaultValueComboInstanciasByCodSede = (codSede: any): Observable<any> => {
        let queryParam = new HttpParams();

        let url = this.basePath.vinculacionesApi + "/Instancias/instaciaDetallePorCodigoSede";
        if (codSede !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codSede);

        return this._http.get<any>(url, { params: queryParam });
    };

    getTipoCentroTrabajo = (idNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.vinculacionesApi + "/centrotrabajo/tipos";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboInstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        var url = this.basePath.vinculacionesApi + "/instancias/filtroInstancia";
        return this._http.get<any>(url, { params: queryParam });
    }

    getComboSubinstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);
        if (data.idInstancia !== null) queryParam = queryParam.append("idInstancia", data.idInstancia);

        const url = this.basePath.vinculacionesApi + `/Instancias/filtroSubInstancia`;
        return this._http.get<any>(url, { params: queryParam });
    }
    /*
        buscarCentrosTrabajoPaginado = (data: any, pageIndex, pageSize) => {
            const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
            let url = this.basePath.vinculacionesApi + "/centrotrabajo/paginado"; 
            return this._http.post<any>(`${url}`, filtroPaginado);
        };
    */

    //
    entidadPassport = (pCodigoSede: any): Observable<any> => {
        let queryParam = new HttpParams()
            .set("codigoEntidadSede", pCodigoSede);
        let url = this.basePath.vinculacionesApi + "/entidades";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    aprobarVinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/aprobarvinculacion`;
        return this._http.post<any>(url, data);
    }

    desaprobarVinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/desaprobarvinculacion`;
        return this._http.post<any>(url, data);
    }

    buscarServidorPublicoTransversal = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.vinculacionesApi + "/servidorespublicos/transversal";
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    obtenerCentroTrabajoPorCodigoSede = (data: any): Observable<any> => {
        let queryParam = new HttpParams();

        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        let url = this.basePath.vinculacionesApi + "/centrotrabajo/centrotrabajoporcodigosede";
        return this._http.get<any>(url, { params: queryParam });
    };

    getModalidadEducativa = (): Observable<any> => {
        const url = this.basePath.vinculacionesApi + "/modalidadeseducativa";
        return this._http.get<any>(url);
    };    

    getNivelEducativo = (idModalidadEducativa: any): Observable<any> => {

        const url = this.basePath.vinculacionesApi + "/niveleducativo/"+idModalidadEducativa;        
        return this._http.get<any>(url);
    };

    validarvinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/validarvinculacion`;
        return this._http.post<any>(url, data);
    }

    validarFechasVinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/validarfechasvinculacion`;
        return this._http.post<any>(url, data);
    }

    validarEdad = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/validarEdad`;
        return this._http.post<any>(url, data);
    }

    validarVinculacionVigente = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/validarvinculacionvigente`;
        return this._http.post<any>(url, data);
    }

    validarReglaPlaza = (data: any): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/plaza/validarReglaPlaza`;
        return this._http.post<any>(url, data);
    }

    buscarCentrosTrabajoPaginado = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) {
            queryParam = queryParam.set(
                "idNivelInstancia",
                data.idNivelInstancia
            );
        }
        // if (data.codigoNivelInstancia !== null && data.codigoNivelInstancia > 0) {
        //     queryParam = queryParam.set(
        //         "codigoNivelInstancia",
        //         data.codigoNivelInstancia
        //     );
        // }
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

        let url = this.basePath.vinculacionesApi + "/centrotrabajo";
        return this._http.get<any>(url, { params: queryParam });
    };

    getListarPlazasPorCodigoPlaza = (param: any) : Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/plaza/listarPlazasPorCodigoPlaza?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getComboSituacionAcademica = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/situacionacademica/obtenertodos?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getObtenerPermisoCombosFormacionAcademica = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/situacionacademica/obtenerpermisocombos?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getObtenerSecundarioPonNivelEducativo = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/situacionacademica/obtenersecundarioponNiveleducativo?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getObtenerSuperiorPonNivelEducativo = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/situacionacademica/obtenersuperiorponNiveleducativo?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getObtenerGradoAcademico = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/situacionacademica/obtenergradoacademico?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getObtenerMaestroFormacionAcademica = (param: any): Observable<any> => {
        let url = `${this.basePath.vinculacionesApi}/situacionacademica/obtenermaestroformacionacademica?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

}
