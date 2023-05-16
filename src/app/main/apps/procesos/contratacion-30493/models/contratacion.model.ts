export class EtapaResponseModel {
    idEtapa: number;
    idProceso: number;
    anio: number;
    idEtapaFase?: number;
    codigoProceso: string;
    descripcionEtapa: string;
    descripcionRegimenLaboral: string;
    descripcionEtapaFase: string;
    descripcionNumeroConvocatoria: string;
    descripcionTipoProceso: string;
    fechaCreacion: string;
    descripcionNivelEducativo?: string;
    descripcionCargosConvocados?: string;
    idRegimenLaboral?: number;
    idNivelEducativo?: number;
    codigoRegimenLaboral?: number;
    codigoEtapaFase: number;
    codigoEtapa: string;
    descripcioncargosconvocados?: string;
    descripcionEstadoEtapaProceso: string;

    // adicionales
    accesoPublicacionPlaza?: boolean;
    accesoValidarPlazas?: boolean;
    accesoAprobarPlazas?: boolean;
    accesoRechazarPlazas?: boolean;
    accesoPublicarPlazas?: boolean;
    accesoPostulantes?: boolean;
    accesoCargaMasivaPostulantes?: boolean;
    accesoEliminarCargaPostulantes?: boolean;
    accesoCalificacion?: boolean;
    accesoPublicarCalificacion?: boolean;
    accesoCargaMasivaCalificacion?: boolean;
    accesoEliminarCargaCalificacion?: boolean;
    accesoCalificacionAutomatica?: boolean;
    accesoAdjudicacion?: boolean;
    accesoPublicarAdjudicados?: boolean;
    accesoCargaMasivaAdjudicacion?: boolean;
    accesoEliminarCargaAdjudicacion?: boolean;
    accesoConsolidado?: boolean;
    accesoAprobarPlazaConsolidado?: boolean;
    accesoPlazaPrepublicada?: boolean;
    accesoPlazaResultadoFinal?: boolean;
    accesoRegistrarCalificacion?: boolean;
    accesoRegistrarReclamoCalificacion?: boolean;
    accesoFinalizarEtapa?: boolean;
    accesoAdjudicarPlaza?: boolean;
    accesoNoAdjudicarPlaza?: boolean;
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

export class ContratacionModel {
    idPlaza: number;
    idCentroTrabajo: number;
    idCargo: number;
    idTipoPlaza: number;
    idMotivoVacancia: number;
    idEstadoPlaza: number;
    codigoPlaza: string;
    jornadaLaboral: number;
    fechaDesde: Date;
    fechaHasta: Date;
    activo: boolean;
    fechaCreacion: Date;
    usuarioCreacion: string;
    ipCreacion: string;
    fechaModificacion: Date;
    usuarioModificacion: string;
    ipModificacion: string;
}

export class CalificacionModel {
    idCalificacion: number;
    idProceso: number;
    idEtapa: number;
    idPostulacion: number;
    idEstadoCalificacion: number;
    publicadoPreliminar: boolean;
    codigoCargaMasiva: string;
    detalleReclamo: string;
    noSePresento: boolean;
    ordenMerito: number;
    puntajeTotal: number;
    usuarioRegistro: string;
    requisitosMinimos: DetalleCalificacionModel[] = [];
    formacionesAcademicas: DetalleCalificacionModel[] = [];
    formacionesProfesionales: DetalleCalificacionModel[] = [];
    experienciasLaborales: DetalleCalificacionModel[] = [];
}

export class DetalleCalificacionModel {
    idDetalleCalificacion: number;
    idTipoCalificacion: number;
    idCriterioCalificacion: number;
    idTipoPuntaje: number;
    idDetalleCalificacionPadre: number;
    puntajeUnitario: number;
    cantidad: number;
    puntaje: number;
    acreditaDocumento: number;
}

export class AdjudicacionModel {
    idAdjudicacion: number;
    idProceso: number;
    idEtapa: number;
    idCalificacion: number;
    idEstadoAdjudicacion: number;
    idMotivoNoAdjudicacion: number;
    situacionNoAdjudicacion: string;
    idCargaAdjudicacion: number;
    observacionNoAdjudicacion: string;
    codigoAdjudicacion: number;
    ordenAdjudicacion: number;
    codigoDocumentoAdjudicacion: string;
    esado: boolean;
    activo: boolean;
    fechaCreacion: Date;
    usuarioCreacion: string;
    ipCreacion: string;
    fechaModificacion: Date;
    usuarioModificacion: string;
    ipModificacion: string;
}

export class PlazaModel {
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

export class PlazaResponseModel {
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

export class PostulacionModel {
    idPostulacion: number;
    idProceso: number;
    idEtapa: number;
    idPersona: number;
    idOrigenRegistro: number;
    idTipoVia: number;
    idTipoZona: number;
    idPais: number;
    idDistrito: number;
    idColegioProfesional?: number;
    idEstadoPostulacion: number;
    codigoPlaza: string;
    nombreVia: string;
    nombreZona: string;
    numeroVia: number;
    direccion: string;
    telefonoMovil: string;
    telefonoFijo: string;
    numeroRuc: string;
    numeroColegioProfesional: string;
    codigoPostulante: number;
    usuarioRegistro: string = null;
    ipRegistro: string = null;
    capacitaciones: CapacitacionModel[] = [];
    formacionesAcademica: FormacionAcademicaModel[] = [];
    experienciasLaborales: ExperienciaLaboralModel[] = [];
    datoPlazaPostular: DatoPlazaPostularModel = null;
    documentosSustento: DocumentoSustentoModel[] = [];

    idDepartamento: number = null;
    idProvincia: number = null;
    idTipoDocumentoIdentidad: number = null;
    numeroDocumentoIdentidad: string = null;
    numeroDocumentoIdentidadCompleto: string = null;
    fechaNacimiento: string = null;
    primerApellido: string = null;
    segundoApellido: string = null;
    nombres: string = null;
    descripcionDepartamento: string = null;
    descripcionProvincia: string = null;
    descripcionDistrito: string = null;
    descripcionGenero: string = null;
    descripcionNacionalidad: string = null;
    descripcionTipoVia: string = null;
    descripcionTipoZona: string = null;
    nombreColegioProfesional: string = null;

    experienciaLaboralCalc: ExperienciaLaboralCalc = null;
    plazaPostulada: PlazaPostuladaModel;
}

export class CapacitacionModel {
    idCapacitacion: number = null;
    idPostulacion?: number = null;
    idTipoCapacitacion: number = null;
    idPais: number = null;
    nombreCapacitacion: string = null;
    fechaInicio: Date = null;
    fechaFin: Date = null;
    duracionHoras: number = null;
    institucionCapacitacion: string = null;
    lugarCapacitacion: string = null;
    codigoAdjuntoSustento?: string = null;
    codigoCapacitacion: number = null;
    fechaCreacion: Date = null;
    descripcionTipoCapacitacion: string = null;
}
export class FormacionAcademicaModel {
    idFormacionAcademica: number = null;
    idPostulacion: number = null;
    idNivelEducativo: number = null;
    idGradoEstudio: number = null;
    idAreaCurricular: number = null;
    idCentroEstudio: number = null;
    idEstudiosCompletos: number = null;
    codigoFormacionAcademica: number = null;
    anioInicioEstudios: number = null;
    anioFinEstudios?: number = null;
    fechaExpedicionGradoEstudios: Date = null;
    codigoAdjuntoSustento?: string = null;
    beneficiarioPronabec?: boolean = null;
    fechaRegistro: Date = null;

    descripcionNivelEducativo: string = null;
    descripcionGradoEstudio: string = null;
    descripcionAreaCurricular: string = null;
    descripcionCentroEstudio: string = null;
    descripcionEstudiosCompletos: string = null;
}
export class ExperienciaLaboralModel {
    idExperienciaLaboral: number = null;
    idPostulacion: number = null;
    idTipoExperiencia: number = null;
    idNivelExperiencia: number = null;
    idTipoEntidad: number = null;
    cargoExperienciaLaboral: string = null;
    fechaInicio: Date = null;
    fechaFin: Date = null;
    nombreEntidad: string = null;
    codigoAdjuntoSustento?: string = null;
    codigoExperienciaLaboral: number = null;
    descripcionTipoExperiencia: string = null;
    descripcionNivelExperiencia: string = null;
    descripcionTipoEntidad: string = null;
}

export class DatoPlazaPostularModel {
    idDatoPostular: number = null;
    idCargo: number = null;
    idModalidadEducativa: number = null;
    idNivelEducativo: number = null;
    idAreaCurricular: number = null;
    descripcionCargo: string;
    descripcionModalidadEducativa: string;
    descripcionNivelEducativo: string;
    descripcionAreaCurricular: string;
}
export class ConsolidadoPlazaModel {
    idResumenPlaza: number = null;
    idProceso: number = null;
    idEtapa: number = null;
    idDre: number = null;
    idUgel: number = null;
    idEstadoConsolidado: number = null;
    codigoDocumentoPlazas?: string = null;
    fechaValidacion: string = null;
    fechaAprobacion: string = null;
    fechaRechazo: string = null;
    codigoEstadoConsolidado: number = null;
    descripcionEstadoConsolidado: string = null;
    esPublicado: boolean = null;
    descripcionPublicado: string = null;
}

export class ServidorPublicoModel {
    registro: number;
    totalRegistro: number;
    idServidorPublico: number;
    idPersona: number;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    numeroDocumentoIdentidadCompleto: string;
    nombreCompleto: string;
    fechaNacimiento: string;
    descripcionUgel: string;
    centroTrabajo: string;
    abreviaturaRegimenLaboral: string;
    situacionLaboral: string;
    idSituacionLaboral: number;
    descripcionGenero: string;
    descripcionNacionalidad: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
}

export class ExperienciaLaboralCalc {
    totalAnioGeneral: number = null;
    totalmesGeneral: number = null;
    diasRestanteGeneral: number = null;
    totalAnioEspecifico: number = null;
    totalmesEspecifico: number = null;
    diasRestanteEspecifico: number = null;
}

export class ComboItem {
    constructor(value: number, label: string) {
        this.value = value;
        this.label = label;
    }
    value: number;
    label: string;
}

export class OpcionFiltro {
    item = new ComboItem(-1, "--TODOS--");
}

export class ResumenPlazasResponseModel {
    idProceso: number = null;
    idEtapa: number = null;
    totalPlazasPrepublicadas: number = null;
    totalPlazasObservadas: number = null;
    totalPlazasConvocar: number = null;
}

export class PlazaGrillaModel {
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
    jornadaLaboral: string;
    descripcionTipoPlaza: string;
    descripcionMotivoVacancia: string;
    codigoCentroTrabajo: string;
    idPlazaContratacion: number;
    descripcionRegimenLaboral: string;
    idGrupoInscripcion: number;
    descripcionGrupoInscripcion: string;
}

export class PlazaPostuladaModel {
    idPlazaPostulada: number;
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
    jornadaLaboral: string;
    descripcionTipoPlaza: string;
    descripcionMotivoVacancia: string;
    codigoCentroTrabajo: string;
    idPlazaContratacion: number;
    descripcionRegimenLaboral: string;
    idGrupoInscripcion: number;
    descripcionGrupoInscripcion: string;
}

export class CalificacionResponse {
    idPostulacion: number;
    idProceso: number;
    idEtapa: number;
    idPersona: number;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    numeroDocumentoIdentidadCompleto: string;
    fechaNacimiento: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    descripcionGenero: string;
    descripcionModalidadEducativa: string;
    descripcionNivelEducativo: string;
    descripcionAreaCurricular: string;
    descripcionCargo: string;
    jornadaLaboral: number;
    descripcionRegimenLaboral: string;
    idCalificacion: number;
    descripcionGrupoInscripcion: string;
    puntajeTotal: number;
    puntajeFormacionAcademica: number;
    puntajeFormacionProfesional: number;
    puntajeExperienciaLaboral: number;
    puntajeEvaluacionExpediente: number;
    puntajeDesempate: number;
    publicadoPreliminar: boolean;
    noSePresento: boolean;
    empate: boolean;
}

export class ResumenAdjudicacionesResponse {
    totalPostulantes: number;
    totalAdjudicados: number;
    totalNoAdjudicados: number;
    totalPendientes: number;
}

export class CustomAdjudicacionResponse {
    numeroDocumentoIdentidad: string;
    nombreCompleto: string;
    descripcionGenero: string;
    codigoModular: string;
    descripcionInstitucionEducativa: string;
    descripcionDre: string;
    descripcionUgel: string;
    descripcionDistrito: string;
    abreviaturaModalidadEducativa: string;
    descripcionNivelEducativo: string;
    descripcionTipoGestionEducativa: string;
    nombreZona: string;
    eib: string;
    descripcionTipoGestionInstitucionEducativa: string;
    descripcionDependencia: string;
    codigoPlaza: string;
    descripcionCargo: string;
    descripcionAreaCurricular: string;
    jornadaLaboral: number;
    descripcionTipoPlaza: string;
    descripcionMotivoVacancia: string;
    vigenciaInicio: string;
    vigenciaFin: string;
    abreviaturaRegimenLaboral: string;
    vigenciaInicioContrato: string;
}

export enum RegimenLaboralContratacionCodigoEnum {
    LEY_30512 = 2,
    LEY_30328 = 3,
    LEY_30493 = 4,
}

export enum TipoProcesoContratacionCodigoEnum {
    Contratacion = 1,
}

export enum EtapaProcesoContratacionCodigoEnum {
    Unica = 12,
    PublicacionPlaza = 13,
    ContratacionDirecta = 14,
    ContratacionResultadosPUN = 15,
    ContratacionEvaluacionExpedientes = 16,
}

export enum EtapaProcesoCodigoEnum {
    UNICA = 5,
    PUBLICACION_PLAZAS = 6,
    CONTRATACION_DIRECTA = 7,
    CONTRATACION_RESULTADOS_PUN = 8,
    CONTRATACION_EVALUACION_EXPEDIENTES = 9
}

export enum DescripcionMaestroProcesoEnum {
    PRE_PUBLICACION_DE_PLAZAS = 4,
    CONTRATACION_DOCENTE = 5
}

export enum EstadoDesarrolloProcesoContratacionCodigoEnum {
    Pendiente = 1,
    Iniciado = 2,
    Finalizado = 3,
    Cancelado = 4,
}

export enum NivelInstanciaCodigoEnum {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3,
}

export enum TipoCentroTrabajoCodigoEnum {
    Minedu = 1,
    SedeAdministrativaDRE = 2,
    InstitucionEducativaDRE = 3,
    InstitutoSuperiorDRE = 4,
    SedeAdministrativaUGEL = 5,
    InstitucionEducativaUgel = 6,
    InstitutoSuperiorUgel = 7,
    SedeCentroLaboralDre = 8,
    SedeCentroLaboralUgel = 9,
}

export interface IActualizarPlazaContratacionSiEsBecarioViewModel {
    idEtapaProceso: number;
    idPlazaContratacion: number,
    esBecarioOrigen: boolean;
    esBecarioDestino: boolean;
    marcarTodos: boolean;
    plazas: IPlazaContratacionSiEsBecarioViewModel[];
    usuarioModificacion: string;
}

export interface IActualizarEtapaProcesoViewModel {
    idEtapaProceso: number;
    idEstadoDesarrollo: number;
    usuarioModificacion: string;
    codigoCentroTrabajo?:string;
}

export interface IPlazaContratacionSiEsBecarioViewModel {
    idPlazaContratacionDetalle: number;
}

export interface IActualizarPlazaPublicacionSituacionValidacionViewModel {
    idEtapaProceso: number;
    plazas: IPlazaContratacionViewModel[],
    plazasConvocar: IPlazaContratacionConvocarViewModel[];
    plazasObservar: IPlazaContratacionObservarViewModel[];
    usuarioModificacion: string;
    codigoCentroTrabajoMaestro:string;
}

export interface IPlazaContratacionViewModel {
    idPlazaContratacion: number;
}

export interface IPlazaContratacionConvocarViewModel {
    idPlazaContratacionConvocar: number;
}

export interface IPlazaContratacionObservarViewModel {
    idPlazaContratacionObservar: number;
}

export class PlazasPublicacionInformacionResponseModel {
    idPlaza: number;
    idPlazaContratacion: number;
    codigoCentroTrabajo: string;
    institucionEducativa: string;
    instancia: string;
    subInstancia: string;
    modalidad: string;
    nivelEducativo: string;
    tipoInstitucionEducativa: string;
    tipoGestion: string;
    dependencia: string;
    modeloServicio: string;
    tipoRuralidad: string;
    ieb: boolean;
    formaAtencion: string;
    lenguaOriginaria: string;
    frontera: boolean;
    vraem: string;
    codigoPlaza: string;
    cargo: string;
    jornadaLaboral: string;
    areaCurricular: string;
    especialidad: string;
    tipoPlaza: string;
    vigenciaInicio: string;
    vigenciaFin: string;
    regimenLaboral: string;
    motivoVacancia: string;
}

export interface IGenerarPdfPlazasPublicadas {
    idEtapaProceso: number,
    idEstadoValidacion: number,
    maestroProceso: string,
    anio: number,
    instancia: string,
    subInstancia: string,
    usuarioCreacion: string
}

export interface ISustentoMotivosObservacionViewModel {
    motivosNoPublicacion: ISustentoMotivoObservacionViewModel[];
}

export interface ISustentoMotivoObservacionViewModel {
    idTipoFormato: number,
    idTipoDocumento: number,
    idPlazaContratacion: number,
    codigoDocumento: number,
    numeroDocumento: string,
    entidadEmisora: string,
    fechaEmision: Date,
    numeroFolios: number,
    sumilla: string,
    codigoAdjuntoSustento: string,
    fechaCreacion: Date,
    usuarioCreacion: string
}

export interface IActualizarIdDocumentoSustentoViewModel {
    idMotivoNoPublicacion: number,
    detalleNoPublicacion: string,
    plazasObservar: IPlazaContratacionObservarViewModel[],
    usuarioModificacion: string,
    flag: number
}

export interface IGenerarPdfPlazasPrePublicadas {
    idEtapaProceso: number,
    maestroProceso: string,
    anio: number,
    instancia: string,
    usuarioCreacion: string
}

export interface IActualizarPlazaPrePublicacionViewModel {
    idEtapaProceso: number,
    usuarioModificacion: string,
}

export interface IPublicarPlazasContratacionDirectaViewModel {
    idEtapaProceso: number;
    plazasPublicar: IPlazaIncorporadaViewModel[];
    usuarioModificacion: string;
}

export interface IPlazaIncorporadaViewModel {
    idPlazaContratacion: number;
}

export interface IGenerarPdfPlazasContratacionDirecta {
    maestroProceso: string,
    anio: number,
    subInstancia: string,
    usuarioCreacion: string,
    idEtapaProceso: number,
    idGrupoDocumento: number,
    activo: boolean
}

export interface IPlazasContratacion {
    esBecario: boolean
}

export interface IPlazasContratacionValidacion {
    idEtapaProceso: number,
    idSituacionValidacion: number,
    codigoCentroTrabajoMaestro:string
}

export interface IPlazasContratacionDirecta {
    plazasPublicar: IPlazaIncorporadaViewModel[];
    idSituacionValidacion: number,
    flag: number
}

export interface IPlazasContratacionResultadosPUN {
    plazasPublicar: IPlazaIncorporadaPUNViewModel[];
    idSituacionValidacion: number,
    flag: number
}

export interface IPublicarPlazasContratacionResultadosPUNViewModel {
    idEtapaProceso: number;
    plazasPublicar: IPlazaIncorporadaPUNViewModel[];
    usuarioModificacion: string;
}

export interface IPlazaIncorporadaPUNViewModel {
    idPlazaContratacion: number;
}
export interface IPostulanteContratacionDirecta {
    idEtapaProceso: number,
    idPersona: number,
    idPlazaContratacionDetalle: number,
    idEstadoPostulacion: number,
    idTipoRegistro: number,
    edad: number,
    numeroExpediente: string,
    fechaExpediente: Date,
    activo: boolean,
    usuarioCreacion: string,
    codigoCentroTrabajoMaestro?:string
}

export interface IEliminarPostulanteContratacionDirecta {
    idPostulacion: number,
    estadoPostulacion: number,
    activo: boolean,
    usuarioModificacion: string
}

export interface IAprobarPostulanteContratacionDirecta {
    idEtapaProceso: number,
    estadoPostulacion: number,
    estadoRegistrado: number,
    usuarioModificacion: string,
    codigoCentroTrabajoMaestro?:string
}

export interface IModificarPostulanteContratacionDirecta {
    idPostulacion: number,
    idPlazaContratacionDetalle: number,
    numeroExpediente: string,
    fechaExpediente: Date,
    usuarioModificacion: string
}
