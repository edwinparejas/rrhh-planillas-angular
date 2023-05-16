import { CargaMasivaComponent } from '../../../components/carga-masiva/carga-masiva.component';

export interface IGenerarPdfPlazasPrePublicadas {
    idEtapaProceso: number,
    idDesarrolloProceso?: number,
    // maestroProceso: string,
    anio: number,
    // instancia: string,
    usuarioCreacion: string
}

export interface IActualizarEtapaProcesoViewModel {
    idEtapaProceso: number;
    idDesarrolloProceso?: number;
    //idEstadoDesarrollo: number;
    usuarioModificacion: string;
    // codigoCentroTrabajoMaestro?:string;
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
    item = new ComboItem(-1, '--TODOS--')
}

export class MotivoCancelacionModal{
    id: number;
    descripcion: string;
}


export class EtapaProcesoResponseModel{
    idProceso: number;
    idEtapaProceso: number;
    registro: number;
    idDesarrolloProceso?: number;
    anio: number;
    anioProceso: number;
    codigo: string; 
    codigoProceso: string; 
    proceso: string;
    maestroProceso: string;
    numeroConvocatoria: string;
    etapa: string;
    etapaFase: string;
    fechaCreacion: Date;
    fechaCreacionProceso: string;
    estadoProceso: string;
    fechaCorte: Date;
    regimenLaboral: string;

    accesoCargaMasivaCalificacion: boolean;
    accesoEliminarCargaCalificacion: boolean;


    // idEtapaProceso: string;
    // idDesarrolloProceso: number;
    // idAlcanceProceso: number;
    // anioProceso: string;
    // codigoProceso: string;
    // regimenLaboral: string;
    // maestroProceso: string;
    // numeroConvocatoria: string;
    // etapaFase: string;
    // fechaCreacionProceso: string;
    // estadoProceso: string;
    // codigoEstadoProceso: number;
    // codigoCentroTrabajo: string;
    // idCentroTrabajo: string;
    // centroTrabajo: string;
    // descripcionDre: string;
    // descripcionUgel: string;
    // esRolMonitor: boolean;

    // fecha_corte: Date;
}

export class ValidacionPlazaModel{
    idpr: number;
    descripcion: string;
}

export class PlazaReasignacionResponseModel{
    registro: number;
    idep: number;
    instancia: string;
    subinstancia: string;
    codigo_modular: string;
    centro_trabajo: string;
    modalidad: string;
    nivel_educativa: string;
    tipo_gestion: string;
    codigo_plaza: string;
    cargo: string;
    area_curricular: string;
    tipo_plaza: string;
    vigencia_inicio: Date;
    vigencia_fin: Date;

    
    accesoCargaMasivaPostulantes: boolean;
}

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

export class ResumenAdjudicacionesResponse {
    totalPostulantes: number;
    totalAdjudicados: number;
    totalNoAdjudicados: number;
    totalPendientes: number;
}
/*
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
}*/

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

export class ResumenPlazasResponseModel {
    idProceso: number = null;
    idEtapa: number = null;
    totalPlazasPrepublicadas: number = null;
    totalPlazasObservadas: number = null;
    totalPlazasConvocar: number = null;
}

