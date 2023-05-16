import { Injectable } from '@angular/core';
import { PlazaAdecuacionRestangularService } from './resources/plaza-adecuacion-restangular.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlazaAdecuacionService {

  constructor(private restangular: PlazaAdecuacionRestangularService) { }

  accesoRolPassport(codigoRolPassport: any, codigoTipoSede: any): Observable<any> {
    let queryParam = new HttpParams();
   
    if (codigoRolPassport) { queryParam = queryParam.set('codigoRolPassport', codigoRolPassport); }
    if (codigoTipoSede) { queryParam = queryParam.set('codigoTipoSede', codigoTipoSede); }
    return this.restangular.all('rolespassport').get(queryParam);
  }

  entidadPassport(codigoEntidadSede: any) {
    let queryParam = new HttpParams();
    if (codigoEntidadSede) { queryParam = queryParam.set('codigoEntidadSede', codigoEntidadSede); }
    return this.restangular.all('entidades').get(queryParam);
  }

  listarEstado() {
    return this.restangular.all('estados').get();
  }

  listarAccion(idNivelInstancia: any, idGrupoAccion: any) {
    let queryParam = new HttpParams();
    if (idNivelInstancia !== null && idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', idNivelInstancia); }
    if (idGrupoAccion !== null && idGrupoAccion > 0) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
    return this.restangular.all('acciones').get(queryParam);
  }


  getModalidadEducativa() {
      return this.restangular.all("modalidadeseducativa").get();
  }

  getNivelEducativo(idModalidadEducativa) {
      return this.restangular
          .one("niveleseducativo", idModalidadEducativa)
          .get();
  }

  
  listarMotivosRechazo() {
    return this.restangular.all('motivosrechazo').get();
  }

  listarMotivoAccion(idNivelInstancia: any, idRolPassport: any, idGrupoAccion: any, idAccion: any, activo: any) {
    let queryParam = new HttpParams();
    if (idNivelInstancia !== null && idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', idNivelInstancia); }
    if (idRolPassport !== null && idRolPassport > 0) { queryParam = queryParam.set('idRolPassport', idRolPassport); }
    if (idGrupoAccion !== null && idGrupoAccion > 0) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
    if (idAccion !== null && idAccion > 0) { queryParam = queryParam.set('idAccion', idAccion); }
    if (activo !== null) { queryParam = queryParam.set('activo', activo); }
    return this.restangular.all('motivosaccion').get(queryParam);
  }

  buscarCodigoPlaza(data: any) {
    let queryParam = new HttpParams();
    if (data.idNivelInstancia) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
    if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
    if (data.idEntidadSede) { queryParam = queryParam.set('idEntidadSede', data.idEntidadSede); }
    if (data.codigoPlaza != null) { queryParam = queryParam.set('codigoPlaza', data.codigoPlaza); }
    if (data.editar != null) { queryParam = queryParam.set('editar', data.editar); }
    return this.restangular.all('plazas').get(queryParam);
  }

  listarRegimenLaboral(idNivelInstancia: any, idRolPassport: any, idGrupoAccion: any, idAccion: any, idMotivoAccion: any) {
    let queryParam = new HttpParams();
    if (idNivelInstancia && idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', idNivelInstancia); }
    if (idRolPassport && idRolPassport > 0) { queryParam = queryParam.set('idRolPassport', idRolPassport); }
    if (idGrupoAccion && idGrupoAccion > 0) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
    if (idAccion && idAccion > 0) { queryParam = queryParam.set('idAccion', idAccion); }
    if (idMotivoAccion && idMotivoAccion > 0) { queryParam = queryParam.set('idMotivoAccion', idMotivoAccion); }
    return this.restangular.all('regimeneslaborales').get(queryParam);
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

  listarInstancia() {
    return this.restangular.all('instancias').get();
  }

  listarSubinstancia(idInstancia: any) {
    
    return this.restangular.one('instancias', idInstancia).all('subinstancias').get();
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

  crearAdecuacion(data: any): Observable<any> {
    return this.restangular.all('propuestasadecuaciones').post(data);
  }

  eliminar(datos: any): Observable<any> {
    return this.restangular.all('propuestasadecuaciones').all("eliminar").post(datos);
  }

  validarAdecuacion(data: any): Observable<any> {
    console.log(data);
    return this.restangular.all('propuestasadecuaciones').all("validar").post(data);
  }

  consultaPropuestaAdecuacion(idPropuestaAdecuacion: any) {
    return this.restangular.one('propuestasadecuaciones', idPropuestaAdecuacion).get();
  }

  modificarPropuestaAdecuacion(data: any): Observable<any> {
    return this.restangular.all('propuestasadecuaciones').patch(data);
  }

  visualizarPropuestaAdecuacion(idPropuestaAdecuacion: any): Observable<any> {
    return this.restangular.one('propuestasadecuaciones', idPropuestaAdecuacion).all('visualizar').get();
  }

  validacionCodigoApropacion(data: any): Observable<any> {
    return this.restangular.all('propuestasadecuaciones').all("validadacionCodigoApropacion").post(data);
  }


  buscarDocumentosustento(data: any, pageIndex, pageSize): Observable<any> {
    data.paginaActual = pageIndex;
    data.tamanioPagina = pageSize;
    return this.restangular.all('documentossustento').post(data);
  }
  
  visualizarDocumentosustento(data: any): Observable<any> {
    return this.restangular.all('documentossustento').all("visualizar").post(data);
  }

  listaPropuestaAdecuacion(data: any, pageIndex: any, pageSize: any) {
    let queryParam = new HttpParams();
    if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
    if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
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
    if ((data.institucionEducativa || "").trim().length !== 0) queryParam = queryParam.set("institucionEducativa", data.institucionEducativa);
    if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) queryParam = queryParam.set("idTipoCentroTrabajo", data.idTipoCentroTrabajo);
    if (data.codigoRol) { queryParam = queryParam.set('codigoRol', data.codigoRol); }

    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
    queryParam = queryParam.set('codigoSede', data.codigoSede); 
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);
    return this.restangular.all('propuestasadecuaciones').get(queryParam);
  }

  descargarPropuestaAdecuacion(data: any) {
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
    if (data.codigoNivelInstancia) { queryParam = queryParam.set('codigoNivelInstancia', data.codigoNivelInstancia); }
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
    if ((data.institucionEducativa || "").trim().length !== 0) queryParam = queryParam.set("institucionEducativa", data.institucionEducativa);
    if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) queryParam = queryParam.set("idTipoCentroTrabajo", data.idTipoCentroTrabajo);
    if (data.codigoRol) { queryParam = queryParam.set('codigoRol', data.codigoRol); }

    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
    queryParam = queryParam.set('codigoSede', data.codigoSede); 
    return this.restangular.all('propuestasadecuaciones').all('excel').get(queryParam);
  }

  listarTiposPlaza(): Observable<any> {
    return this.restangular.all('tiposplaza').get();
  }

  listarTipoCentroTrabajo(pCodigoNivelInstancia: any) {
    let queryParam = new HttpParams();
    if (pCodigoNivelInstancia && pCodigoNivelInstancia > 0) { queryParam = queryParam.set('codigoNivelInstancia', pCodigoNivelInstancia); }
    return this.restangular.all('tiposcentrotrabajo').get(queryParam);
  }

  listarRegimenesLaborales(pIdTipoPlaza ,pCodigoRol): Observable<any> {
    let queryParam = new HttpParams();
    if (pIdTipoPlaza && pIdTipoPlaza > 0) { queryParam = queryParam.set('idTipoPlaza', pIdTipoPlaza); }
    if ((pCodigoRol || '').trim().length !== 0) { queryParam = queryParam.set('codigoRol', pCodigoRol); }
    return this.restangular.all('regimeneslaborales').get(queryParam);
  }

  listarUnidadesOrganizacionales(pIdCentroTrabajo: any, pIdUnidadOrganizacionalPadre?: any) {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('idCentroTrabajo', pIdCentroTrabajo);
    if (pIdUnidadOrganizacionalPadre) {
      queryParam = queryParam.set('idUnidadOrganizacionalPadre', pIdUnidadOrganizacionalPadre);
    }
    return this.restangular.all('unidadesorganizacionales').get(queryParam);
  }

  buscarCentroTrabajo(data: any) {
    let queryParam = new HttpParams();
    if (data.idNivelInstancia) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
    if (data.idEntidadSede) { queryParam = queryParam.set('idEntidadSede', data.idEntidadSede); }
    if ((data.codigoCentroTrabajo || '').trim().length !== 0) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
    if (data.registrado !== null) { queryParam = queryParam.set('registrado', data.registrado); }
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
    if (data.idModalidadEducativa !== null && data.idModalidadEducativa > 0) {queryParam = queryParam.set( "idModalidadEducativa", data.idModalidadEducativa);}
    if (data.idNivelEducativo !== null && data.idNivelEducativo > 0) {queryParam = queryParam.set("idNivelEducativo", data.idNivelEducativo);}

    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);
    return this.restangular.all('centrostrabajo').get(queryParam);
  }

  generarProyectoResolucion = (
    data: any
  ): Observable<any> => {
    return this.restangular.all("propuestasadecuaciones").all("proyectoresolucion").post(data);
  }
  enviarAccionesGrabadas = (
    data: any
  ): Observable<any> => {
    return this.restangular.all("propuestasadecuaciones").all("acciongrabada").post(data);
  }

  aprobar = (data: any): Observable<any> => {
    console.log(data);
    return this.restangular.all("propuestasadecuaciones").all("aprobar").post(data);
  }

  rechazar = (data: any): Observable<any> => {
    return this.restangular.all("propuestasadecuaciones").all("rechazar").post(data);
  }
}