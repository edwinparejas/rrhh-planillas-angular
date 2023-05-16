import { HttpParams } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SolicitudesRestangularService } from './resources/solicitudes-restangular.service';
import { convertObjectToGetParams } from "@minedu/functions/http.helpers";
import { environment } from "environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  constructor(private restangular: SolicitudesRestangularService) {
  }

  getComboTiposDocumentoIdentidad = (): Observable<any> => {
    return this.restangular.all('tiposdocumentoidentidad').get();
  }

  getComboEstadosSolicitud = (flagAtencion: any): Observable<any> => {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('flagAtencion', flagAtencion);
    return this.restangular.all('estadossolicitud').get(queryParam);
  }

  getComboTiposSolicitud = (): Observable<any> => {
    return this.restangular.all('tipossolicitud').get();
  }

  getComboTiposDocumentoSolicitud = (): Observable<any> => {
    return this.restangular.all('tiposdocumentosolicitud').get();
  }

  getComboTiposResolucion = (): Observable<any> => {
    return this.restangular.all('tiposresolucion').get();
  }

  getComboRegimenesLaborales = (idTipoSolicitud: string): Observable<any> => {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('idSistema', this.usuarioBandeja.CODIGO_SISTEMA);
    if (idTipoSolicitud !== null) { queryParam = queryParam.set('idTipoSolicitud', idTipoSolicitud); }
    return this.restangular.all('regimeneslaborales').get(queryParam);
  }

  getComboGruposAccion = (idTipoSolicitud: string, idRegimenLaboral: string): Observable<any> => {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('idSistema', this.usuarioBandeja.CODIGO_SISTEMA);
    if (idTipoSolicitud !== null) { queryParam = queryParam.set('idTipoSolicitud', idTipoSolicitud); }
    if (idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
    return this.restangular.all('gruposaccion').get(queryParam);
  }

  getComboAcciones = (idTipoSolicitud: string, idRegimenLaboral: string, idGrupoAccion: string): Observable<any> => {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('idSistema', this.usuarioBandeja.CODIGO_SISTEMA);
    if (idTipoSolicitud !== null) { queryParam = queryParam.set('idTipoSolicitud', idTipoSolicitud); }
    if (idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
    if (idGrupoAccion !== null) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
    return this.restangular.all('acciones').get(queryParam);
  }

  getComboMotiviosAccion = (idTipoSolicitud: string, idRegimenLaboral: string, idGrupoAccion: string, idAccion: string): Observable<any> => {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('idSistema', this.usuarioBandeja.CODIGO_SISTEMA);
    if (idTipoSolicitud !== null) { queryParam = queryParam.set('idTipoSolicitud', idTipoSolicitud); }
    if (idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
    if (idGrupoAccion !== null) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
    if (idAccion !== null) { queryParam = queryParam.set('idAccion', idAccion); }
    return this.restangular.all('motivosaccion').get(queryParam);
  }

  bandejasolicitudes(solicitud: any, paginaActual: any, tamanioPagina: any): Observable<any> {
    let queryParam: HttpParams = new HttpParams()
      .set('paginaActual', paginaActual)
      .set('tamanioPagina', tamanioPagina);
    return this.restangular.all("buscar").post(solicitud, queryParam);
  }

  exportarSolicitudes(solicitud: any) {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('idSistema', this.usuarioBandeja.CODIGO_SISTEMA);
    queryParam = queryParam.set('idRolPassport', this.usuarioBandeja.ID_ROL_PASSPORT);
    if (solicitud.idTipoDocumentoIdentidad !== null) { queryParam = queryParam.set('idTipoDocumentoIdentidad', solicitud.idTipoDocumentoIdentidad); }
    if (solicitud.numeroDocumentoIdentidad !== null) { queryParam = queryParam.set('numeroDocumentoIdentidad', solicitud.numeroDocumentoIdentidad); }
    if (solicitud.primerApellido !== null) { queryParam = queryParam.set('primerApellido', solicitud.primerApellido); }
    if (solicitud.segundoApellido !== null) { queryParam = queryParam.set('segundoApellido', solicitud.segundoApellido); }
    if (solicitud.nombres !== null) { queryParam = queryParam.set('nombres', solicitud.nombres); }
    if (solicitud.idEstadoSolicitud !== null) { queryParam = queryParam.set('idEstadoSolicitud', solicitud.idEstadoSolicitud); }
    if (solicitud.fechaSolicitudDesde !== null) { queryParam = queryParam.set('fechaSolicitudDesde', solicitud.fechaSolicitudDesde); }
    if (solicitud.fechaSolicitudHasta !== null) { queryParam = queryParam.set('fechaSolicitudHasta', solicitud.fechaSolicitudHasta); }
    if (solicitud.idTipoSolicitud !== null) { queryParam = queryParam.set('idTipoSolicitud', solicitud.idTipoSolicitud); }
    if (solicitud.idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', solicitud.idRegimenLaboral); }
    if (solicitud.idGrupoAccion !== null) { queryParam = queryParam.set('idGrupoAccion', solicitud.idGrupoAccion); }
    if (solicitud.idAccion !== null) { queryParam = queryParam.set('idAccion', solicitud.idAccion); }
    if (solicitud.idMotivoAccion !== null) { queryParam = queryParam.set('idMotivoAccion', solicitud.idMotivoAccion); }
    if (solicitud.numeroDocumentoSolicitud !== null) { queryParam = queryParam.set('numeroDocumentoSolicitud', solicitud.numeroDocumentoSolicitud); }
    return this.restangular.all('exportarbandejasolicitudes').getBandejaFile(queryParam);
  }

  bandejaAtenciones(solicitud: any, paginaActual: any, tamanioPagina: any): Observable<any> {
    let queryParam: HttpParams = new HttpParams()
      .set('paginaActual', paginaActual)
      .set('tamanioPagina', tamanioPagina);
    return this.restangular.all("buscaratenciones").post(solicitud, queryParam);
  }

  exportarAtenciones(solicitud: any) {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('idSistema', this.usuarioBandeja.CODIGO_SISTEMA);
    queryParam = queryParam.set('idRolPassport', this.usuarioBandeja.ID_ROL_PASSPORT);
    if (solicitud.idTipoDocumentoIdentidad !== null) { queryParam = queryParam.set('idTipoDocumentoIdentidad', solicitud.idTipoDocumentoIdentidad); }
    if (solicitud.numeroDocumentoIdentidad !== null) { queryParam = queryParam.set('numeroDocumentoIdentidad', solicitud.numeroDocumentoIdentidad); }
    if (solicitud.primerApellido !== null) { queryParam = queryParam.set('primerApellido', solicitud.primerApellido); }
    if (solicitud.segundoApellido !== null) { queryParam = queryParam.set('segundoApellido', solicitud.segundoApellido); }
    if (solicitud.nombres !== null) { queryParam = queryParam.set('nombres', solicitud.nombres); }
    if (solicitud.idEstadoSolicitud !== null) { queryParam = queryParam.set('idEstadoSolicitud', solicitud.idEstadoSolicitud); }
    if (solicitud.fechaSolicitudDesde !== null) { queryParam = queryParam.set('fechaSolicitudDesde', solicitud.fechaSolicitudDesde); }
    if (solicitud.fechaSolicitudHasta !== null) { queryParam = queryParam.set('fechaSolicitudHasta', solicitud.fechaSolicitudHasta); }
    if (solicitud.idTipoSolicitud !== null) { queryParam = queryParam.set('idTipoSolicitud', solicitud.idTipoSolicitud); }
    if (solicitud.idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', solicitud.idRegimenLaboral); }
    if (solicitud.idGrupoAccion !== null) { queryParam = queryParam.set('idGrupoAccion', solicitud.idGrupoAccion); }
    if (solicitud.idAccion !== null) { queryParam = queryParam.set('idAccion', solicitud.idAccion); }
    if (solicitud.idMotivoAccion !== null) { queryParam = queryParam.set('idMotivoAccion', solicitud.idMotivoAccion); }
    if (solicitud.numeroDocumentoSolicitud !== null) { queryParam = queryParam.set('numeroDocumentoSolicitud', solicitud.numeroDocumentoSolicitud); }
    return this.restangular.all('exportarbandejaatenciones').getBandejaFile(queryParam);
  }

  getServidorPublico = (idTipoDocumentoIdentidad: string, numeroDocumentoIdentidad: string): Observable<any> => {
    let queryParam = new HttpParams();
    if (idTipoDocumentoIdentidad !== null) { queryParam = queryParam.set('idTipoDocumentoIdentidad', idTipoDocumentoIdentidad); }
    if (numeroDocumentoIdentidad !== null) { queryParam = queryParam.set('numeroDocumentoIdentidad', numeroDocumentoIdentidad); }
    return this.restangular.all('servidorpublico').get(queryParam);
  }

  RegistrarSolicitud(solicitud: any): Observable<any> {
    return this.restangular.all('solicitudes').post(solicitud);
  }

  getRegistroSolicitudes = (idSolicitud: string): Observable<any> => {
    return this.restangular.one('solicitudes', idSolicitud).get();
  }

  EditarSolicitud(solicitud: any): Observable<any> {
    return this.restangular.one('solicitudes', solicitud.idSolicitud).patch(solicitud);
  }

  AnularSolicitud(solicitud: any): Observable<any> {
    return this.restangular.one(solicitud.idSolicitud, 'anular').patch(solicitud);
  }

  EliminarSolicitud(solicitud: any): Observable<any> {
    return this.restangular.one(solicitud.idSolicitud, 'eliminar').patch(solicitud);
  }

  AtenderSolicitud(solicitud: any): Observable<any> {
    return this.restangular.one(solicitud.idSolicitud, 'atender').patch(solicitud);
  }

  RechazarSolicitud(solicitud: any): Observable<any> {
    return this.restangular.one(solicitud.idSolicitud, 'rechazar').patch(solicitud);
  }

  downloadFile(blob: Blob, nombreFile: string) {
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = nombreFile;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadURL);
    }, 100);
  }

  usuarioBandeja: {
    CODIGO_SISTEMA: "3",
    ID_ROL_PASSPORT: "3",
    USUARIO_SISTEMA: "ADMIN_PERSONAL",
    USUARIO_DNI: "41744434",
  }

}