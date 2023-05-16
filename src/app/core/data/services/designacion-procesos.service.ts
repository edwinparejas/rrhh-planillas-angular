import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { DesignacionProcesosRestangularService } from './resources/designacion-procesos-restangular.service';

@Injectable({
  providedIn: 'root'
})
export class DesignacionProcesosService {

  constructor(private restangular: DesignacionProcesosRestangularService) {
  }

  getComboRegimenesLaborales = (pCodigoRolPassport: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("codigoRolPassport", pCodigoRolPassport);
    return this.restangular.all("regimeneslaborales").get(queryParam);
  };

  getComboEstadosDesignacion = (): Observable<any> => {
    return this.restangular.all("estadosproceso").get();
  };

  getComboTiposDocumentoIdentidad = (): Observable<any> => {
    return this.restangular.all("tiposdocumentoidentidad").get();
  };

  getComboTiposDocumentoSustento = (): Observable<any> => {
    return this.restangular.all("tiposdocumentosustento").get();
  };

  getComboTiposFormatoSustento = (): Observable<any> => {
    return this.restangular.all("tiposformatosustento").get();
  };

  getInstancias = (pIdCentroTrabajo: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idCentroTrabajo", pIdCentroTrabajo);
    return this.restangular.all("instancias").all("instanciascentrotrabajo").get(queryParam);
  };

  getSubInstancias = (pIdDre: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idDre", pIdDre);
    return this.restangular.all("subinstancias").get(queryParam);
  };

  buscarPersona = (pIdipoDocumentoIdentidad: any, pNumeroDocumentoIdentidad: any): Observable<any> => {
    let queryParam = new HttpParams()
      .set("idTipoDocumentoIdentidad", pIdipoDocumentoIdentidad)
      .set("numeroDocumentoIdentidad", pNumeroDocumentoIdentidad);
    return this.restangular.all("personas").get(queryParam);
  };


  consultarDesignaciones = (
    data: any,
    pageIndex: any,
    pageSize: any
  ): Observable<any> => {

    let queryParam = new HttpParams();
    if (data.anio !== null && parseInt(data.anio) > 0) {
      queryParam = queryParam.set("anio", data.anio);
    }
    if (data.idRegimenLaboral !== null && parseInt(data.idRegimenLaboral) > 0) {
      queryParam = queryParam.set("idRegimenLaboral", data.idRegimenLaboral);
    }
    if (data.idEstado !== null && parseInt(data.idEstado) > 0) {
      queryParam = queryParam.set("idEstado", data.idEstado);
    }

    queryParam = queryParam.set("codigoRolPassport", data.codigoRolPassport);
    queryParam = queryParam.set("paginaActual", pageIndex);
    queryParam = queryParam.set("tamanioPagina", pageSize);
    return of({
      result: true,
      data: [{
        registro:1,
        idProceso:1,
        idRegimenLaboral:5,
        idTipoProceso:12,
        codigo:'003',
        tipoProceso:'DESIGNACIÓN',
        regimenLaboral:'LEY 29944	',
        grupoCargo:'DIRECTOR/ JEFE DE GESTIÓN PEDAGÓGICA DE DRE/UGEL	',
        etapaFase:'PRIMERA',
        numeroConvocatoria:'ÚNICA',
        fechaCreacion:'24/11/2020',
        estado:'REGISTRADO'       
      },
      {
        registro:2,
        idProceso:2,
        idRegimenLaboral:5,
        idTipoProceso:12,
        codigo:'003',
        tipoProceso:'DESIGNACIÓN',
        regimenLaboral:'LEY 29944	',
        grupoCargo:'DIRECTOR/ JEFE DE GESTIÓN PEDAGÓGICA DE DRE/UGEL	',
        etapaFase:'EXCEPCIONAL',
        numeroConvocatoria:'ÚNICA',
        fechaCreacion:'24/11/2020',
        estado:'EN PROCESO'       
      }]
    });


    //return this.restangular.all("designaciones").get(queryParam);
  }

  exportarDesignaciones = (
    data: any
  ): Observable<any> => {
    let queryParam = new HttpParams();
    if (data.anio !== null && parseInt(data.anio) > 0) {
      queryParam = queryParam.set("anio", data.anio);
    }
    if (data.idRegimenLaboral !== null && parseInt(data.idRegimenLaboral) > 0) {
      queryParam = queryParam.set("idRegimenLaboral", data.idRegimenLaboral);
    }
    if (data.idEstado !== null && parseInt(data.idEstado) > 0) {
      queryParam = queryParam.set("idEstado", data.idEstado);
    }

    queryParam = queryParam.set("codigoRolPassport", data.codigoRolPassport);

    return this.restangular.all("procesos").all("exportar").download(queryParam);
  }

  getDesignacion = (
    pIdProceso: any,
  ): Observable<any> => {
    return this.restangular.one("procesos", pIdProceso).get();
  }

  searchAdjudicacionEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
    const filtro = {
        ...data,
        paginaActual: parseInt(pageIndex),
        tamanioPagina: parseInt(pageSize)
    };
    return this.restangular.all("adjudicaciones").all("buscar").post(filtro);
  }
  
  searchCalificacionEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
    const filtro = {
        ...data,
        paginaActual: parseInt(pageIndex),
        tamanioPagina: parseInt(pageSize)
    };    
    return this.restangular.all("calificaciones").all("buscar").post(filtro);
  }
  
  searchPostulanteEncargaturaPaginado(data: any, pageIndex, pageSize): Observable<any> {
    const filtro = {
        ...data,
        paginaActual: parseInt(pageIndex),
        tamanioPagina: parseInt(pageSize)
    };
    return this.restangular.all("postulaciones").all("buscar").post(filtro);
  }

}