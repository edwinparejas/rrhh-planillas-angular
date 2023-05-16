import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestangularBasePath } from '../base-path/restangular-base-path';
import { CuadroHorasRestangularService } from './resources/cuadro-horas.restangular.service';


@Injectable({
    providedIn: 'root'
})
export class CuadroHorasService {

    constructor(
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private restangular: CuadroHorasRestangularService) { }

    /*BEGIN COMUNES*/

    getComboInstanciaFiltro = (data: any): Observable<any> => {
        var ruta = ''
        return this.restangular.all("instancia").all(ruta).get(data);

    }
    getComboInstancia = (data: any): Observable<any> => {
        var ruta = 'listar'
        return this.restangular.all("instancia").all(ruta).get(data);

    }
    getComboSubInstancia = (data: any): Observable<any> => {
        var ruta = 'listar'
        return this.restangular.all("subinstancia").all(ruta).get(data);

    }

    getComboAnios = (data: any): Observable<any> => {
        var ruta = 'listar-anio'
        return this.restangular.all("bolsahoras").all(ruta).get(data);

    }
    buscarCentrosTrabajoPaginado = (data: any, pageIndex, pageSize) => {

        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.cuadroHorasApi + "/centrostrabajo/buscar";
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    getCabeceraProceso(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/proceso/obtener-cabecera-por-id?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }

    getTipoCentroTrabajo = (idNivelInstancia: any, codigoCentroTrabajo: string, activo: any): Observable<any> => {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) queryParam = queryParam.append("idNivelInstancia", idNivelInstancia);
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        queryParam = queryParam.append("codigoCentroTrabajo", codigoCentroTrabajo);

        let url = this.basePath.cuadroHorasApi + "/centrostrabajo/tipos";
        return this._http.get<any>(url, { params: queryParam });
    };

    getComboSubinstanciaFiltro = (idInstancia: any, activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) queryParam = queryParam.append("activo", activo);
        if (idInstancia !== null) queryParam = queryParam.append("idInstancia", idInstancia);

