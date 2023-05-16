import { HttpClient, HttpParams, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { convertObjectToGetParams } from '@minedu/functions/http.helpers';
import { SancionesRestangularService } from './resources/sanciones.restangular.service';

@Injectable({
    providedIn: 'root',
})
export class SancionesService {
    constructor(private restangular: SancionesRestangularService) { }

    getComboTiposDocumento = (activo: any = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposdocumentoidentidad').get();
    }

    getRegimenLaboral = (activo: any) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('regimeneslaborales').get(queryParam);
    }

    getServidorPublico = (idServidorPublico) => {
        return this.restangular
            .one('servidorespublicos', idServidorPublico)
            .get();
    }

    getTiposSustento = (activo) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tipossustento').get(queryParam);
    }

    getTiposFormato = (activo) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposformato').get(queryParam);
    }
    getDiasDescargo= () => {
         return this.restangular.all('diasdescargos').get();
    }
    getTiposResolucion = (activo = null) => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposresolucion').get(queryParam);
    }

    getComboTiposFalta = (activo = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tiposfalta').get(queryParam);
    }

    getDetallesFalta = (activo = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('detallesfalta').get(queryParam);
    }

    getListaFaltas = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null)queryParam = queryParam.set('codigoSede', data.codigoSede);
        if (data.codigoTipoSede !== null)queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
        if (data.codigoRolPassport !== null)queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);

        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idTipoFalta !== null) {
            queryParam = queryParam.set('idTipoFalta', data.idTipoFalta);
        }
        if (data.fechaRegistro !== null) {
            queryParam = queryParam.set('fechaRegistro', data.fechaRegistro);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('faltas').get(queryParam);
    }

    getListaSanciones = (data: any, pageIndex, pageSize) => {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null)queryParam = queryParam.set('codigoSede', data.codigoSede);
        if (data.codigoTipoSede !== null)queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
        if (data.codigoRolPassport !== null)queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);

        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idAccion !== null) {
            queryParam = queryParam.set('idAccion', data.idAccion);
        }
        if (data.idMotivoAccion !== null) {
            queryParam = queryParam.set('idMotivoAccion', data.idMotivoAccion);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('sanciones').get(queryParam);
    }


    exportarExcelSanciones(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null)queryParam = queryParam.set('codigoSede', data.codigoSede);
        if (data.codigoTipoSede !== null)queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
        if (data.codigoRolPassport !== null)queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);

        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'idTipoDocumentoIdentidad',
                data.idTipoDocumentoIdentidad
            );
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set(
                'numeroDocumentoIdentidad',
                data.numeroDocumentoIdentidad
            );
        }

        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                'idRegimenLaboral',
                data.idRegimenLaboral
            );
        }

        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set(
                'idTipoSancion',
                data.idTipoSancion
            );
        }

        if (data.fechaRegistro !== null) {
            queryParam = queryParam.set(
                'fechaRegistro',
                data.fechaRegistro
            );
        }

        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);

        return this.restangular
            .all('sanciones/exportar')
            .download(null, queryParam);
    }
    exportarExcelFaltas(
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null)queryParam = queryParam.set('codigoSede', data.codigoSede);
        if (data.codigoTipoSede !== null)queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
        if (data.codigoRolPassport !== null)queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);
        
        if (data.idTipoDocumentoIdentidad !== null) {
            queryParam = queryParam.set('idTipoDocumentoIdentidad', data.idTipoDocumentoIdentidad);
        }
        if (data.numeroDocumentoIdentidad !== null) {
            queryParam = queryParam.set('numeroDocumentoIdentidad', data.numeroDocumentoIdentidad);
        }
        if (data.idRegimenLaboral !== null) {
            queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        }
        if (data.idTipoFalta !== null) {
            queryParam = queryParam.set('idTipoFalta', data.idTipoFalta);
        }
        if (data.fechaRegistro !== null) {
            queryParam = queryParam.set('fechaRegistro', data.fechaRegistro);
        }
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular
            .all('faltas/exportar/')
            .download(null, queryParam);
    }

    getListaServidorPublico = (
        data: any,
        pageIndex,
        pageSize
    ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.codigoSede !== null)queryParam = queryParam.set('codigoSede', data.codigoSede);
        if (data.codigoTipoSede !== null)queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
        if (data.codigoRolPassport !== null)queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);
        if (data.idTipoDocumentoIdentidad !== null)queryParam = queryParam.set('idTipoDocumentoIdentidad',data.idTipoDocumentoIdentidad);
        if (data.numeroDocumentoIdentidad !== null)queryParam = queryParam.set('numeroDocumentoIdentidad',data.numeroDocumentoIdentidad);
        if (data.primerApellido !== null) queryParam = queryParam.set('primerApellido', data.primerApellido); 
        if (data.segundoApellido !== null)queryParam = queryParam.set('segundoApellido',data.segundoApellido);
        if (data.nombres !== null)queryParam = queryParam.set('nombres', data.nombres);
        
        queryParam = queryParam.set('paginaActual', pageIndex);
        queryParam = queryParam.set('tamanioPagina', pageSize);
        return this.restangular.all('servidorespublicos').get(queryParam);
    }

    crearFalta(data: any): Observable<any> {
        return this.restangular.all('faltas').post(data);
    }

    crearSancion(data: any): Observable<any> {
        return this.restangular.all('sanciones').post(data);
    }

    modificarFalta = (sancion: any): Observable<any> => {
        return this.restangular.all('faltas').put(sancion);
    }

    modificarSancion = (sancion: any): Observable<any> => {
        return this.restangular.all('sanciones').put(sancion);
    }

    getFaltaById = (idFalta) => {
        return this.restangular.one('faltas', idFalta).get();
    }

    getSancionById = (idSancion) => {
        return this.restangular.one('sanciones', idSancion).get();
    }

    deleteFalta = (data: any): Observable<any> => {
        let url= 'faltas/' + data.idFalta;
        return this.restangular
            .all(url).patch(data);
    }

    deleteSancion = (idSancion: any): Observable<any> => {
        return this.restangular
            .one('sanciones', idSancion)
            .patch({ idSancion: idSancion });
    }

    getComboTiposSancion = (activo = null): Observable<any> => {
        let queryParam = new HttpParams();
        if (activo !== null) {
            queryParam = queryParam.set('activo', activo);
        }
        return this.restangular.all('tipossancion').get(queryParam);
    }
    getComboAcciones = (data:any ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idGrupoAccion !== null)             queryParam = queryParam.set('idGrupoAccion', data.idGrupoAccion);
        if (data.idRegimenLaboral !== null)             queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        if (data.codigoRolPassport !== null)             queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);
        if (data.activo !== null)             queryParam = queryParam.set('activo', data.activo);
        return this.restangular.all('acciones').get(queryParam);
    }
    getComboMotivosAccion = (data:any ): Observable<any> => {
        let queryParam = new HttpParams();
        if (data.idGrupoAccion !== null)             queryParam = queryParam.set('idGrupoAccion', data.idGrupoAccion);
        if (data.idAccion !== null)             queryParam = queryParam.set('idAccion', data.idAccion);
        if (data.idRegimenLaboral !== null)             queryParam = queryParam.set('idRegimenLaboral', data.idRegimenLaboral);
        if (data.codigoRolPassport !== null)             queryParam = queryParam.set('codigoRolPassport', data.codigoRolPassport);
        if (data.activo !== null)             queryParam = queryParam.set('activo', data.activo);
        return this.restangular.all('motivosaccion').get(queryParam);
    }

}
