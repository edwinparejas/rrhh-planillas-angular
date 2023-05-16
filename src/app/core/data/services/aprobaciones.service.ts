import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { RestangularService } from "./restangular.service";
import { HttpClient, HttpParams } from "@angular/common/http";
import { AprobacionesRestangularService } from "./resources/aprobaciones-restangular.service";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { GlobalUtil } from "./global";

@Injectable({
    providedIn: "root",
})
export class AprobacionService {
    constructor(
        private restangular: AprobacionesRestangularService,
        private http: HttpClient,
        private basePath: RestangularBasePath,
        private global: GlobalUtil,) { }

    listarSistemas(esPassport: any): Observable<any> {
        let queryParam = new HttpParams();
        if (esPassport !== null) {
            queryParam = queryParam.set("esPassport", esPassport);
        }
        
        let url = this.basePath.aprobacionesApi + "/sistema";
        return this.http.get<any>(`${url}`, { params: queryParam });
    }

    entidadPassport(codigoEntidadSede: any) {
        let queryParam = new HttpParams();
        if (codigoEntidadSede !== null) {
            queryParam = queryParam.set("codigoEntidadSede", codigoEntidadSede);
        }

        var url = this.basePath.aprobacionesApi + `/entidades`;
        return this.http.get<any>(`${url}`, { params: queryParam });  
    }


    listarFuncionalidades(codigoSistema: any): Observable<any> {     
        let queryParam = new HttpParams();
        if (codigoSistema !== null) {
            queryParam = queryParam.set("codigoSistema", codigoSistema);
        }

       var url = this.basePath.aprobacionesApi + `/funcionalidad`;
       return this.http.get<any>(`${url}`, { params: queryParam });     
    }

    listarEstadosAprobadores(activo: any): Observable<any> {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set("activo", activo);
        }

