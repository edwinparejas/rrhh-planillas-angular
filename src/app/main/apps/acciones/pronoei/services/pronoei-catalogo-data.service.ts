import { Injectable } from '@angular/core';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { ICatalogoResponse } from '../interfaces/catalogo.interface';
import { CatalogoItemEnum } from '../_utils/constants';
import { IMaestroPermisoResponse } from '../interfaces/maestro-permiso.interface';
import { catchError } from 'rxjs/operators';
import { CodigoDreUgelService } from './codigo-dre-ugel.service';

@Injectable({
    providedIn: 'root'
})
export class PronoeiCatalogoDataService {

    private maestroPermisoSubject: BehaviorSubject<IMaestroPermisoResponse>;
    private estadosPronoeiActivoSubject: BehaviorSubject<ICatalogoResponse[]>;
    private tiposDocumentoIdentidadInactivoSubject: BehaviorSubject<ICatalogoResponse[]>;
    private tiposDocumentoIdentidadActivoSubject: BehaviorSubject<ICatalogoResponse[]>;
    private nivelEducativoActivoSubject: BehaviorSubject<ICatalogoResponse[]>;
    private sitacionAcademicaActivoSubject: BehaviorSubject<ICatalogoResponse[]>;
    private zonaActivoSubject: BehaviorSubject<ICatalogoResponse[]>;

    constructor(private dataService: DataService, private codigoDreUgelService: CodigoDreUgelService) {
        this.maestroPermisoSubject = new BehaviorSubject<IMaestroPermisoResponse>(this.maestroPermisoDefault);
        this.estadosPronoeiActivoSubject = new BehaviorSubject<ICatalogoResponse[]>([]);
        this.tiposDocumentoIdentidadInactivoSubject = new BehaviorSubject<ICatalogoResponse[]>([]);
        this.tiposDocumentoIdentidadActivoSubject = new BehaviorSubject<ICatalogoResponse[]>([]);
        this.nivelEducativoActivoSubject = new BehaviorSubject<ICatalogoResponse[]>([]);
        this.sitacionAcademicaActivoSubject = new BehaviorSubject<ICatalogoResponse[]>([]);
        this.zonaActivoSubject = new BehaviorSubject<ICatalogoResponse[]>([]);
    }

    async dataCombosBandejaPrincipalInit() {
        this.cargarEstadosPronoeiActivoCatalogo();
        this.cargarTipoDocumentoInactivoCatalogo();
        this.cargarZonaActivoCatalogo();
        this.cargarPronoeiMaestroPermiso();
    }

    get maestroPermisoDefault() {
        return {
            nuevoRegistro: false,
            eliminarRegistro: false,
            editarRegistro: false,
            generarProyecto: false,
            enviarAccionesGrabadas: false,
        };
    }

    async complete() {
        this.maestroPermisoSubject?.next(this.maestroPermisoDefault);
        // this.maestroPermisoSubject?.complete();
        // this.estadosPronoeiActivoSubject.complete();
        // this.tiposDocumentoIdentidadInactivoSubject.complete();
        // this.tiposDocumentoIdentidadActivoSubject.complete();
        // this.nivelEducativoActivoSubject.complete();
        // this.sitacionAcademicaActivoSubject.complete();
        // this.zonaActivoSubject.complete();
    }

    async DataCombosPronoeiRegistroInit() {
        await forkJoin(
            [
                this.cargarNvlAcademicoActivoCatalogo(),
                this.cargarSituacionAcademicaActivoCatalogo(),
                this.cargarTipoDocumentoActivoCatalogo(),
                // this.cargarPronoeiMaestroPermiso()
            ]);
    }

    get maestroPermiso$() {
        return this.maestroPermisoSubject?.asObservable();
    }

    get maestroPermiso() {
        return this.maestroPermisoSubject.getValue();
    }

    //combo habilitados segun pantalla

    get estadosPronoeiCatalogo$() {
        return this.estadosPronoeiActivoSubject?.asObservable();
    }

    get tipoDocumentoIdentidadInactivo$() {
        return this.tiposDocumentoIdentidadInactivoSubject?.asObservable();
    }