        let url = this.basePath.cuadroHorasApi + "/instancia/subinstancias";
        return this._http.get<any>(url, { params: queryParam });
    };
    getComboEstadosConsolidadoPlaza = () => {
        let url = this.basePath.cuadroHorasApi + "/catalogoitem/obtenerestadosconsolidado";
        return this._http.get<any>(url);
    };
    getListaConsolidadoPlaza = (data: any, pageIndex, pageSize): Observable<any> => {
        console.log("getListaConsolidadoPlaza");
        const filtroPaginado = { ...data, paginaActual: parseInt(pageIndex), tamanioPagina: parseInt(pageSize) };
        let url = this.basePath.cuadroHorasApi + "/consolidadoplaza/buscar";
        return this._http.post<any>(`${url}`, filtroPaginado);
    };

    /**END COMUNES */

    /**BOLSA HORAS */
    getListaBolsaHoras(data: any): Observable<any> {
        return this.restangular.all('bolsahoras').all('lista').get(data);
    }
    buscarDatoCentroTrabajo = (data: any) => {
        var ruta = 'centrostrabajo/codigo-modular'
        return this.restangular.all(ruta).get(data);
    }
    buscarDatoCentroTrabajoXIIEE = (data: any) => {
        var ruta = 'centrostrabajo/id-institucion-educativa'
        return this.restangular.all(ruta).get(data);
    }
    grabarBolsaHoras(data: any): Observable<any> {
        var ruta = 'bolsahoras'
        return this.restangular.all(ruta).post(data);
    }
    eliminarBolsaHoras(data: any): Observable<any> {
        var ruta = 'bolsahoras'
        return this.restangular.all(ruta).put(data);
    }
    cambiarEstadoBolsaHoras(data: any): Observable<any> {
        var ruta = 'cambiar-estado'
        return this.restangular.all("bolsahoras").all(ruta).put(data);
    }
    actualizarBolsaHoras(data: any): Observable<any> {
        var ruta = 'actualizar'
        return this.restangular.all("bolsahoras").all(ruta).put(data);
    }
    exportar = (data: any): Observable<any> => {
        var ruta = 'exportar'
        return this.restangular.all("bolsahoras").all(ruta).post(data);
    }

    getProcesById = (data: any): Observable<any> => {
        var ruta = 'obtener-cabecera-por-id'
        return this.restangular.all("proceso").all(ruta).get(data);
    }
    obtenerBolsaHoras = (data: any): Observable<any> => {
        var ruta = 'obtener'
        return this.restangular.all("bolsahoras").all(ruta).get(data);
    }

    getTotalesResumen = (data: any): Observable<any> => {
        var ruta = 'obtener-resumen-totales'
        return this.restangular.all("bolsahoras").all(ruta).get(data);

    }

    /*BEGIN METAS**/
    getListaMetas(data: any): Observable<any> {
        return this.restangular.all('metas').all('lista').get(data);
    }
    grabarMetas(data: any): Observable<any> {
        var ruta = 'metas'
        return this.restangular.all(ruta).post(data);
    }
    eliminarMetas(data: any): Observable<any> {
        var ruta = 'metas'
        return this.restangular.all(ruta).put(data);
    }
    cambiarEstadoMetas(data: any): Observable<any> {
        var ruta = 'cambiar-estado'
        return this.restangular.all("metas").all(ruta).put(data);
    }
    actualizarMetas(data: any): Observable<any> {
        var ruta = 'actualizar'
        return this.restangular.all("metas").all(ruta).put(data);
    }
    exportarMetas = (data: any): Observable<any> => {
        var ruta = 'exportar'
        return this.restangular.all("metas").all(ruta).post(data);
    }
    obtenerMetas = (data: any): Observable<any> => {
        var ruta = 'obtener'
        return this.restangular.all("metas").all(ruta).get(data);

    }
    getTotalesResumenMetas = (data: any): Observable<any> => {
        var ruta = 'obtener-resumen-totales'
        return this.restangular.all("metas").all(ruta).get(data);

    }
    getTotalesResumenHorasMetas = (data: any): Observable<any> => {
        var ruta = 'obtener-resumen-horas-totales'
        return this.restangular.all("metas").all(ruta).get(data);

    }
    getHoraMininmaPlanEstudio = (data: any): Observable<any> => {
        var ruta = 'obtenerhorasminimasplanbase'
        return this.restangular.all("plan-estudio").all(ruta).get(data);

    }
    /**END METAS **/

    /*INICIO ADECUACION CUADRO HORA TOTAL - PLATAFORMA
    * UNIFICACION DE TODOS SERVICIOS USADOS EN BANDEJA
    */
    obtenerActivos() {
        let url = `${this.basePath.cuadroHorasApi}/area-curricular/obtener-activos`;
        return this._http.get<any>(`${url}`);
    }
    obtenerCatalogoPorCodigo(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/catalogoitem/obtener-por-codigocatalogo?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerPorId(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/centrostrabajo/id-institucion-educativa?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }

    obtenerPorCodigoCentroTrabajo(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/centrostrabajo/codigo-centro-trabajo?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerPorCodigoCentroTrabajoDreUgel(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/centrostrabajo/codigocentrotrabajo?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerPorCodigoModularAnexos(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/centrostrabajo/codigomodularanexos?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlazaCuadroHoraExcedenteExportar(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazaexcedentes/exportar`;
        return this._http.post<any>(`${url}`, body);
    }

    getPlazaCuadroHoraTotalExcedentesPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazaexcedentes/paginado?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }

    obtenerHorasLectivasPorPlazaCuadroHora(request) {
        let url = `${this.basePath.cuadroHorasApi}/plazanecesidad/obtenerhoralectivaporcuadroHora?${this.formatParameter(request, false)}`;
        return this._http.get<any>(`${url}`);
    }
    eliminarCuadroHoraNecesidad(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazanecesidad/eliminarplazacuadrohora`;
        return this._http.put<any>(`${url}`, data);
    }

    obtenerPlazaNecesidad(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazanecesidad/obtenerporhoralectivaPorId?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }

    guardar(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazanecesidad/guardar`;
        return this._http.post<any>(`${url}`, body);
    }
    getPlazaCuadroHoraNecesidadExportar(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazanecesidad/exportar`;
        return this._http.post<any>(`${url}`, body);
    }
    getPlazaCuadroHoraTotalNecesidadPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazanecesidad/paginado?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }

    obtenerAnios() {
        let url = `${this.basePath.cuadroHorasApi}/proceso/obtener-anios`;
        return this._http.get<any>(`${url}`);
    }

    obtenerEstados() {
        let url = `${this.basePath.cuadroHorasApi}/proceso/obtener-estados`;
        return this._http.get<any>(`${url}`);
    }
    obtenerEstadosProceso() {
        let url = `${this.basePath.cuadroHorasApi}/catalogoitem/obtenerestadoproceso`;
        return this._http.get<any>(`${url}`);
    }
    obtenerRegimenesLaborales() {
        let url = `${this.basePath.cuadroHorasApi}/regimen-laboral/obtener-regimenes-laborales`;
        return this._http.get<any>(`${url}`);
    }

    getPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/proceso/paginado?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }

    getPlazaCuadroHoraPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/paginado?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }

    getPlazaCuadroHoraTotalResultadofinalPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/total/resultadofinal/paginado?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }


    getEspecialidadesPorServidorPublico(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/especialidad/listarporareaservidor?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getEspecialidades(idAreaCurricular: any = null) {

        //  let queryParam = new HttpParams();
        let queryParam: any;
        if (idAreaCurricular !== null) queryParam = { idAreaCurricular: idAreaCurricular };

        let url = `${this.basePath.cuadroHorasApi}/especialidad/lista?${this.formatParameter(queryParam, false)}`;
        console.log(url);
        return this._http.get<any>(`${url}`);
    }
    getAreasCurriculares(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/area-curricular/obtener-activos?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getAreasCurricularesPorEspecialidad(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/area-curricular/obtenerporespecialidad?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getMotivos() {

        let url = `${this.basePath.cuadroHorasApi}/catalogoitem/obtenermotivopreferencia`;
        return this._http.get<any>(`${url}`);
    }
    getIdGrados() {
        let url = `${this.basePath.cuadroHorasApi}/catalogoitem/obteneridgrados`;
        return this._http.get<any>(`${url}`);
    }
    getPlanEstudioBase(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plan-estudio/obtener-plan-base?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlanEstudioContextualizado(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/planestudiocontextualizado/obtenerplan?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getHoraDistribuidaBase(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/horadistribuida/obtenerhoradistribuida?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getMetasPorIE(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/metas/obtenerporie?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getMetasResumenHorasPorIE(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/metas/obtener-resumen-horas-totales?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getMetasTotalBolsaHorasPorIE(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/metas/obtenerbolsahorasporie?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getAfinidadAreaCurricularEspecialidad(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/afinidadareacurricularespecialidad/obtener?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getTotalBolsaHorasPorUnidadEjecutora(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/bolsahoras/resumentotalesporunidadejecutora?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    grabarParametroInicial(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial`;
        return this._http.post<any>(`${url}`, data);
    }
    actualizarParametroInicial(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial/actualizar`;
        return this._http.put<any>(`${url}`, data);
    }
    finalizarParametroInicial(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial/finalizar`;
        return this._http.put<any>(`${url}`, data);
    }
    actualizarMetasPorIE(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/metas/actualizar`;
        return this._http.put<any>(`${url}`, data);
    }
    obtenerParametroInicial(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial/obtener?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerHorasMinimasPlanEstudio(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/planestudiocontextualizado/obtenerhorasminimasplan?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerHoraLectivaNoLectivaContextualizado(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/horalectivanolectivacontextualizado/obtener?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerParametroInicialPorId(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial/obtenerporid?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerDetalleParametroInicialPorIdCab(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/detalleparametroinicial/listar?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerParametroInicialPorCentroAnio(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial/obtenerporcentrotrabajoanio?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerParametroInicialPorCentroAnioProceso(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial/obtenerporcentrotrabajoanioproceso?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerPlazaPorId(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plaza/obtener?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerPlazaPorCodigo(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plaza/obtenerporcodigo?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerPlazaPorCodigoPlaza(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plaza/obtenerporcodigoplaza?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlazaCuadroHoraExportar(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/exportar`;
        return this._http.post<any>(`${url}`, body);
    }
    grabarPlazasCuadroHoras(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/guardarbloque`;
        return this._http.post<any>(`${url}`, body);
    }
    distribuirPlazasCuadroHoras(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/distribuirnombrados`;
        return this._http.post<any>(`${url}`, body);
    }
    modificarDistribucion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/horadistribuida/modificar`;
        return this._http.post<any>(`${url}`, body);
    }
    obtenerHoraPorSemanaNoDistribuido(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/horasnodistribuidas/obtenerhorasemanapendiente?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlazaConvocarCuadroHoraPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/convocar?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlazaCuadroHoraResultadoFinalPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/distribucionfinalizada?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlazaCuadroHoraResultadoPreliminarPaginado(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/distribucionpreliminar?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }

    getPlazaCuadroHoraFechaCorte(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/fechacorte?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlazaHoraAsignadaDistribucionPaginado(body: any) {

        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/horaasignada?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getPlazaHoraPendienteDistribuirPaginado(body: any) {

        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/horapendientedistribuir?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    grabarReclamo(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/guardarreclamo`;
        return this._http.post<any>(`${url}`, data);
    }
    finalizarEtapa(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/finaalizaretapa`;
        return this._http.post<any>(`${url}`, body);
    }
    finalizarPlazaCuadroHora(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/finalizar`;
        return this._http.put<any>(`${url}`, body);
    }
    finalizarPreliminarDistribucion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/finalizarpreliminar`;
        return this._http.put<any>(`${url}`, body);
    }
    finalizarDistribucion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/finalizardistribucion`;
        return this._http.put<any>(`${url}`, body);
    }
    finalizarModificacion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/finalizarmodificacionpreferencia`;
        return this._http.put<any>(`${url}`, body);
    }
    estaFinalizadoDistribucion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/situaciondistribucionfinalizado?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    estaFinalizadoValidacion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/situacionvalidacionfinalizado?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    exportarDistribucionPre(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/exportarpreliminar`;
        return this._http.post<any>(`${url}`, body);
    }
    exportarDistribucionFin(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/exportarfinalizar`;
        return this._http.post<any>(`${url}`, body);
    }
    getTotalizadoDistribucion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/obtenertotalizadodistribucion?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getSituacionDistribucion(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/obtenersituaciondistribucion?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }



    getDatosServidorPublicoCuadroHora(body: any) {

        let url = `${this.basePath.cuadroHorasApi}/plazacuadrohoras/obtenerservidorpublico?${this.formatParameter(body, false)}`;
        return this._http.get<any>(`${url}`);
    }

    ____getComboInstancia = (activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) queryParam = queryParam.append("activo", activo);

        let url = this.basePath.cuadroHorasApi + "/instancia";
        return this._http.get<any>(url, { params: queryParam });
    };
    getComboSubinstancia = (idInstancia: any, activo: any = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) queryParam = queryParam.append("activo", activo);
        if (idInstancia !== null) queryParam = queryParam.append("idInstancia", idInstancia);

        let url = this.basePath.cuadroHorasApi + "/instancia/subinstancias";
        return this._http.get<any>(url, { params: queryParam });
    };

    getProcesoExportar(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/proceso/exportar`;
        return this._http.post<any>(`${url}`, body);
    }
    getTipoDocumentos() {
        let url = `${this.basePath.cuadroHorasApi}/catalogoitem/obtenertipodocumento`;
        return this._http.get<any>(`${url}`);
    }

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
        // queryParam = queryParam.set('codigoSede', '0');// this.storageService.getPassportRolSelected().CODIGO_SEDE);

        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);
        let url = this.basePath.cuadroHorasApi + "/servidor-publico/buscarservidorpublico";
        return this._http.get<any>(url, { params: queryParam });

    };

    getComboRegimenLaboral = (activo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        const codigoRolPassport = "001";//this.storageService.getPassportRolSelected().CODIGO_ROL;
        queryParam = queryParam.set('codigoRolPassport', codigoRolPassport);
        let url = this.basePath.cuadroHorasApi + "/regimen-laboral";
        return this._http.get<any>(url, { params: queryParam });
        //  return this.restangular.all('regimeneslaborales').get(queryParam);
    };
    obtenerParametroInicialPorCentroTrabajo(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/parametroinicial/obtenerporcentrotrabajo?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    eliminarCuadroHoraVacante(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazavacante/eliminarplazacuadrohora`;
        return this._http.put<any>(`${url}`, data);
    }
    eliminarCuadroHoraBolsaHoras(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazabolsahoras/eliminarplazacuadrohora`;
        return this._http.put<any>(`${url}`, data);
    }

    obtenerPlazaVacante(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazavacante/obtenerporhoralectivaPorId?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerPlazaBolsaHoras(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/plazabolsahoras/obtenerporhoralectivaPorId?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerHorasNoDistribuidas(idParametroInicial) {//idProceso, idCentroTrabajo) {
        //let url = `${this.basePath.cuadroHorasApi}/horasnodistribuidas/obtenerpendientedistribuir/${idProceso}/${idCentroTrabajo}`;
        let url = `${this.basePath.cuadroHorasApi}/horasnodistribuidas/obtenerpendientedistribuir/${idParametroInicial}`;
        console.log(url);
        return this._http.get<any>(`${url}`);
    }

    obtenerPlazasVacantesPorCentroTrabajo(request) {
        let url = `${this.basePath.cuadroHorasApi}/plazavacante/obtenerporcentrotrabajo?${this.formatParameter(request, false)}`;
        return this._http.get<any>(`${url}`);
    }
    /****BEGIN CONSOLIDADO PLAZAS*/
    obtenerParametroInicialConsolidado(idConsolidado) {
        let url = `${this.basePath.cuadroHorasApi}/consolidadoplaza/consolidado/${idConsolidado}`;
        return this._http.get<any>(`${url}`);
    }
    aprobarConsolidadoPlaza(body) {
        let url = `${this.basePath.cuadroHorasApi}/consolidadoplaza/detalle/aprobar`;
        return this._http.put<any>(`${url}`, body);
    }
    aprobarMasivoConsolidadoPlaza(body) {
        let url = `${this.basePath.cuadroHorasApi}/consolidadoplaza/masivo/aprobar`;
        return this._http.put<any>(`${url}`, body);
    }
    rechazarConsolidadoPlaza(body) {
        console.log("bodyyyy", body);
        let url = `${this.basePath.cuadroHorasApi}/consolidadoplaza/detalle/rechazar`;
        return this._http.put<any>(`${url}`, body);
    }
    obtenerConsolidadoPlaza(idConsolidado) {
        let url = `${this.basePath.cuadroHorasApi}/consolidadoplaza/obtener/${idConsolidado}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerConsolidadoReporteAnexos(request: any) {
        let url = `${this.basePath.cuadroHorasApi}/consolidadoreporteanexos/lista?${this.formatParameter(request, false)}`;
        return this._http.get<any>(`${url}`);
    }
    exportarConsolidadoPlaza(body: any) {
        let url = `${this.basePath.cuadroHorasApi}/consolidadoplaza/exportar`;
        return this._http.post<any>(`${url}`, body);
    }
    /****END CONSOLIDADO PLAZAS*/
    // obtenerPlazaPorId(idPlaza) {
    //     let url = `${this.basePath.cuadroHorasApi}/plaza/obtener/${idPlaza}`;
    //     return this._http.get<any>(`${url}`);
    // }
    // obtenerPlazaPorId(data: any) {
    //     let url = `${this.basePath.cuadroHorasApi}/plaza/obtener?${this.formatParameter(data, false)}`;
    //     return this._http.get<any>(`${url}`);
    //   }
    // guardar(body: any) {
    //     console.log(body); 
    //     let url = `${this.basePath.cuadroHorasApi}/plazavacante/guardar`;
    //     return this._http.post<any>(`${url}`, body);
    // }
    obtenerHorasLectivas(request) {
        let url = `${this.basePath.cuadroHorasApi}/plazavacante/obtenerporhoralectiva?${this.formatParameter(request, false)}`;
        console.log(url);
        return this._http.get<any>(`${url}`);
    }
    consultaAnexo1(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/anexo1?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    consultaAnexo2(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/anexo2?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    consultaAnexo2HLD(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/anexo2HLD?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    consultaAnexo3(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/anexo3?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    consultaAnexo4(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/anexo4?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }
    consultaAnexo5(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/anexo5?${this.formatParameter(param, false)}`;
        return this._http.get<any>(`${url}`);
    }


    exportarPdfAnexo1(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/exportaranexo1?${this.formatParameter(param, false)}`;
        return this._http.post<any>(`${url}`, param);
    }
    exportarPdfAnexo2(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/exportaranexo2?${this.formatParameter(param, false)}`;
        return this._http.post<any>(`${url}`, param);
    }
    exportarPdfAnexo3(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/exportaranexo3?${this.formatParameter(param, false)}`;
        return this._http.post<any>(`${url}`, param);
    }
    exportarPdfAnexo4(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/exportaranexo4?${this.formatParameter(param, false)}`;
        return this._http.post<any>(`${url}`, param);
    }
    exportarPdfAnexo5(param: any) {
        let url = `${this.basePath.cuadroHorasApi}/reportes/exportaranexo5?${this.formatParameter(param, false)}`;
        return this._http.post<any>(`${url}`, param);
    }
    obtenerMaestroPermisoConsolidadoAnexos(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/maestropermiso/permisoconsolidadoanexos?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    obtenerMaestroPermisoDesarrollo(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/maestropermiso/permisodesarrollo?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
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
        let url = this.basePath.cuadroHorasApi + "/plaza";
        return this._http.get<any>(url, { params: queryParam });
        // return this.restangular.all('plazas').get(queryParam);
    };
    /*FIN ADECUACION CUADRO HORA TOTAL - PLATAFORMA*/

    /* INICIO DE METODOS RESOLUCION*/

    getTiposDocumentoSustento(): Observable<any> {

        let url = this.basePath.cuadroHorasApi + "/tiposdocumentossustento";
        return this._http.get<any>(`${url}`);
    }


    getTiposFormatoSustento(): Observable<any> {
        let url = this.basePath.cuadroHorasApi + "/tiposformatosustento";
        return this._http.get<any>(`${url}`);
    }

    getTiposResolucion(): Observable<any> {
        let url = this.basePath.cuadroHorasApi + "/tiposresolucion";
        return this._http.get<any>(`${url}`);
    }

    getRegimenGrupoAccion = (): Observable<any> => {
        //idProceso: any, codigoGrupoAccion: any, codigoAccion: any
        // let queryParam = new HttpParams()
        //   .set("idProceso", idProceso)
        //   .set("codigoGrupoAccion", codigoGrupoAccion)
        //   .set("codigoAccion", codigoAccion);

        let url = this.basePath.cuadroHorasApi + "/regimengrupoaccion";
        return this._http.get<any>(`${url}`);
    }
    crearProyectoResolucion(proyectoResolucion: any): Observable<any> {

        let url = this.basePath.cuadroHorasApi + "/comite/generarproyectoresolucion";
        return this._http.post<any>(`${url}`, proyectoResolucion);
    }

    existeBolsaHorasIE(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/bolsahoras/existebolsa?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    existeMetasIE(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/metas/existemeta?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    getBolsaPorIE(data: any) {
        let url = `${this.basePath.cuadroHorasApi}/bolsahoras/obtenerporie?${this.formatParameter(data, false)}`;
        return this._http.get<any>(`${url}`);
    }
    /* FIN RESOLUCION*/


    formatParameter(object: any, pagination: boolean = false): string {
        var encodedString = '';
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                if (encodedString.length > 0) encodedString += '&';

                if (!pagination)
                    encodedString += encodeURI(prop + '=' + (object[prop] ?? ''));
                else if (['field', 'order', 'page', 'size'].includes(prop))
                    encodedString += encodeURI(prop + '=' + (object[prop] ?? ''));
                else
                    encodedString += encodeURI(
                        'value.' + prop + '=' + (object[prop] ?? '')
                    );
            }
        }
        return encodedString;
    }

}
