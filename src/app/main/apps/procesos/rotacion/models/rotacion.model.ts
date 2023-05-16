import { CollectionViewer } from "@angular/cdk/collections";
import { DataSource } from "@angular/cdk/table";
import { DataService } from "app/core/data/data.service";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

export class EtapaResponseModel {
    //Usado en Plazas
    idEtapa: number;
    //Usado en Plazas
    idProceso: number;
    //Usado en Plazas
    anio: number;
    //Usado en Plazas
    codigoProceso: string;
    //Usado en Plazas
    descripcionEtapa: string;
    //Usado en Plazas
    abreviaturaRegimenLaboral: string;
    //Usado en Plazas
    descripcionEtapaFase: string;
    //Usado en Plazas
    descripcionNumeroConvocatoria: string;
    //Usado en Plazas
    descripcionProceso: string;
    //Usado en Plazas
    descripcionCausal: string;
    //Usado en Plazas
    fechaRegistroEtapa: string;

    idEtapaFase: number;
    codigoEtapa: string;
    descripcionRegimenLaboral: string;
    descripcionTipoProceso: string;
    fechaRegistro: string;
    fecha: string;
    descripcionGrupoModalidad: string;
    fechaRegistroProceso: string;
    idModalidad: string;
    esEstadoEnProceso: boolean;
    abreviaturaModalidadEducativa: string;
}

export class DocumentoSustentoModel {
    idDocumentoSustento: number = null;
    idLicencia: number = null;
    idTipoDocumentoSustento: number = null;
    idTipoFormatoSustento: number = null;
    numeroDocumentoSustento: string = null;
    entidadEmisora: string = null;
    fechaEmision: string = null;
    numeroFolios: number = null;
    sumilla: string = null;
    codigoDocumentoSustento: number = null;
    codigoAdjuntoSustento: string = null;
    fechaRegistro: string = null;

    descripcionTipoSustento: string;
    descripcionTipoFormato: string;
}

export class AscensoModel {
    registro: number;
    totalRegistro: number;
    idProceso: number;
    idEtapa: number;
    idTipoDocumento: number;
    numeroDocumento: number;
    idInstancia: number;
    idSubinstancia: number;
    idGrupoCompetencia: number;
    descripcionInstancia: string;
    descripcionSubinstancia: string;
    descripcionGrupoCompetencia: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    codigoPlaza: string;
    puntajeFinal: number;
    escalaObtenida: string;
    paginaActual: number;
    tamanioPagina: number;
    anio: number;
    descripcionProceso: string;
    descripcionRegimen: string;
    fecha: string;
    descripcion: string;
    descripcionEtapaFase: string;
    fechaCreacion: string;
    codigoProceso: string;
}

export class CalificacionModel {
    registro: number;
    totalRegistro: number;
    idProceso: number;
    idEtapa: number;
    idTipoDocumento: number;
    numeroDocumento: number;
    abreviaturaDocumento: string;
    idInstancia: number;
    idSubinstancia: number;
    idGrupoCompetencia: number;
    descripcionInstancia: string;
    descripcionSubinstancia: string;
    descripcionGrupoCompetencia: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    codigoPlaza: string;
    puntajeFinal: number;
    escalaObtenida: string;
    paginaActual: number;
    tamanioPagina: number;
    anio: number;
    descripcionProceso: string;
    descripcionRegimen: string;
    fecha: string;
    descripcion: string;
    descripcionGrupoModalidad: string;
    fechaRegistroEtapa: string;
    fechaRegistroProceso: string;
    descripcionEtapaFase: string;
    codigoProceso: string;
    abreviaturaRegimenLaboral: string;
}
export class CalificacionDetalleModel {
    numeroDocumento: number;
    abreviaturaDocumento: string;
    descripcionGrupoCompetencia: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    codigoPlaza: string;
    puntajeFinal: number;
    escalaObtenida: string;
    descripcionRegimen: string;
    descripcionGrupoModalidad: string;
    abreviaturaRegimenLaboral: string;
    numeroDocumentoCompleto: string;
    codigoModular: string;
    centroTrabajo: string;
    cargo: string;
    escalaMagisterial: string;
    areaCurricular: string;
    jornadaLaboral: string;
    descripcionInstancia: string;
    descripcionSubinstancia: string;
    descripcionRegimenLaboral: string;
    descripcionPlaza: string;
    puntajeEvaluacion: number;
    puntajeTrayectoria: number;
    puntajeBonificacion: number;
    puntajePUN: number;
    descripcionRegion: string;
}
export class AdjudicacionModel {
    registro: number;
    totalRegistro: number;
    idProceso: number;
    idEtapa: number;
    idTipoDocumento: number;
    numeroDocumento: number;
    idInstancia: number;
    idSubinstancia: number;
    idGrupoCompetencia: number;
    descripcionInstancia: string;
    descripcionSubinstancia: string;
    descripcionGrupoCompetencia: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombres: string;
    codigoPlaza: string;
    puntajeFinal: number;
    escalaObtenida: string;
    paginaActual: number;
    tamanioPagina: number;
    anio: number;
    descripcionProceso: string;
    descripcionRegimen: string;
    fechaCreacion: string;
    descripcion: string;
    codigoProceso: string;
    descripcionEtapaFase: string;
    detalleSubsanacion: string;
    situacionObservacion: boolean;
    descripcionMotivoSubsnacion: string;
    descripcionGrupoModalidad: string;
    fechaRegistroEtapa: string;
    fechaRegistroProceso: string;
    abreviaturaRegimenLaboral: string;
    numeroDocumentoCompleto: string;
    region: string;
    descripcionUgel: string;
    codigoModular: string;
    instituacion: string;
    cargo: string;
    escalaMagisterial: string;
    areaCurricular: string;
    jornadaLaboral: string;
    descripcionRegimenLaboral: string;
    descripcionPlaza: string;
    puntaje1: number;
    puntaje2: number;
    puntaje3: number;
    numeroResolucion: string;
    fechaResolucion: string;
    estado: number;

