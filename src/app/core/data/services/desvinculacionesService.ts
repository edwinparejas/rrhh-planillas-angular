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
export class DesvinculacionesService {
    constructor(
        // private restangular: ContratacionesRestangularService,
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private global: GlobalUtil,
    ) {}

   
    getComboAnio = (): Observable<any> => {
        let url = this.basePath.desvinculacionesApi + "/comun/anios";
        return this._http.get<any>(url);
    };


    getComboRegimenLaboral = (param: any): Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/regimeneslaboral/obtenertodos?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getComboRegimenLaboralPorEstado = (param: any): Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/regimeneslaboral/obtenerporestado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getComboGrupoAccion = (): Observable<any> => {
        let url = this.basePath.desvinculacionesApi + "/grupoaccion/obtenertodos";
        return this._http.get<any>(url);
    }

    getComboAccion = (): Observable<any> => {
        let url = this.basePath.desvinculacionesApi + "/accion/obtenertodos";
        return this._http.get<any>(url);
    }

    getComboEscala = (): Observable<any> => {
        let url = this.basePath.desvinculacionesApi + "/escala/obtener";
        return this._http.get<any>(url);
    }

    getComboAccionPorRegimenLaboral = (param: any): Observable<any> => {
        // let url = this.basePath.vinculacionesApi + "/accion/listar/{}";        
        let url = `${this.basePath.desvinculacionesApi}/accion/listar?${this.global.formatParameter(param, false)}`
        return this._http.get<any>(url);
    }

    getComboTipoCentroTrabajo = (): Observable<any> => {
        let url = this.basePath.desvinculacionesApi + "/tipocentrotrabajo/obtenertodos";
        return this._http.get<any>(url);
    }

    getComboMotivoAccion = (param: any): Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/motivoaccion/obtenertodos?${this.global.formatParameter(param, false)}`
        return this._http.get<any>(url);
    }
    
    getComboMotivoAccionPorAccion = (param: any): Observable<any> => {
        // let url = this.basePath.vinculacionesApi + "/motivoaccion/obtenertodos";
        // let url = `${this.basePath.vinculacionesApi}/motivoaccion/listar/${id_accion}`
        let url = `${this.basePath.desvinculacionesApi}/motivoaccion/listar?${this.global.formatParameter(param, false)}`
        return this._http.get<any>(url);
    }

    getCatalogoItem = (param: any) : Observable<any> => {
        // let url = this.basePath.contratacionesApi + "/catalogoitem/obtenerporcodigocatalogo?";
        let url = `${this.basePath.desvinculacionesApi}/catalogoitem/obtenerporcodigocatalogo?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getComboDreInstancia = (): Observable<any> => {
        let url = this.basePath.desvinculacionesApi + "/dre/obtenertodos";
        return this._http.get<any>(url);
    }

    getCentroTrabajoPaginado = (param: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/centrotrabajo/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    } 

    eliminarGestionDesvinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/eliminar`;
        return this._http.post<any>(url, data);
    }

    getGestionDesvinculacionPaginado = (param: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/paginado?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    } 

    enviarAccionesGrabadas = (data: any): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/enviaraccionesgrabadas`;
        return this._http.post<any>(url, data);
    }


    getGestionDesvinculacionExcel = (body: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/excel`;
        return this._http.post<any>(url, body);
    } 

    //---------------------- DATA PASSPORT
    getCodigoDreUgel = (param: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/obtienecodigosdreugel?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    // INICIO ROL MONITOR
    getInstancias(data:any): Observable<any> {
        // return this.restangular.all("instancias/menu").get();
        let queryParam = new HttpParams();
        if (data.activo != null) queryParam = queryParam.append("activo", data.activo);
        if (data.codigoSede != null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.codigoRol != null) queryParam = queryParam.append("codigoRol", data.codigoRol);
        if (data.codigoTipoSede != null) queryParam = queryParam.append("codigoTipoSede", data.codigoTipoSede);


        let url = this.basePath.desvinculacionesApi + "/instancias/menu";
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


    //-------------Modal Centro de Trabajo------------------------

    getDefaultValueComboInstanciasByCodSede = (codSede: any): Observable<any> => {
        let queryParam = new HttpParams();
        
        let url = this.basePath.desvinculacionesApi + "/Instancias/instaciaDetallePorCodigoSede";
        if (codSede !== null) queryParam = queryParam.append("codigoCentroTrabajoMaestro", codSede);

        return this._http.get<any>(url, { params: queryParam });
    };

    getTipoCentroTrabajo = (idNivelInstancia: any, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.desvinculacionesApi + "/centrotrabajo/tipos";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboInstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null) queryParam = queryParam.append("codigoSede", data.codigoSede);
        if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);

        var url = this.basePath.desvinculacionesApi + "/instancias/filtroInstancia";
        return this._http.get<any>(url, { params: queryParam });    
    }

    getComboSubinstancia(data: any): Observable<any> {
        let queryParam = new HttpParams();
             if (data.activo !== null) queryParam = queryParam.append("activo", data.activo);
             if (data.idInstancia !== null) queryParam = queryParam.append("idInstancia", data.idInstancia);

        const url = this.basePath.desvinculacionesApi + `/Instancias/filtroSubInstancia`;
        return this._http.get<any>(url, { params: queryParam });
    }

    buscarCentrosTrabajoPaginado = (data: any, pageIndex, pageSize) => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.desvinculacionesApi + "/centrotrabajo/paginado"; 
        return this._http.post<any>(`${url}`, filtroPaginado);
    };


    //
    entidadPassport = (pCodigoSede: any): Observable<any> => {
        let queryParam = new HttpParams()
          .set("codigoEntidadSede", pCodigoSede);
        let url = this.basePath.desvinculacionesApi + "/entidades";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getBuscarPersona = (param: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/persona/buscar?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    } 

    getBuscarDatosPersona = (param: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/persona/buscarDatosPersona?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    } 

    getPersonaDatosLaboral = (param: any): Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/persona/buscardatosLaboral?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    getBuscarPersonaFiltro = (param: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/persona/buscarPersonaPorFiltro?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    guardarGestionDesinculacion = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/gestion`;
        return this._http.post<any>(url, data);
    }

    guardarNuevaGestionVinculacion = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.vinculacionesApi}/gestionvinculacion/nuevo`;
        return this._http.post<any>(url, data);
    }

    getInformeEscalafonario = (data:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.pNumeroInformeEscalafonario) {
          queryParam = queryParam.set('numeroInformeEscalafonario', data.pNumeroInformeEscalafonario);
        }
        if (data.pIdTipoDocumentoIdentidad) {
          queryParam = queryParam.set('idTipoDocumentoIdentidad', data.pIdTipoDocumentoIdentidad);
        }
        if (data.pNumeroDocumentoIdentidad) {
          queryParam = queryParam.set('numeroDocumentoIdentidad', data.pNumeroDocumentoIdentidad);
        }
        let url = this.basePath.desvinculacionesApi + "/informeescalafonario";
        return this._http.get<any>(url, { params: queryParam });
    }

    getContrato = (data:any): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.pNumeroContrato) {
          queryParam = queryParam.set('numeroContrato', data.pNumeroContrato);
        }              

        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/contrato?${this.global.formatParameter(data, false)}`;
        return this._http.get<any>(url, { params: queryParam });
    }
    
    //Se busca vinculacion por id
    getDesvinculacionPorId  = (id_gestion_desvinculacion: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/gestiondesvinculacion/obtener/${id_gestion_desvinculacion}`;
        return this._http.get<any>(url);
    }

    //Se busca las vinculaciones vigentes por persona   

    getVinculacionesVigentes = (param: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/vinculacionesvigentes?${this.global.formatParameter(param, false)}`;
        return this._http.get<any>(url);
    }

    aprobarDesvinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestiondesvinculacion/aprobar`;
        return this._http.post<any>(url, data);
    }

    desaprobarDesvinculacion = (data: any): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestiondesvinculacion/desaprobar`;
        return this._http.post<any>(url, data);
    }

    generarProyectoResolucionDesvinculacion = (data: FormData): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestiondesvinculacion/registrarProyectoResolucion`;
        return this._http.post<any>(url, data);
    }

    buscarServidorPublicoTransversal = (data: any, pageIndex, pageSize): Observable<any> => {
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.desvinculacionesApi + "/servidorespublicos/transversal";
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    generarCartaCese = (data: any): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestionDesvinculacion/generarcartacese`;
        return this._http.post<any>(url, data);
    }

    obtenerCartaCese  = (id_gestion_desvinculacion: any) : Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/gestiondesvinculacion/obtenercartacese/${id_gestion_desvinculacion}`;
        return this._http.get<any>(url);
    }

    validarLimiteEdad = (data: any): Observable<Response> => {
        let url = `${this.basePath.desvinculacionesApi}/gestiondesvinculacion/validarlimiteedad`;
        return this._http.post<any>(url, data);
    }

    getProyectoResolucionDocumentos = (id_gestion_desvinculacion: number): Observable<any> => {
        let url = `${this.basePath.desvinculacionesApi}/gestiondesvinculacion/documentosproyecto/${id_gestion_desvinculacion}`;
        return this._http.get<any>(url);
    }

}
