import { AsistenciaRestangularService } from "./resources/asistencia-restangular.service";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { HttpParams } from "@angular/common/http";
import { convertObjectToGetParams } from "@minedu/functions/http.helpers";
import { query } from "@angular/animations";

@Injectable({
    providedIn: "root",
})
export class AsistenciaService {
 

    constructor(private restangular: AsistenciaRestangularService)
    {}
    findCentroTrabajo = (pCodigoEntidad: any): Observable<any> => {
        let queryParam = new HttpParams()
          .set("codigoSedePassport", pCodigoEntidad);
        return this.restangular.all("centrostrabajo").get(queryParam);
    }
   
    getBandejaConsolidadoAprobacion = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
      
        let queryParam = new HttpParams();
        queryParam = queryParam.set("codigoCentroTrabajo", data.codigoCentroTrabajo);
        if (data.anio !== null && parseInt(data.anio) > 0) {
          queryParam = queryParam.set("anio", data.anio);
        }
        if (data.idMes !== null && parseInt(data.idMes) > 0) {
          queryParam = queryParam.set("idMes", data.idMes);
        }  
        if (data.idEstado !== null && parseInt(data.idEstado) > 0) {
          queryParam = queryParam.set("idEstado", data.idEstado);
        }
    
       
        // queryParam = queryParam.set("paginaActual", pageIndex);
        // queryParam = queryParam.set("tamanioPagina", pageSize);
    