    observacionNoAdjudicacion: string;
    descripcionMotivoNoAdjudicacion: string;
}

export class PlazaModelS {
    registro: number;
    totalRegistro: number;
    idPlaza: number;
    codigoModular: string;
    descripcionInstitucionEducativa: string;
    abreviaturaModalidadEducativa: string;
    descripcionNivelEducativo: string;
    descripcionTipoGestionEducativa: string;
    nombreZona: string;
    eib: string;
    codigoPlaza: string;
    descripcionCargo: string;
    descripcionAreaCurricular: string;
    jornadaLaboral: number;
    descripcionTipoPlaza: string;
    descripcionMotivoVacancia: string;
    vigenciaInicio: string;
    vigenciaFin: string;

}

export class PlazaResponseModels {
    idPlaza: number;
    codigoModular: string;
    descripcionInstitucionEducativa: string;
    abreviaturaModalidadEducativa: string;
    descripcionNivelEducativo: string;
    descripcionTipoGestionEducativa: string;
    nombreZona: string;
    eib: string;
    codigoPlaza: string;
    descripcionCargo: string;
    descripcionAreaCurricular: string;
    jornadaLaboral: number;
    descripcionTipoPlaza: string;
    descripcionMotivoVacancia: string;
    nombreDistrito: string;
    fechaVigenciaDesde: string;
    fechaVigenciaHasta: string;
    descripcionEstadoPlaza: string;
    descripcionDre: string;
    descripcionUgel: string;
}

//Nuevo

export interface IRotacionGridModel {
    codigoProceso: string;
    abreviaturaRegimenLaboral: string;
    descripcionCausal: string;
    descripcionEtapaFase: string;
    descripcionNumeroConvocatoria: string;
    descripcionProceso: string;
    fechaCreacionProceso: string;
    descripcionEstadoProceso: string;
    descripcionEstadoEtapa: string;

    idProceso: number;
    codigoEstadoProceso: number;
    idEtapa: number;
    codigoEstadoEtapa: number;
    registro: number;
    totalRegistro: number;
}

export interface IPlazaRotacionModel {
    codigoModular: string;
    descripcionCentroTrabajo: string;
    descripcionModalidad: string;
    descripcionNivelEducativo: string;
    descripcionTipoGestion: string;
    zona: string;
    eib: string;
    codigoPlaza: string;
    descripcionCargo: string;
    descripcionSubTipoTrabajador: string;
    descripcionCategoriaRemunerativa: string;
    descripcionCantidadJornadaLaboral: string;
    descripcionTipoPlaza: string;
    descripcionMotivoVacancia: string;
    fechaVigenciaInicio: string;
    fechaVigenciaFin: string;
    idEstado: number;
    registro: number;
    totalRegistro: number;

    totalPlazasObs: number;
    totalPlazasConvocar: number;
}

export class PlazaRotacionModel implements IPlazaRotacionModel {
    codigoModular = null;
    descripcionCentroTrabajo = null;
    descripcionModalidad = null;
    descripcionNivelEducativo = null;
    descripcionTipoGestion = null;
    zona = null;
    eib = null;
    codigoPlaza = null;
    descripcionCargo = null;
    descripcionSubTipoTrabajador = null;
    descripcionCategoriaRemunerativa = null;
    descripcionCantidadJornadaLaboral = null;
    descripcionTipoPlaza = null;
    descripcionMotivoVacancia = null;
    fechaVigenciaInicio = null;
    fechaVigenciaFin = null;
    idEstado = null;
    registro = null;
    totalRegistro = null;