        var url = this.basePath.aprobacionesApi + `/estadoaprobaciones`;
       return this.http.get<any>(`${url}`, { params: queryParam });  
    }
  
 
    listarInstancias(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set("idRolPassport", data.idRolPassport);
        }

        if (data.idDre !== null) {
            queryParam = queryParam.set("idDre", data.idDre);
        }

        if (data.codigoTipoSede !== null) {
            queryParam = queryParam.set("codigoTipoSede", data.codigoTipoSede);
        }
        var url = this.basePath.aprobacionesApi + `/instancia`;
        return this.http.get<any>(`${url}`, { params: queryParam });  
    }

    listarSubInstancias(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idRolPassport !== null) {
            queryParam = queryParam.set("idRolPassport", data.idRolPassport);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }

        if (data.idSubinstancia !== null) {
            queryParam = queryParam.set("idSubinstancia", data.idSubinstancia);
        }

        if (data.codigoTipoSede !== null) {
            queryParam = queryParam.set("codigoTipoSede", data.codigoTipoSede);
        }

        var url = this.basePath.aprobacionesApi + `/subinstancias`;
        return this.http.get<any>(`${url}`, { params: queryParam });  
    }

    visualizarAprobacion(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idAprobacion !== null) {
            queryParam = queryParam.set("idAprobacion", data.idAprobacion);
        }

        var url = this.basePath.aprobacionesApi + `/aprobacion/visualizar`;
        return this.http.get<any>(`${url}`, { params: queryParam });  
    }


    listarEtapasAprobaciones(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idModulo !== null) {
            queryParam = queryParam.set("idModulo", data.idModulo);
        }
        if (data.idFuncionalidad !== null) {
            queryParam = queryParam.set("idFuncionalidad", data.idFuncionalidad);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubinstancia !== null) {
            queryParam = queryParam.set("idSubinstancia", data.idSubinstancia);
        }
        if (data.idEstadoAprobacion !== null) {
            queryParam = queryParam.set("idEstadoAprobacion", data.idEstadoAprobacion);
        }
        if (data.fechaInicio !== null) {
            queryParam = queryParam.set("fechaInicio", data.fechaInicio);
        }
        if (data.fechaFin !== null) {
            queryParam = queryParam.set("fechaFin", data.fechaFin);
        }
        if (data.codigoTipoSedeUsuario !== null) {
            queryParam = queryParam.set("codigoTipoSedeUsuario", data.codigoTipoSedeUsuario);
        }
        if (data.codigoRolPassportUsuario !== null) {
            queryParam = queryParam.set("codigoRolPassportUsuario", data.codigoRolPassportUsuario);
        }
        if (data.numeroDocumentoUsuario !== null) {
            queryParam = queryParam.set("numeroDocumentoUsuario", data.numeroDocumentoUsuario);
        }
        if (data.paginaActual !== null) {
            queryParam = queryParam.set("paginaActual", data.paginaActual);
        }
         if (data.tamanioPagina !== null) {
            queryParam = queryParam.set("tamanioPagina", data.tamanioPagina);
        }

        let url = `${this.basePath.aprobacionesApi}/aprobacion/buscar`;
        return this.http.get<any>(`${url}`, { params: queryParam });  
    }

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

    exportarEtapasAprobaciones(data: any): Observable<any> {
        let queryParam = new HttpParams();
        if (data.idModulo !== null) {
            queryParam = queryParam.set("idModulo", data.idModulo);
        }
        if (data.idFuncionalidad !== null) {
            queryParam = queryParam.set("idFuncionalidad", data.idFuncionalidad);
        }

        if (data.idInstancia !== null) {
            queryParam = queryParam.set("idInstancia", data.idInstancia);
        }
        if (data.idSubinstancia !== null) {
            queryParam = queryParam.set("idSubinstancia", data.idSubinstancia);
        }
        if (data.idEstadoAprobacion !== null) {
            queryParam = queryParam.set("idEstadoAprobacion", data.idEstadoAprobacion);
        }
        if (data.fechaInicio !== null) {
            queryParam = queryParam.set("fechaInicio", data.fechaInicio);
        }
        if (data.fechaFin !== null) {
            queryParam = queryParam.set("fechaFin", data.fechaFin);
        }
        if (data.codigoTipoSedeUsuario !== null) {
            queryParam = queryParam.set("codigoTipoSedeUsuario", data.codigoTipoSedeUsuario);
        }
        if (data.codigoRolPassportUsuario !== null) {
            queryParam = queryParam.set("codigoRolPassportUsuario", data.codigoRolPassportUsuario);
        }
        if (data.numeroDocumentoUsuario !== null) {
            queryParam = queryParam.set("numeroDocumentoUsuario", data.numeroDocumentoUsuario);
        }
        if (data.paginaActual !== null) {
            queryParam = queryParam.set("paginaActual", data.paginaActual);
        }
         if (data.tamanioPagina !== null) {
            queryParam = queryParam.set("tamanioPagina", data.tamanioPagina);
        }


        let url = `${this.basePath.aprobacionesApi}/aprobacion/exportar/`;
        return this.http.get<any>(`${url}`, { params: queryParam });  
    }

    historialEtapaAprobacion(idAprobacion) {
        return this.restangular
            .allAprobaciones("etapasaprobaciones")
            .allAprobaciones(idAprobacion)
            .allAprobaciones("historial")
            .getAprobaciones();
    }

    motivoRechazoEtapaAprobacion(idEtapaAprobacion) {
        return this.restangular
            .allAprobaciones("etapasaprobaciones")
            .allAprobaciones(idEtapaAprobacion)
            .allAprobaciones("motivorechazo")
            .getAprobaciones();
    }

    permisoAprobador(data: any): Observable<any> {
        let url = `${this.basePath.aprobacionesApi}/aprobacionniveles/permiso?${this.global.formatParameter(data, false)}`;
        return this.http.get(url); 
    }
}