    get tipoDocumentoIdentidadActivo$() {
        return this.tiposDocumentoIdentidadActivoSubject?.asObservable();
    }

    get nvlAcademicoActivoCatalogo$() {
        return this.nivelEducativoActivoSubject?.asObservable();
    }

    get nvlAcademicoActivoCatalogo() {
        return this.nivelEducativoActivoSubject?.value;
    }

    get situacionAcademicaActivoCatalogo$() {
        return this.sitacionAcademicaActivoSubject?.asObservable();
    }

    get zonaActivoCatalogo$() {
        return this.zonaActivoSubject?.asObservable();
    }

    //aca termina 


    async cargarPronoeiMaestroPermiso() {

        var passportModel = this.codigoDreUgelService.passportModel;
        var codigos = this.codigoDreUgelService.getCodigoDreUgel();

        const codigoRolPassport = passportModel.CODIGO_ROL;
        const codigoTipoSede = codigos?.codigoTipoSede;

        if(!codigoTipoSede) return;

        const request = { codigoRolPassport, codigoTipoSede };
        let isSuccess = true;
        const response = await this.dataService.AccionesVinculacion().getMaestroPermisoPronoei(request)
            .pipe(
                catchError((err) => {
                    isSuccess = false;
                    return of(null);
                })).toPromise();

        if (isSuccess && response) {
            this.maestroPermisoSubject.next(response);
        }
    }

    private async cargarEstadosPronoeiActivoCatalogo() {

        const request = {
            codigoCatalogo: CatalogoItemEnum.TIPOS_ESTADO_PRONOEI,
            Inactivo: false
        }

        const response = await this.dataService.AccionesVinculacion().getCatalogoItem(request).toPromise();
        if (response?.length > 0) {

            response.unshift({
                id_catalogo_item: -1,
                descripcion_catalogo_item: '--TODOS--'
            })
            this.estadosPronoeiActivoSubject.next(response);
        }
    }
    private async cargarZonaActivoCatalogo() {

        const request = {
            codigoCatalogo: CatalogoItemEnum.TIPO_ZONA,
            Inactivo: false
        }

        const response = await this.dataService.AccionesVinculacion().getCatalogoItem(request).toPromise();
        if (response?.length > 0) {

            response.unshift({
                id_catalogo_item: -1,
                descripcion_catalogo_item: '--TODOS--'
            })
            this.zonaActivoSubject.next(response);
        }
    }

    private async cargarTipoDocumentoInactivoCatalogo() {

        const request = {
            codigoCatalogo: CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD,
            Inactivo: true
        }

        const response = await this.dataService.AccionesVinculacion().getCatalogoItem(request).toPromise();
        if (response?.length > 0) {

            response.unshift({
                id_catalogo_item: -1,
                descripcion_catalogo_item: '--TODOS--'
            })
            this.tiposDocumentoIdentidadInactivoSubject.next(response);
        }
    }

    private async cargarTipoDocumentoActivoCatalogo() {

        const request = {
            codigoCatalogo: CatalogoItemEnum.TIPOS_DOCUMENTOS_IDENTIDAD,
            Inactivo: false
        }

        const response = await this.dataService.AccionesVinculacion().getCatalogoItem(request).toPromise();
        if (response?.length > 0) {
            this.tiposDocumentoIdentidadActivoSubject.next(response);
        }
    }

    private async cargarNvlAcademicoActivoCatalogo() {

        const request = {
            codigoCatalogo: CatalogoItemEnum.NIVEL_EDUCATIVO,
            Inactivo: false
        }

        const response = await this.dataService.AccionesVinculacion().getCatalogoItem(request).toPromise();
        if (response?.length > 0) {
            this.nivelEducativoActivoSubject.next(response);
        }
    }

    private async cargarSituacionAcademicaActivoCatalogo() {

        const request = {
            codigoCatalogo: CatalogoItemEnum.SITUACION_ACADEMICA,
            Inactivo: false
        }

        const response = await this.dataService.AccionesVinculacion().getCatalogoItem(request).toPromise();
        if (response?.length > 0) {
            this.sitacionAcademicaActivoSubject.next(response);
        }
    }

}