        return this.restangular.all("consolidadoaprobacion").get(queryParam);
    }
    buscarServidorPublico(data: any, paginaActual: any, tamanioPagina: any): Observable<any> {
        
        let queryParam: HttpParams = new HttpParams()
          .set('paginaActual', paginaActual)
          .set('tamanioPagina', tamanioPagina);
        return this.restangular.all("ServidoresPublicos").all("consultar").post(data, queryParam);
      }
    getAsistenciaMensual(data: any): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
        .set("codigoCentroTrabajo", data.codigoCentroTrabajo)
        .set("anio", data.anio);
        return this.restangular.all("controlesasistencia").get(queryParam);
    }
    

    getAsistenciaMensual_(data: any,data_:any): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
        .set("codigoCentroTrabajo", data)
        .set("anio", data_);
        return this.restangular.all("controlesasistencia").get(queryParam);
    }
  
    getListaIncidenciasServidor = (
        idAsistenciaServidor: number      
    ): Observable<any> => {
       
        return this.restangular
            .all(`asistenciasservidor/${idAsistenciaServidor}/fechasIncidenciasAll`)
            .get();
    };


  
    getBandejaCentroTrabajo(data: any,pageIndex: number, pageSize: number): Observable<any> {
        console.log(data);
        let queryParam: HttpParams = new HttpParams()
            .set("anio", data.anio)
            .set("idMes", data.idMes)
            .set("idEstado", data.idEstado)
            .set("codigoCentroTrabajo", data.codigoCentroTrabajo);       
        return this.restangular.all("controlconsolidado").all("CentroTrabajo").get(queryParam);       
    }
  
    getBandejaOmisos(data: any,pageIndex: number, pageSize: number): Observable<any> {
        console.log(data);
        let queryParam: HttpParams = new HttpParams()
        .set("anio", data.anio)
        .set("idMes", data.idMes)
        .set("idEstado", data.idEstado) 
         .set("codigoCentroTrabajo", data.codigoCentroTrabajo);             
    return this.restangular.all("controlconsolidado").all("omisos").get(queryParam);   
    }       

    remitirReportes = (data:any): Observable<any> => { 
        return this.restangular.one('controlesasistencia',data.idControlAsistencia).all('remitirreportes').post(data);  
   
    };

    getMotivoDevolucion =(data:any):Observable<any> => { 

      return this.restangular.one("controlesasistencia",data).all("verMotivoDevolucion").get();    
    };

    verMotivoDevolucion =(idControlAsistencia:any):Observable<any> => { 

        return this.restangular.one("controlconsolidado",idControlAsistencia).all("verMotivoDevolucion").get();    
    };
    verMotivoRechazo =(idControlAsistencia:any):Observable<any> => { 

        return this.restangular.one("controlconsolidado",idControlAsistencia).all("verMotivoRechazo").get();    
    };
    verMotivoDevolucionCompensaciones =(idControlAsistencia:any):Observable<any> => { 

        return this.restangular.one("controlconsolidado",idControlAsistencia).all("verMotivoDevolucionCompensaciones").get();    
    };
   
    devolverReportes = (data:any): Observable<any> => {        
        return this.restangular.one('controlesasistencia',data.idControlAsistencia).all('devolverreportes').post(data);    
    };
    
    buscarCentroTrabajo(data: any, paginaActual: any, tamanioPagina: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idNivelInstancia !== null && data.idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', data.idNivelInstancia); }
        if (data.idInstancia !== null && data.idInstancia > 0) { queryParam = queryParam.set('idInstancia', data.idInstancia); }
        if (data.idSubinstancia !== null && data.idSubinstancia > 0) { queryParam = queryParam.set('idSubinstancia', data.idSubinstancia); }
        if (data.idTipoCentroTrabajo !== null && data.idTipoCentroTrabajo > 0) { queryParam = queryParam.set('idTipoCentroTrabajo', data.idTipoCentroTrabajo); }
        if ((data.institucionEducativa || '').trim().length !== 0) { queryParam = queryParam.set('institucionEducativa', data.institucionEducativa); }

        queryParam = queryParam.set('paginaActual', paginaActual);
        queryParam = queryParam.set('tamanioPagina', tamanioPagina);
        return this.restangular.all(`centrostrabajo/buscarCentroTrabajo`).get(queryParam);
          
    }
    exportarRegistro = (data:any): Observable<any> => {        
        return this.restangular.one('controlesasistencia',data.idControlAsistencia).all('devolverreportes').post(data);    
    };

    getInstancia(activo: any) {
        let queryParam = new HttpParams();
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        return this.restangular.all('instancias').get(queryParam);
    }

    getSubinstancia(idInstancia: any, activo: any) {
        let queryParam = new HttpParams();
        if (idInstancia !== null) { queryParam = queryParam.set('idInstancia', idInstancia); }
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
      

        return this.restangular
            .all('subinstancias')
            .get(queryParam);
      
    }
    getTipoCentroTrabajo(idNivelInstancia: any, activo: any) {
        let queryParam = new HttpParams();
        if (idNivelInstancia !== null && idNivelInstancia > 0) { queryParam = queryParam.set('idNivelInstancia', idNivelInstancia); }
        if (activo !== null) { queryParam = queryParam.set('activo', activo); }
        return this.restangular.all('tiposcentrotrabajo').get(queryParam);
    }

    // reporte detallado - mes  docentes 
    // reporte  consolidado , incidencias
    //es mensual por docentes

    getInformacion = (idAsistenciaServidor) =>{
        return this.restangular.one('VerInformacion',idAsistenciaServidor).get();   
    }
  
    getDres(data:any) {
        let queryParam: HttpParams = new HttpParams()
          .set('idCentroTrabajo', data);
        return this.restangular.all("instancias/instanciascentrotrabajo").get(queryParam);
      }
    
      getUgeles(pIdDre: any) {
        let queryParam: HttpParams = new HttpParams()
          .set('idDre', pIdDre);
        return this.restangular.all("subinstancias").get(queryParam);
      }
    postRechazarMasivo(data:any): Observable<any> {
        console.log(data);                
        return this.restangular.all("consolidadoaprobacion/rechazarmasivo").post(data);
    }
    
    //return this.restangular.all("controlconsolidado/solicitar").post(data);
    postSolicitudRechazo(data: any): Observable<any>{
        console.log(data);      
        return this.restangular.one('consolidadoaprobacion',data.idControlAsistencia).all('rechazar').post(data);     
    }

    aprobarMasivo(data:any): Observable<any> {  
        console.log(data);
        return this.restangular.all(`consolidadoaprobacion/aprobarmasivo`).post(data);
    }
    enviarCompensaciones(data:any): Observable<any> {   
       
       console.log(data);
        return this.restangular.all(`consolidadoaprobacion/enviarcompensaciones`).post(data);
    }
    rechazarMasivo(data:any): Observable<any> {  
        console.log(data);
        return this.restangular.all(`consolidadoaprobacion/rechazarmasivo`).post(data);
    }     

    postAprobarMasivo = (data: any) : Observable<any> =>{

        let queryParam = new HttpParams();     
        if (data.anio !== null) { queryParam = queryParam.set('idRegimenLaboral', data.anio); }
        if (data.idMes !== null) { queryParam = queryParam.set('idGrupoAccion', data.idMes); }
        if (data.codigoModular !== null) { queryParam = queryParam.set('idAccion', data.codigoModular); }
        if (data.idEstado !== null) { queryParam = queryParam.set('idMotivoAccion', data.idEstado); }        
        return this.restangular.all('controlesasistencia').post(data, queryParam);
    }
   

    postEnviarCompensaciones = (data: any) : Observable<any> =>{
        let queryParam = new HttpParams();        
        if (data.anio !== null) { queryParam = queryParam.set('idRegimenLaboral', data.anio); }
        if (data.idMes !== null) { queryParam = queryParam.set('idGrupoAccion', data.idMes); }
        if (data.codigoModular !== null) { queryParam = queryParam.set('idAccion', data.codigoModular); }
        if (data.idEstado !== null) { queryParam = queryParam.set('idMotivoAccion', data.idEstado); }
        
        return this.restangular.all('controlesasistencia').post(data, queryParam);
    }

    postRechazar(data:any): Observable<any> {
       
        return this.restangular.one("consolidadoaprobacion", data.idControlAsistencia).all('rechazar').post(data);
    }
   
    postAprobar = (data: any) : Observable<any> =>{     
        console.log(data);    
        return this.restangular.one('consolidadoaprobacion',data.idControlAsistencia).all('aprobar').post(data);
    }

    getListadoAsistencia =(data: any, pageIndex: number, pageSize: number):Observable<any> => {
        console.log(data);
        let queryParam = new HttpParams();      
        // queryParam = queryParam.set("idTipoDocumento", data.idTipoDocumentoIdentidad);
        // queryParam = queryParam.set("numeroDocumento", data.numeroDocumentoIdentidad);
        // queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        // queryParam = queryParam.set("idRegimen", data.idRegimenLaboral);
        // queryParam = queryParam.set("idCondicionLaboral", data.idCondicionLaboral);
        // queryParam = queryParam.set("idSituacionLaboral", data.idSituacionLaboral);
        // queryParam = queryParam.set("idTipoRegistro", data.idTipoRegistro);
        // queryParam = queryParam.set("codigoCentroTrabajo", data.codigoCentroTrabajo); 
        // queryParam = queryParam.set("numberMes", data.numberMes); 
        return this.restangular.one("controlesasistencia", data.idControlAsistencia).all("asistenciasservidor").get(queryParam);
    }; 

    getRegistroAsistencia =(data: any, pageIndex: number, pageSize: number):Observable<any> => {
        console.log('getRegistroAsistencia',data);
        let queryParam = new HttpParams();      
        queryParam = queryParam.set("idTipoDocumento", data.idTipoDocumentoIdentidad);
        queryParam = queryParam.set("numeroDocumento", data.numeroDocumentoIdentidad);
        queryParam = queryParam.set("codigoPlaza", data.codigoPlaza);
        queryParam = queryParam.set("idRegimen", data.idRegimenLaboral);
        queryParam = queryParam.set("idCondicionLaboral", data.idCondicionLaboral);
        queryParam = queryParam.set("idSituacionLaboral", data.idSituacionLaboral);
        queryParam = queryParam.set("idTipoRegistro", data.idTipoRegistro);
        queryParam = queryParam.set("codigoCentroTrabajo", data.codigoCentroTrabajo); 
        queryParam = queryParam.set("numberMes", data.numberMes); 
        return this.restangular.one("controlesasistencia", data.idControlAsistencia).all("asistenciasservidor").get(queryParam);
    };   

    getEstadoRegistroAsistencia = (idControlAsistencia: any,):Observable<any> => {
        return this.restangular.one("controlesasistencia", idControlAsistencia).all("asistenciasservidor/revisarEstado").get();
    }
  
    exportarCentroTrabajo = (data: any) : Observable<any> =>{
        let queryParam = new HttpParams();  
        
        if (data.anio !== null) { queryParam = queryParam.set('anio', data.anio); }
        if (data.idMes !== null) { queryParam = queryParam.set('idMes', data.idMes); }
        if (data.codigoCentroTrabajo !== null) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if (data.idEstado !== null) { queryParam = queryParam.set('idEstado', data.idEstado); }
        
        return this.restangular.all('controlconsolidado/centrotrabajo/exportar').getFile(queryParam);
    }
    exportarOmisos = (data: any) : Observable<any> =>{
        let queryParam = new HttpParams();  
        
        if (data.anio !== null) { queryParam = queryParam.set('anio', data.anio); }
        if (data.idMes !== null) { queryParam = queryParam.set('idMes', data.idMes); }
        if (data.codigoCentroTrabajo !== null) { queryParam = queryParam.set('codigoCentroTrabajo', data.codigoCentroTrabajo); }
        if (data.idEstado !== null) { queryParam = queryParam.set('idEstado', data.idEstado); }

        return this.restangular.all('controlconsolidado/omisos/exportar').getFile(queryParam);
    }
    getTiposCentroTrabajo(): Observable<any> {
        return this.restangular.all("TiposCentroTrabajo").get();
      }
    //controles
    exportarAsistenciaMensual = (data: any) : Observable<any> =>{
        let queryParam: HttpParams = new HttpParams()
        .set("codigoCentroTrabajo", data.codigoCentroTrabajo)
        .set("anio", data.anio);
  
        queryParam = queryParam.set("codigoCentroTrabajo", data.codigoCentroTrabajo);
  
        return this.restangular.all(`controlesasistencia/exportar`).getFile(queryParam);     
    }
    exportarConsolidadoAprobacion = (data: any) : Observable<any> =>{
        let queryParam: HttpParams = new HttpParams()
        .set("codigoCentroTrabajo", data.codigoCentroTrabajo)
        .set("anio", data.anio);
  
        queryParam = queryParam.set("codigoCentroTrabajo", data.codigoCentroTrabajo);
  
        return this.restangular.all(`controlesasistencia/exportar`).getFile(queryParam);     
    }


    getExcelBandejaMensual(data: any) {
        let queryParam: HttpParams = new HttpParams()
            .set("codigoCentroTrabajo", data.codigoCentroTrabajo)
            .set("anio", data.anio);

        return this.restangular
            .all(`controlesasistencia/exportar`)
            .getFile(queryParam);
    }  

      listarEstadoAsistenciaMensual() {
        return this.restangular.all('estadoscontrolasistencia').get();
      }
      listarEstadoControl() {
        return this.restangular.all('estadoscontrolconsolidadoAsistencia').get();
      }
      listarEstadoConsolidadoAprobacion() {
        return this.restangular.all('estadosconsolidadoaprobacion').get();
      }

      listarMotivosRechazo() {
        return this.restangular.all('motivosrechazo').get();
      }    
     

    postExcelBandejaMensual = (data: any): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
            .set("codigoCentroTrabajo", data.codigoCentroTrabajo)
            .set("anio", data.anio);

        return this.restangular
            .all("controlesasistencia")
            .all("exportar")
            .download(null, queryParam);
    };

    //#endregion

    //#region bandeja-servidor
    getBandejaServidor(
        idControlAsistencia: number,
        params: any
    ): Observable<any> {
        const queryParams = convertObjectToGetParams(params);
        if (idControlAsistencia == undefined) {
            idControlAsistencia = 0;
        }
        return this.restangular
            .all("controlesasistencia")
            .all(idControlAsistencia.toString())
            .all("asistenciasservidor")
            .getData(queryParams);
    }

    saveSinIncidenciaServidor = (data,usuario: string): Observable<any> => 
    {
        console.log(data);
        let queryParam: HttpParams = new HttpParams().set("usuario", usuario);

        return this.restangular
            .all("asistenciasservidor/sinIncidencias")
            .post(data, queryParam);
    };
    // crearIncidencia = (idAsistenciaServidor,data:any): Observable<any> => {
    //     console.log(data);
    //     return this.restangular
    //         .all(`asistenciasservidor/${idAsistenciaServidor}/incidencias`)
    //         .post(data);
    // };

    ExportarExcelAsistenciaServidor(idControlAsistencia: number,numberMes: number, anio:number, data: any) {
       
        let queryParams: HttpParams = new HttpParams()
        .set("idTipoDocumentoIdentidad", data.idTipoDocumentoIdentidad)
        .set("numeroDocumentoIdentidad", data.numeroDocumentoIdentidad)
        .set("codigoPlaza", data.codigoPlaza)
        .set("idRegimenLaboral", data.idRegimenLaboral)
        .set("idCondicionLaboral", data.idCondicionLaboral)
        .set("idSituacionLaboral", data.idSituacionLaboral)
        .set("idTipoRegistro", data.idTipoRegistro)
        .set("codigoCentroTrabajo", data.codigoCentroTrabajo)
        .set("numberMes", numberMes.toString())
        .set("anio", anio.toString());
        return this.restangular.all(`controlesasistencia/${idControlAsistencia}/asistenciasservidor/exportar`).getFile(queryParams);
    }

    postExcelControlAsistenciaMensual = (
        idControlAsistencia: number,
        params: any
    ): Observable<any> => {
        //const queryParams = convertObjectToGetParams(params);

        let queryParam: HttpParams = new HttpParams();
        if (params.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                "idTipoDocumentoIdentidad",
                params.idTipoDocumentoIdentidad
            );
        }
        if (params.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                "numeroDocumentoIdentidad",
                params.numeroDocumentoIdentidad
            );
        }
        if (params.primerApellido !== null) {
            queryParam = queryParam.set(
                "primerApellido",
                params.primerApellido
            );
        }
        if (params.segundoApellido !== null) {
            queryParam = queryParam.set(
                "segundoApellido",
                params.segundoApellido
            );
        }
        if (params.nombres !== null) {
            queryParam = queryParam.set("nombres", params.nombres);
        }
        if (params.codigoPlaza !== null) {
            queryParam = queryParam.set("codigoPlaza", params.codigoPlaza);
        }
        if (params.idRegimen !== null) {
            queryParam = queryParam.set("idRegimen", params.idRegimen);
        }

        return this.restangular
            .all("controlesasistencia")
            .all(idControlAsistencia.toString())
            .all("exportar")
            .download(null, queryParam);
    };
    
    getBandejaConsolidado(data: any): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
            .set("anio", data.anio)
            .set("idDre", data.idDre)
            .set("idUgel", data.idUgel)
            .set("p", data.p)
            .set("pp", data.pp);

        return this.restangular.all("consolidadosiged").get(queryParam);
    }

    getObservadosControlAsistencia(
        idConsolidadoIged: number,
        p: number,
        pp: number
    ): Observable<any> {
        let queryParam: HttpParams = new HttpParams()
            .set("p", p.toString())
            .set("pp", pp.toString());

        return this.restangular
            .all(`consolidadosiged/${idConsolidadoIged}/observados`)
            .get(queryParam);
    }

 
    SolicitarAprobacion(data:any): Observable<any> {   
        console.log(data);    
   
        return this.restangular.all("controlconsolidado/solicitar").post(data);
    }
 

    getExcelBandejaConsolidado(data: any) {
        let queryParam: HttpParams = new HttpParams()
            .set("anio", data.anio)
            .set("idDre", data.idDre)
            .set("idUgel", data.idUgel);

        return this.restangular
            .all("consolidadosiged/exportar")
            .getFile(queryParam);
    }

    postExcelBandejaConsolidado = (data: any): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
            .set("anio", data.anio)
            .set("idDre", data.idDre)
            .set("idUgel", data.idUgel);

        return this.restangular
            .all("consolidadosiged/exportar")
            .download(null, queryParam);
    };
    #endregion



    saveObservacionCentro = (
        idControlAsistencia: number,
        item: any
    ): Observable<any> => {
        return this.restangular
            .all(
                `controlesasistencia/${idControlAsistencia.toString()}/observar`
            )
            .post(item);
    };

    getExcelBandejaCentroTrabajo(idConsolidadoIged: number) {
        return this.restangular
            .all("consolidadosiged")
            .all(idConsolidadoIged.toString())
            .all("exportar")
            .getFile();
    }

    postExcelBandejaCentroTrabajo = (
        idConsolidadoIged: number
    ): Observable<any> => {
        return this.restangular
            .all("consolidadosiged")
            .all(idConsolidadoIged.toString())
            .all("exportar")
            .download();
    };

    getMeses(): Observable<any> {
        return this.restangular.all("meses").get();
    }

    getEstadoControl(): Observable<any> {
        return this.restangular.all("estadosconsolidadoaprobacion").get();
    }
    //#endregion

    //#region modal-incidencia-servidor
    getModalIncidenciaServidor = (
        idAsistenciaServidor: number,
        idTipoIncidencia: string
    ): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
        .set("idTipoIncidencia",idTipoIncidencia);

        return this.restangular
            .all(`asistenciasservidor/${idAsistenciaServidor}/incidencias`)
            .get(queryParam);
    };



    crearIncidencia = (idAsistenciaServidor,data:any): Observable<any> => {
        console.log(data);
        return this.restangular
            .all(`asistenciasservidor/${idAsistenciaServidor}/incidencias`)
            .post(data);
    };
  
    
    deleteIncidencia = (idAsistenciaServidor:any,idIncidencia:any,data:any): Observable<any> => {
        console.log(data);
        // let queryParam: HttpParams = new HttpParams()
        //     .set("usuarioModificacion", usuarioModificacion)           
        return this.restangular
        .one('asistenciasservidor',idAsistenciaServidor)
        .one('incidencias',idIncidencia).post(data);
    };
   
    //#region maestros-asistencia

    //#region catalogo
    getComboTiposDocumento = (): Observable<any> => {
        return this.restangular.all("tiposDocumentoIdentidad").get();
    };
    getComboCondicionLaboral = (): Observable<any> => {
        return this.restangular.all("condicioneslaboral").get();
    };
    getComboSituacionLaboral = (): Observable<any> => {
        return this.restangular.all("situacionesservidorpublico").get();
    };
    getComboTipoRegistro = (): Observable<any> => {
        return this.restangular.all("tiposRegistro").get();
    };
    //#endregion

    //#region regimen laboral
    getComboRegimenesLaborales = (): Observable<any> => {
        return this.restangular.all("regimeneslaboral").get();
    };
    //#endregion
    //#endregion

    //#region tools
    downloadFile(blob: Blob, nombreFile: string) {
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
    //#endregion

  // reporte consolidado
    getReporteConsolidado(idControlAsistencia: number, params: any ): Observable<any> {
        const queryParams = convertObjectToGetParams(params);
        if (idControlAsistencia == undefined) {
            idControlAsistencia = 0;
        }
        return this.restangular
            .all("controlesasistencia")
            .all(idControlAsistencia.toString())
            .all("reporteconsolidado")
            .getData(queryParams);
    }

    CerrarAsistencia =( data: any): Observable<any> =>{
        return this.restangular.all(`controlesasistencia/${data.idControlAsistencia}/cerrarasistencia`).post(data);
    }
   

    getReporteConsolidadoPdf(params: any) {
        const queryParams = convertObjectToGetParams(params);
        return this.restangular
            .all("controlesasistencia")
            .all("descargarconsolidado")
            .getFile(queryParams);
    }
    
    postReporteDetalladoPdf = (params: any): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
            .set("idControlAsistencia", params.idControlAsistencia)
            .set("mes", params.mes)
            .set("anio", params.anio);

        return this.restangular
            .all("controlesasistencia")
            .all("descargardetallado")
            .download(null, queryParam);
    };
    
    postReporteConsolidadoPdf = (params: any): Observable<any> => {
        let queryParam: HttpParams = new HttpParams()
            .set("idControlAsistencia", params.idControlAsistencia)
            .set("descripcionMes", params.descripcionMes)
            .set("anio", params.anio);

        return this.restangular
            .all("controlesasistencia")
            .all("descargarconsolidado")
            .download(null, queryParam);
    };
    //#endregion

    //#region reporte-detallado

    getReporteDetallado(params: any): Observable<any> {
        let queryParams: HttpParams = new HttpParams()
            .set("idControlAsistencia", params.idControlAsistencia)
            .set("mes", params.mes)
            .set("anio", params.anio);
        return this.restangular
            .all("controlesasistencia")
            .all("reporteDetallado")
            .getData(queryParams);
    }
    
    getReporteDetalladoCabecera(params: any): Observable<any> {
        let queryParams: HttpParams = new HttpParams()
            .set("mes", params.mes)
            .set("anio", params.anio)
            .set("idControlAsistencia", params.idControlAsistencia);
        return this.restangular
            .all("controlesasistencia")
            .all("detalladoCabecera")
            .getData(queryParams);
    }

    // getReporteDetalladoPdf(params: any) {
    //     const queryParams = convertObjectToGetParams(params);
    //     return this.restangular
    //         .all("controlesasistencia")
    //         .all("descargardetallado")
    //         .getFile(queryParams);
    // }

   
    //#endregion

    // #region bandeja-omisos-centro-nuevo-consolidado
  
    //#regionm modal-busqueda-centro-trabajo
    getDresFiltros(passport: any) {
        let queryParam: HttpParams = new HttpParams()
            .set("codigoSede", passport.CODIGO_SEDE)
            .set("codigoTipoSede", passport.CODIGO_TIPO_SEDE);
        return this.restangular.all("dres").get(queryParam);
    }

    getUgelesFiltros(pIdDre: any, passport: any) {
        let queryParam: HttpParams = new HttpParams()
            .set("idDre", pIdDre)
            .set("codigoSede", passport.CODIGO_SEDE)
            .set("codigoTipoSede", passport.CODIGO_TIPO_SEDE);
        return this.restangular.all("ugeles").get(queryParam);
    }    

    
   
}
