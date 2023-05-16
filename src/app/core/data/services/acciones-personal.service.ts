import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccionesPersonalRestangularService } from './resources/acciones-personal-restangular.service';

@Injectable({
  providedIn: 'root'
})
export class AccionesPersonalService {

  constructor(private restangular: AccionesPersonalRestangularService) {
  }

  getComboRegimenesLaborales = (pIdTipoCentroTrabajo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idRolUsuario", pIdTipoCentroTrabajo);
    return this.restangular.all("regimeneslaborales").get(queryParam);
  };

  buscarPlaza(data: any, paginaActual: any, tamanioPagina: any): Observable<any> {
    let queryParam: HttpParams = new HttpParams()
      .set('paginaActual', paginaActual)
      .set('tamanioPagina', tamanioPagina);
    return this.restangular.all("Plazas").all("consultar").post(data, queryParam);
  }

  getPlazaPorCodigo(pCodigo: any): Observable<any> {
    let queryParam: HttpParams = new HttpParams()
      .set('codigoPlaza', pCodigo);
    return this.restangular.all("Plazas").all("consultar").get(queryParam);
  }

  getCentroTrabajoPorCodigo(pCodigo: any): Observable<any> {
    let queryParam: HttpParams = new HttpParams()
      .set('codigoCentroTrabajo', pCodigo);
    return this.restangular.all("CentrosTrabajo").get(queryParam);
  }

  getTiposCentroTrabajo(): Observable<any> {
    return this.restangular.all("TiposCentroTrabajo").get();
  }

  getTiposDocumentoIdentidad(): Observable<any> {
    return this.restangular.all("TiposDocumentoIdentidad").get();
  }

  consultarAdenda(data: any, paginaActual: any, tamanioPagina: any): Observable<any> {
    return of({ data: adenda, result: true });
  }

  buscarCentroTrabajo(data: any, paginaActual: any, tamanioPagina: any): Observable<any> {
    return of(null);
  }

  buscarServidorPublico(data: any, paginaActual: any, tamanioPagina: any): Observable<any> {
    let queryParam: HttpParams = new HttpParams()
      .set('paginaActual', paginaActual)
      .set('tamanioPagina', tamanioPagina);
    return this.restangular.all("ServidoresPublicos").all("consultar").post(data, queryParam);
  }

  getServidorPublico(pIdTipoDocumento: any, pNumeroDocumento: any): Observable<any> {
    let queryParam: HttpParams = new HttpParams()
      .set('idTipoDocumentoIdentidad', pIdTipoDocumento)
      .set('numeroDocumentoIdentidad', pNumeroDocumento);
    return this.restangular.all("ServidoresPublicos").get(queryParam);
  }
}

export const adenda: any[] = [
  {
    "idContrato": 1,
    "numeroContrato": "000001",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'ADENDA CULMINADO',
    "idEstado": 7,
    "registro": 1,
    "total": 9
  },
  {
    "idContrato": 2,
    "numeroContrato": "000002",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'DESVINCULACIÓN',
    "accion": "EXTINCIÓN DEL CONTRATO",
    "motivoAccion": "DECISIÓN UNILATERAL DEL CONTRATANTE",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACEVEDO MATAMOROS FERNANDO",
    "codigoPlaza": "EXE0018904",
    "cargo": "ABOGADO",
    "centroTrabajo": "UGEL AREQUIPA SUR",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": false,
    "estado": 'ADENDA SIN FIRMA',
    "idEstado": 5,
    "registro": 2,
    "total": 9
  },
  {
    "idContrato": 3,
    "numeroContrato": "000003",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'ADENDA VIGENTE',
    "idEstado": 6,
    "registro": 3,
    "total": 9
  }, {
    "idContrato": 4,
    "numeroContrato": "000003",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'CONTRATO SIN FIRMA',
    "idEstado": 2,
    "registro": 4,
    "total": 9
  },
  {
    "idContrato": 5,
    "numeroContrato": "000005",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'CONTRATO VIGENTE',
    "idEstado": 4,
    "registro": 5,
    "total": 9
  },
  {
    "idContrato": 6,
    "numeroContrato": "000006",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'CONTRATO CULMINADO',
    "idEstado": 3,
    "registro": 6,
    "total": 9
  },
  {
    "idContrato": 7,
    "numeroContrato": "000007",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'ELIMINADO',
    "idEstado": 1,
    "registro": 7,
    "total": 9
  },
  {
    "idContrato": 8,
    "numeroContrato": "000008",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'CONTRATO CULMINADO',
    "idEstado": 3,
    "registro": 8,
    "total": 9
  },
  {
    "idContrato": 9,
    "numeroContrato": "000009",
    "fechaContrato": "03/03/2020",
    "grupoAccion": 'VINCULACIÓN',
    "accion": "CONTRATAR",
    "motivoAccion": "POR CONCURSO	",
    "tipoDocumento": "DNI",
    "numeroDocumento": "23274234",
    "nombresCompletos": "ACLARI RAMOS YOLANDA",
    "codigoPlaza": "EXE0018904",
    "cargo": "SECRETARIA",
    "centroTrabajo": "I.E. MIGUEL GRAU SEMINARIO",
    "fechaInicio": "01/01/2020",
    "fechaFin": "31/07/2020",
    "tieneAdenda": true,
    "estado": 'ADENDA VIGENTE',
    "idEstado": 6,
    "registro": 9,
    "total": 9
  },
];