    totalPlazasObs = null;
    totalPlazasConvocar = null;
}

export interface IPlazaRotacionDetalleModel {
    codigoModular: string;
    centroTrabajo: string;
    instancia: string;
    subInstancia: string;
    distrito: string;
    modalidad: string;
    nivelEducativo: string;
    tipoInstitucionEducativa: string;
    tipoRuralidad: string;
    eib: string;
    tipoGestion: string;
    dependencia: string;
    codigoPlaza: string;
    regimenLaboral: string;
    condicionPlaza: string;
    tipoPlaza: string;
    cargo: string;
    grupoOcupacional: string;
    categoriaremunerativa: string;
    jornadaLaboral: string;
    fechaVigenciaInicio: string;
    motivoVacancia: string
}

export class MaestroPermisoPlazaModel {
    idMaestroPermisoPlaza: number;
    idMaestroEtapaProceso: number;
    idRolPassport: number;
    idTipoSede: number;
    incorporarPlaza: boolean;
    plazasConvocar: boolean;
    plazasObservadas: boolean;
    publicarPlazas: boolean;
    prepublicarPlazas: boolean;
    aperturarPlazas: boolean;
    aperturarPrepublicacion: boolean;
}

export class MaestroPermisoPostulacionModel {
    idMaestroPermisoPostulacion: number;
    idMaestroEtapaProceso: number;
    idRolPassport: number;
    idTipoSede: number;
    nuevoPostulante: boolean;
    aprobarPostulante: boolean;
    editarPostulante: boolean;
    eliminarPostulante: boolean;
    solicitarInformeEscalafonario: boolean;
}

export class MaestroPermisoCalificacionModel {
    idMaestroPermisoCalificacion: number;
    idMaestroEtapaProceso: number;
    idRolPassport: number;
    idTipoSede: number;
    realizarCalificacion: boolean;
    observarPostulante: boolean;
    registrarReclamo: boolean;
    generarOrdenMerito: boolean;
    publicarResultadoPreliminar: boolean;
    publicarResultadoFinal: boolean;
    publicadoFinal: boolean;
    publicadoPreliminar: boolean;
    tieneCalificacionPrelimiinar: boolean;
}

export class MaestroPermisoAdjudicacionModel {
    idMaestroPermisoAdjudicacion: number;
    idMaestroEtapaProceso: number;
    idRolPassport: number;
    idTipoSede: number;
    adjudicarPlaza: boolean;
    noAdjudicarPlaza: boolean;
    finalizarAdjudicacion: boolean;
    subsanarObservacion: boolean;
    finalizarEtapa: boolean;
}

export abstract class SubGridPaginadaDataSource extends DataSource<any> {
    private _dataChange = new BehaviorSubject<any>([]);
    private _loadingChange = new BehaviorSubject<boolean>(false);

    public loading = this._loadingChange.asObservable();
    public totalregistro = 0;

    constructor(
        private dataService: DataService,
        private dataServiceMethodPathParts: string[]
    ) {
        super();
    }

    load(filter: any, pageIndex, pageSize): void {
        const moduleConstructorPath: string = this
            .dataServiceMethodPathParts[0];
        const listGridPath: string = this.dataServiceMethodPathParts[1];

        let moduleConstructor = this.dataService[moduleConstructorPath];
        moduleConstructor = moduleConstructor.bind(this.dataService);
        const serviceModule = moduleConstructor();
        let serviceMethod = serviceModule[listGridPath];
        serviceMethod = serviceMethod.bind(serviceModule);

        serviceMethod(filter, pageIndex, pageSize)
            .pipe(
                catchError(() => of([])),
                finalize(() => {
                    this._loadingChange.next(false);
                })
            )
            .subscribe((response: any) => {
                this._dataChange.next(response.data || []);

                this.totalregistro =
                    (response.data || []).length === 0
                        ? 0
                        : response.data[0].totalRegistro;

                if ((response.data || []).length === 0) {
                    this.dataService
                        .Message()
                        .msgWarning(
                            "No se encontró información de acuerdo con los criterios de búsqueda ingresados.",
                            () => { }
                        );

                    this.onLoadError(response);
                } else {
                    this.onLoadSuccess(response);
                }
            });
    }

    connect(collectionViewer: CollectionViewer): Observable<[]> {
        return this._dataChange.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this._dataChange.complete();
        this._loadingChange.complete();
    }

    get dataTotal(): any {
        return this.totalregistro;
    }

    get data(): any {
        return this._dataChange.value || [];
    }

    abstract onLoadSuccess(response: any);
    abstract onLoadError(response: any);
}
