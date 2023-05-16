import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { RestangularBasePath } from "../base-path/restangular-base-path";
import { StorageService } from "./storage.service";

@Injectable({
    providedIn: "root",
})
export class CuadroHoras30512Service {
    constructor(
        private _http: HttpClient,
        private basePath: RestangularBasePath,
        private storageService: StorageService
    ) {}

    getComboCatalogoItem = (codigoCatalogo: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigoCatalogo !== null) {
            queryParam = queryParam.set("codigoCatalogo", codigoCatalogo);
        }
        let url = this.basePath.cuadroHoras30512Api + "/catalogositem";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboPlanEstudio = (idPlanEstudio: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (idPlanEstudio !== null) {
            queryParam = queryParam.set("idPlanEstudio", idPlanEstudio);
        }
        let url = this.basePath.cuadroHoras30512Api + "/planesestudio";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getPlanEstudio = (idPlanEstudio: any = true): Observable<any> => {
        let url =
            this.basePath.cuadroHoras30512Api +
            "/planesestudio/" +
            idPlanEstudio;
        return this._http.get<any>(`${url}`);
    };

    guardarPlanEstudio(planEstudio: any): Observable<any> {
        let url = this.basePath.cuadroHoras30512Api + "/planesestudio";
        return this._http.post<any>(`${url}`, planEstudio);
    }

    activarPlanEstudio(planEstudio: any): Observable<any> {
        let url = this.basePath.cuadroHoras30512Api + "/planesestudio";
        return this._http.put<any>(`${url}`, planEstudio);
    }

    getPlanEstudioPaginado = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idPlanEstudio !== null && parseInt(data.idPlanEstudio) > 0) {
            queryParam = queryParam.set("idPlanEstudio", data.idPlanEstudio);
        }
        if (
            data.idEstadoPlanEstudio !== null &&
            parseInt(data.idEstadoPlanEstudio) > 0
        ) {
            queryParam = queryParam.set(
                "idEstadoPlanEstudio",
                data.idEstadoPlanEstudio
            );
        }
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        let url = this.basePath.cuadroHoras30512Api + "/planesestudio/paginado";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarPlanEstudio = (data: any): Observable<any> => {
        let url = this.basePath.cuadroHoras30512Api + "/planesestudio/exportar";
        return this._http.post<any>(`${url}`, data);
    };

    cancelarVigenciaPlanEstudio(planEstudio: any): Observable<any> {
        let url =
            this.basePath.cuadroHoras30512Api +
            "/planesestudio/cancelarvigencia";
        return this._http.put<any>(`${url}`, planEstudio);
    }

    deletePlanEstudio(planEstudio: any): Observable<any> {
        let url = this.basePath.cuadroHoras30512Api + "/planesestudio/eliminar";
        return this._http.post<any>(`${url}`, planEstudio);
    }

    getPlanEstudioDetallePaginado = (
        data: any,
        pageIndex: any,
        pageSize: any
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idPlanEstudio !== null && parseInt(data.idPlanEstudio) > 0) {
            queryParam = queryParam.set("idPlanEstudio", data.idPlanEstudio);
        }
        if (
            data.idAreaComponenteCurricular !== null &&
            parseInt(data.idAreaComponenteCurricular) > 0
        ) {
            queryParam = queryParam.set(
                "idAreaComponenteCurricular",
                data.idAreaComponenteCurricular
            );
        }
        if (
            data.idCarreraProgramaEstudios !== null &&
            parseInt(data.idCarreraProgramaEstudios) > 0
        ) {
            queryParam = queryParam.set(
                "idCarreraProgramaEstudios",
                data.idCarreraProgramaEstudios
            );
        }
        if (data.idCiclo !== null && parseInt(data.idCiclo) > 0) {
            queryParam = queryParam.set("idCiclo", data.idCiclo);
        }
        if (data.idCursoModulo !== null && parseInt(data.idCursoModulo) > 0) {
            queryParam = queryParam.set("idCursoModulo", data.idCursoModulo);
        }
        if (
            data.idFormacionProfesional !== null &&
            parseInt(data.idFormacionProfesional) > 0
        ) {
            queryParam = queryParam.set(
                "idFormacionProfesional",
                data.idFormacionProfesional
            );
        }
        queryParam = queryParam.set("paginaActual", pageIndex);
        queryParam = queryParam.set("tamanioPagina", pageSize);
        let url =
            this.basePath.cuadroHoras30512Api +
            "/planesestudiodetalle/paginado";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    exportarPlanEstudioDetalle = (data: any): Observable<any> => {
        let url =
            this.basePath.cuadroHoras30512Api +
            "/planesestudiodetalle/exportar";
        return this._http.post<any>(`${url}`, data);
    };

    getComboComponentesCurricular = (
        idAreaComponenteCurricular: any = true
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idAreaComponenteCurricular !== null) {
            queryParam = queryParam.set(
                "idAreaComponenteCurricular",
                idAreaComponenteCurricular
            );
        }
        let url =
            this.basePath.cuadroHoras30512Api + "/areascomponentecurricular";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getListaComponentes = (codigos: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigos !== null) {
            queryParam = queryParam.set("codigos", codigos);
        }
        let url =
            this.basePath.cuadroHoras30512Api + "/competenciasnivel/codigos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboFormacionesProfesional = (
        idFormacionProfesional: any = true
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (idFormacionProfesional !== null) {
            queryParam = queryParam.set(
                "idFormacionProfesional",
                idFormacionProfesional
            );
        }
        let url = this.basePath.cuadroHoras30512Api + "/formacionesProfesional";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };
    
    getListaFormaciones = (codigos: any = true): Observable<any> => {
        let queryParam = new HttpParams();
        if (codigos !== null) {
            queryParam = queryParam.set("codigos", codigos);
        }
        let url =
            this.basePath.cuadroHoras30512Api +
            "/formacionesprofesional/codigos";
        return this._http.get<any>(`${url}`, { params: queryParam });
    };

    getComboEstadoPlanEstudio = (): Observable<any> => {
        let url = this.basePath.cuadroHoras30512Api + "/estadosplanestudio";
        return this._http.get<any>(`${url}`);
    };

    getComboCarreraProgramaEstudio = (): Observable<any> => {
        let url = this.basePath.cuadroHoras30512Api + "/carrerasprogramaestudio";
        return this._http.get<any>(`${url}`);
    };
    
    getComboCiclos = (): Observable<any> => {
        let url = this.basePath.cuadroHoras30512Api + "/ciclos";
        return this._http.get<any>(`${url}`);
    };

    getComboAreasCursoModulo = (): Observable<any> => {
        let url = this.basePath.cuadroHoras30512Api + "/areascursomodulo";
        return this._http.get<any>(`${url}`);
    };
}
