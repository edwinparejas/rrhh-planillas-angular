import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { GlobalUtil } from "./global";
import { BeneficiosRestangularService } from "./resources/beneficios-restangular.service";

@Injectable({
    providedIn: "root",
})
export class BeneficiosService {
    constructor(
        private restangular: BeneficiosRestangularService,
        private _http: HttpClient,
        private basePath: RestangularBasePath
        ) {}
    
    getAccesoUsuario = (queryParam: HttpParams): Observable<any> => {
        let url = this.basePath.beneficiosApi + "/rol/obtenerRolAcceso";
        return this._http.get<any>(url, { params: queryParam });
    }
    getDetalleBeneficio = (id:any): Observable<any> => {
        let queryParam = new HttpParams();
        queryParam = queryParam.set('id',id);        
        let url = this.basePath.beneficiosApi + "/registro/obtenerBeneficio";
        return this._http.get<any>(url, { params: queryParam });
    }
    deleteDetalleBeneficio = (queryParam:HttpParams): Observable<any> => {
        return this.restangular.all('registro/eliminarBeneficio').delete(queryParam);
    }
    getComboAnio = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/comun/anios";
        return this._http.get<any>(url, { params: queryParam });
    };
    getComboMandatoJudicial = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/regimengrupoaccion/listarMandatoJudicialParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboTipoCreditoDevengado = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/registro/listarTipoCreditoDevengado";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboTipoBeneficio = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/registro/listarTipoBeneficio";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboCategoriaBeneficio = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/registro/listarCategoriaBeneficio";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboCategoriaRemunerativa(): Observable<any> {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/servidorpublico/listarCategoriaRemunerativaParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboRegimenLaboralRegistro(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/regimengrupoaccion/listarRegimenLaboralParaRegistro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboEstado = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/registro/listarEstadoParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    
    getComboRegimenLaboral = (codigoRol: any = null,codigoSede: any = null,codigoTipoSede: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoRol !== null) {
            queryParam = queryParam.set('codigoRol', codigoRol);
        }
        if (codigoSede !== null) {
            queryParam = queryParam.set('codigoSede', codigoSede);
        }
        if (codigoTipoSede !== null) {
            queryParam = queryParam.set('codigoTipoSede', codigoTipoSede);
        }
        let url = this.basePath.beneficiosApi + "/regimengrupoaccion/listarRegimenLaboralParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboAccionRegistro(data: any): Observable<any> {
        return this.restangular.all('regimengrupoaccion/listarAccionParaRegistro').get(data);
    }
    getComboAccion = (codigoRol: any = null,codigoSede: any = null,codigoTipoSede: any = null,idRegimenLaboral: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoRol !== null) {
            queryParam = queryParam.set('codigoRol', codigoRol);
        }
        if (codigoSede !== null) {
            queryParam = queryParam.set('codigoSede', codigoSede);
        }
        if (codigoTipoSede !== null) {
            queryParam = queryParam.set('codigoTipoSede', codigoTipoSede);
        }
        if (idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral);
        }
        let url = this.basePath.beneficiosApi + "/regimengrupoaccion/listarAccionParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboMotivoAccionRegistro(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/regimengrupoaccion/listarMotivoAccionParaRegistro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboMotivoAccion = (codigoRol: any = null,codigoSede: any = null,codigoTipoSede: any = null,idRegimenLaboral: any = null,idAccion: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoRol !== null) {
            queryParam = queryParam.set('codigoRol', codigoRol);
        }
        if (codigoSede !== null) {
            queryParam = queryParam.set('codigoSede', codigoSede);
        }
        if (codigoTipoSede !== null) {
            queryParam = queryParam.set('codigoTipoSede', codigoTipoSede);
        }
        if (idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral);
        }
        if (idAccion !== null) {
            queryParam = queryParam.set('idAccion', idAccion);
        }
        let url = this.basePath.beneficiosApi + "/regimengrupoaccion/listarMotivoAccionParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    validarMandatoJudicial(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/regimengrupoaccion/validarMandatoJudicial";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboTipoDocumentoIdentidad = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/servidorpublico/listarTipoDocumentoIdentidadParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
   
    getTablePersona(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/servidorpublico/listarPersonaParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getFormServidorPublico(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/servidorpublico/obtenerServidorPublico";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboParentesco = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/servidorpublico/listarParentesco";
        return this._http.get<any>(url, { params: queryParam });
    }

    getInformeEscalafonario(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/informeescalafonario";
        return this._http.get<any>(url, { params: queryParam });
    }
    

    getFactorCalculo(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/factorcalculo";
        return this._http.get<any>(url, { params: queryParam });
    }
    //CREAR BENEFICIO
    guardarBeneficioCTS29944 = (data: any): Observable<any> => {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioCTS29944";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioCTS276(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioCTS276";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioCreditoDevengado(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioCreditoDevengado";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioSubsidioFamiliar(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioSubsidioFamiliar";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioVacacionesTruncas(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioVacacionesTruncas";
        return this._http.post<any>(`${url}`, data);
    }    
    guardarBeneficioATS25(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioATS25";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioATS30(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioATS30";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioGTS25(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioGTS25";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioBonificacionFamiliar(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioBonificacionFamiliar";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioBonificacionPersonal(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioBonificacionPersonal";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioIncentivoEstudios(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioIncentivoEstudios";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioIncentivoProfesional(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioIncentivoProfesional";
        return this._http.post<any>(`${url}`, data);
    }
    guardarBeneficioPremioAnual(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarBeneficioPremioAnual";
        return this._http.post<any>(`${url}`, data);
    }
    //EDITAR BENEFICIO
    guardarEditarBeneficioCTS29944(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioCTS29944";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioCTS276(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioCTS276";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioCreditoDevengado(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioCreditoDevengado";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioSubsidioFamiliar(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioSubsidioFamiliar";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioVacacionesTruncas(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioVacacionesTruncas";
        return this._http.post<any>(`${url}`, data);
    }    
    guardarEditarBeneficioATS25(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioATS25";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioATS30(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioATS30";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioGTS25(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioGTS25";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioBonificacionFamiliar(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioBonificacionFamiliar";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioBonificacionPersonal(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioBonificacionPersonal";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioIncentivoEstudios(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioIncentivoEstudios";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioIncentivoProfesional(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioIncentivoProfesional";
        return this._http.post<any>(`${url}`, data);
    }
    guardarEditarBeneficioPremioAnual(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarEditarBeneficioPremioAnual";
        return this._http.post<any>(`${url}`, data);
    }
    
    buscarPlazasPaginado(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/plaza/listarPlazas";
        return this._http.get<any>(url, { params: queryParam });
    }
    buscarCentrosTrabajoPaginado(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/centrotrabajo/listarCentroTrabajo";
        return this._http.get<any>(url, { params: queryParam });
    }
    searchBeneficiosExportar(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/servidorpublico/exportarBeneficio";
        return this._http.get<any>(url, { params: queryParam });
    }
    searchBeneficiosPaginado(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/servidorpublico/listarBeneficio";
        return this._http.get<any>(url, { params: queryParam });
    }


    /*Generar Proyecto
    * */
    getComboTipoDocumentoSustento = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/proyectoresolucion/listarTipoDocumentoSustento";
        return this._http.get<any>(url, { params: queryParam });
      }
      getComboTipoResolucion = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/proyectoresolucion/listarTipoResolucion";
        return this._http.get<any>(url, { params: queryParam });
      }
      getComboTipoFormatoSustento = (): Observable<any> => {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/proyectoresolucion/listarTipoFormatoSustento";
        return this._http.get<any>(url, { params: queryParam });
      }
     
    /*Codigo Modular
    * */
    getComboInstancia(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/centrotrabajo/listarInstanciaParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboSubInstancia(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/centrotrabajo/listarSubInstanciaParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    
    getComboTipoCentroTrabajo(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/centrotrabajo/listarTipoCentroTrabajoParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboModalidadEducativa(): Observable<any> {
        let queryParam = new HttpParams();
        let url = this.basePath.beneficiosApi + "/centrotrabajo/listarModalidadEducativaParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }
    getComboNivelEducativo(queryParam: HttpParams): Observable<any> {
        let url = this.basePath.beneficiosApi + "/centrotrabajo/listarNivelEducativoParaFiltro";
        return this._http.get<any>(url, { params: queryParam });
    }

    /* DNI
    * */
   validarDNI(queryParam: HttpParams): Observable<any> {
    let url = this.basePath.beneficiosApi + "/validaciones/validardni";
    return this._http.get<any>(url, { params: queryParam });
    }
    /* Acciones Grabadas
    * */
    enviarAccionesGrabadas(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarAccionesGrabadas";
        return this._http.post<any>(`${url}`, data);
    }
    /* Proyecto Resolucion
        * */
    enviarProyectoResolucion(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/registro/guardarProyectoResolucion";
        return this._http.post<any>(`${url}`, data);
    }
    /* Aprobaciones
        * */
    guardarAprobaciones(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/aprobaciones/guardarAprobaciones";
        return this._http.post<any>(`${url}`, data);
    }
    respuestaAprobaciones(data: any): Observable<any> {
        let url = this.basePath.beneficiosApi + "/aprobaciones/respuestaAprobaciones";
        return this._http.post<any>(`${url}`, data);
    }

}