export class CentroTrabajoModel {
    idCentroTrabajo: number = null;
    idTipoCentroTrabajo?: number = null;
    idOtraInstancia?: number = null;
    idDre?: number = null;
    idUgel?: number = null;
    codigoCentroTrabajo: string = null;
    idInstitucionEducativa?: number = null;
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

export class DatoConsolidadoModel {
    instancia: string;
    subinstancia: string;
    situacion: string;
    proceso_aprobacion: string;
    instancia_solicitante: string;
    usuario_solicitante: string;
    fecha_solicitante: Date;
    instancia_aprobador: string;
    usuario_aprobador: string;
    fecha_aprobador: Date;
    motivo: string;
}

export class DatosServidorPublicoModel{
    idsp: number;
    idper: number;
    tipo_documento: String;
    documento_identidad: string;
    primer_apellido: string;
    segundo_apellido: string;
    nombres: string;
    sexo: string;
    //datos laborales
    codigo_plaza: string;
    regimen_laboral: string;
    cargo: string;
    condicion_laboral: string;
    situacion_laboral: string;
    escala_remunerativa: string;
    codigo_modular: string;
    centro_trabajo: string;
    instancia: string;
    subinstancia: string;
    tipo_plaza: string;
    vigencia_inicio: string;
    vigencia_fin: string;
} 

export class DatosModificarServidorPublico{
    num_exp: string;
    fech_exp: any;
    idc:number;
    desc_cau: string;
    idetp:number;
    desc_etp: string;
    num_cala: string;
    fech_cala:any;
    docu_cala: string;
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



// ********************************************************

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
}

// ******************* mover a otro archivo
export enum RubroCalificacionEnum{
    RESULTADOS_PUN = 1,
    REQUISITOS_GENERALES = 2,
    REQUISITOS_ESPECIFICOS = 3,
    VERIFICAR_IMPEDIMENTOS = 4,
    FORMACION_ACADEMICA_PROFESIONAL = 5,
    FORMACION_CONTINUA = 6,
    EXPERIENCIA_LABORAL = 7,
    MERITOS = 8
}

export enum ResultadoCalificacionEnum {
    PRELIMINAR = 1,
    FINAL = 2
}

export enum TipoPuntajeEnum {
    CUMPLE = 1,
    PUNTAJE = 3,
    NO_APLICA = 2
}

export enum ResultadoOperacionEnum {
    OK = 200,
    UnprocessableEntity = 422,
    NotFound = 404,
    InternalServerError = 500
}



export enum TablaPermisos {
    Acceder = 1,
    Consultar = 2,
    Agregar = 3,
    Modificar = 4,
    Eliminar = 5
}

export enum TablaMetodosReasignacion {
    GET_FILTROS_PROCESO = 1,
    GRID_PROCESOS_ETAPAS = 2,
    EXPORTAR_PROCESOS_ETAPAS = 3,
    PROCESO_POSTULACION_PLAZAS = 4,
    PROCESO_POSTULANTES = 5,
    PROCESO_CALIFICACIONES = 6,
    PROCESO_ADJUDICACIONES = 7,
    CONSULTAS_SUSTENTO_NO_PUBLICACION = 8,
    REGISTRAR_SUSTENTO_NO_PUBLICACION = 9,
    GET_BUSCAR_CENTRO_TRABAJO = 10,
    CONSULTAR_CENTRO_TRABAJO = 11,
    GET_LISTAR_PLAZA = 12,


}

export enum TablaTipoDocumentoIdentidad {
    DNI = 1,
    PASAPORTE = 4,
    CARNET_DE_EXTRANJERIA = 5,
}

export enum TablaEstadosDesarrolloProceso {
    PENDIENTE = 1,
    INICIADO = 2,
    FINALIZADO = 3,
    CANCELADO = 4,
}

export enum MensajesSolicitud {
    M01 = 'DEBE INGRESAR POR LO MENOS UN CRITERIO DE BÚSQUEDA',
    M02 = '¿ESTÁ SEGURO DE QUE DESEA GUARDAR LA INFORMACIÓN?',
    M03 = '¿ESTÁ SEGURO DE QUE DESEA GUARDAR LOS CAMBIOS?',
    M04 = '¿ESTÁ SEGURO DE QUE DESEA ANULAR LA INFORMACIÓN?',
    M05 = '¿ESTÁ SEGURO DE QUE DESEA ELIMINAR LA INFORMACIÓN?',    
    M06 = '¿ESTÁ SEGURO DE QUE DESEA RECHAZAR LA INFORMACIÓN?',
    M07 = 'OPERACIÓN REALIZADA DE FORMA EXITOSA',
    M08 = 'COMPLETAR LOS DATOS REQUERIDOS',
    M09 = 'NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS',
    ERROR = 'Ocurrieron algunos problemas al guardar la información, por favor intente dentro de unos segundos, gracias.'
} 

export enum CatalogoItemEnum {
    CATALOGO_ITEM_ORDEN_PRIMERO = 1,
    CATALOGO_ITEM_ORDEN_SEGUNDO = 2,
    CATALOGO_ITEM_ORDEN_TERCERO = 3,
    TIPOS_DOCUMENTOS_IDENTIDAD = 6,
    TIPO_FORMATO_DOCUMENTO = 15,
    ESTADOS_POSTULANTE = 17,
    ESTADOS_CONSOLIDADO = 18,
    NACIONALIDADES = 19,
    MOTIVO_NO_PUBLICACION = 41,
    TIPO_DOCUMENTO = 42,
    ESTADO_RESULTADO_FINAL = 31,
    ESTADO_CALIFICACION = 107,
    ESTADO_ADJUDICACION = 104,    
    RUBRO_CALIFICACION = 42,
    MOTIVO_NO_ADJUDICACION = 102,
    MOTIVO_NO_CALIFICACION = 29,
}
// export class InformacionPlazaPrepublicadaResponseModel {
//     idEtapa: number;
//     idProceso: number;
//     anio: number;
//     idEtapaFase: number;
//     codigoProceso: string;
//     codigoEtapa: string;
//     descripcionEtapa: string;
//     descripcionRegimenLaboral: string;
//     abreviaturaRegimenLaboral: string;
//     descripcionEtapaFase: string;
//     descripcionNumeroConvocatoria: string;
//     descripcionTipoProceso: string;
//     descripcionProceso: string;
//     descripcionCausal: string;
//     descripcionConvocatoria: string;
//     fechaRegistro: string;
//     fecha: string;
//     descripcionGrupoModalidad: string;
//     fechaRegistroEtapa: string;
//     fechaRegistroProceso: string;
//     idModalidad: string;
//     esEstadoEnProceso: boolean;
//     abreviaturaModalidadEducativa: string;
// }

export class PlazasPrepublicadasResponseModel {
    idDetalle: number;
    codigo_modular: string;
    centro_trabajo: string;
    modalidad: string;
    nivel_educativo: string;
    tipo_gestion: string;
    codigo_plaza: string;
    area_curricular: string;
    tipo_plaza: string;
    vigenciaInicioText: string;
    vigenciaFinText: string;       
}

export enum MISSING_TOKEN {
    INVALID_TOKEN = 'invalid_token'
}

export const PASSPORT_MESSAGE = {
    //GENERIC MESSAGES
    END_SESION: 'SU SESIÓN HA EXPIRADO, UD. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN',
    UNAUTHORIZED: 'UD. NO SE ENCUENTRA AUTORIZADO PARA ACCEDER AL SISTEMA. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN',
    PERMISO_NOT_FOUND: "UD. NO TIENE PERMISO PARA REALIZAR ESTA OPERACIÓN. COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA",
    BAD_REQUEST: 'EL SERVIDOR NO ENTENDIÓ LA SOLICITUD DEL USUARIO, SE HA PRODUCIDO UN ERROR INESPERADO EN UNO DE NUESTROS SERVIDORES.',
    BAD_TOKEN: 'EL SERVIDOR NO RETORÓ LA AUTORIZACIÓN PARA ACCEDER A LOS SERVICIOS DEL SERVIDOR PÚBLICO, SERÁ REDIRIGIDO AL PANEL DE SISTEMAS. GRACIAS.',
    NOT_FOUND: 'ERROR, UDS. NO SE ENCUENTRA REGISTRADO EN EL SISTEMA. COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BUTTON_UNAUTHORIZED: 'UD. NO TIENE PERMISO PARA REALIZAR ESTA OPERACIÓN. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN.',
    METHOD_UNAUTHORIZED: 'UD. NO SE ENCUENTRA AUTORIZADO PARA ACCEDER A UNO O MAS OPERACIONES. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN.',
    NOT_ALLOWED: 'EL SISTEMA NO PUDO ACCEDER A LOS SERVIDORES DE AUTORIZACIÓN. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN.',
    OPERATION_NOT_FOUND: 'UD. NO TIENE OPERACIONES Y PERMISOS DE PASSPORT ASIGNADOS, SERA REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN.',
    END_SESSION: 'UD. ESTÁ CERRANDO LA SESIÓN DEL USUARIO, SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN. GRACIAS.',
    SESION_END: "SU SESIÓN HA CADUCADO. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN.",
    CREDENTIALS_UNAUTHORIZED: "NO PUDO OBTENER CREDENCIALES DE ACCESO, UD. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN.",
    // API MESSAGES
    BUSCAR_SISTEMA_PERMISO_USUARIO: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "PERMISOS DE USUARIO AL SISTEMA". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BUSCAR_SESION: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "SESIONES DEL USUARIO". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BUSCAR_USUARIO: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "INFORMACION DEL USUARIO". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BUSCAR_MENU: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "MENU". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BUSCAR_ROL_USUARIO: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "ROLES DEL USUARIO". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BUSCAR_ACCION: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "ACCIONES". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BUSCAR_AUTHORIZACION: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "PERMISOS". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.',
    BOOT: 'ERROR, NO SE PUDO ACCEDER AL SERVICIO PASSPORT "BOOT". SI PERSISTE EL ERROR, COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA.'
}