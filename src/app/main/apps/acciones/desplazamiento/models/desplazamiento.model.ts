import * as internal from "events";

export class EtapaResponseModel {
    idEtapa: number;
    idProceso: number;
    anio: number;
    idEtapaFase: number;
    codigoProceso: string;
    codigoEtapa: string;
    descripcionEtapa: string;
    descripcionRegimenLaboral: string;
    abreviaturaRegimenLaboral: string;
    regimenLaboral: string;
    descripcionEtapaFase: string;
    descripcionNumeroConvocatoria: string;
    descripcionTipoProceso: string;
    descripcionProceso: string;
    descripcionCausal: string;
    descripcionConvocatoria: string;
    fechaRegistro: string;
    fecha: string;
    descripcionGrupoModalidad: string;
    fechaRegistroEtapa: string;
    fechaRegistroProceso: string;
    idModalidad: string;
    idModalidadEducativa: string;
    idNivelEducativo: string;
    esEstadoEnProceso: boolean;
    abreviaturaModalidadEducativa: string;
    codigo: string;
    fechaCreacionProceso: string;
    tipoProceso: string;
    proceso: string;
    idCatalogoItem: string;
    codigoCatalogoItem: string;
    etapa: string;

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
export class PlazaOrigen {

    areaCurricular?: string;
    cargo?: string;
    grupoOcupacional?: string;
    categoriaRemunerativa?: string;
    codigoPlazaOrigen?: string;
    itemPlaza?: number;
    condicionLaboral?: string;
    institucionEducativa?: string;
    jornadaLaboral?: string;
    modalidadEducativa?: string;
    nivelEducativo?: string;
    regimenLaboral?: string;
    tipoCargo?: string;
    tipoPlaza?: string;
    codigoPlazaDestino?: string;
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

export class AdjudicacionDetalleModel {
    numeroDocumento: number;
    documentoIdentidad: number;
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
    puntajeEvaluacion: number;
    puntajeTrayectoria: number;
    puntajeBonificacion: number;
    puntajePUN: number;
    descripcionRegion: string;
    numeroResolucion: string;
    fechaResolucion: string;
    estado: string;
    idEstado: number;
    primerApellido: string;
    segundoApellido: string;
    sexo: string;
    regimenLaboral: string;
    categoriaRemunerativa: string;
    codigo: string;
    fechaNacimiento: string;
    grupoCompetencia: string;
    tipoCargo: string;
    condicionLaboral: string;
    puntajePun: string;
    bonificacionDiscapacidad: string;
    nivelEducativo: string;
}
export class AccionPersonalModels {
    documentoIdentidad: string;
    numeroDocumentoIdentidad: string;
    primerApellido: string;
    segundoApellido: string;
    nombre: string;
    estadoCivil: string;
    sexo: string;
    fechaNacimiento: string;
    grupoAccion: string;
    accion: string;
    motivoAccion: string;
    fechaInicio: string;
    codigoPlazaOrigen: string;
    regimenLaborarOrigen: string;
    centroTrabajoOrigen: string;
    modalidadEducativaOrigen: string;
    nivelEducativoOrigen: string;
    areaCurricularOrigen: string;
    cargoOrigen: string;
    jornadaLaboralOrigen: string;
    tipoCargoOrigen: string;
    categoriaRemunerativaOrigen: string;
    tipoPlazaOrigen: string;
    condicionPlazaOrigen: string;
    codigoPlazaDestino: string;
    regimenLaboralDestino: string;
    centroTrabajoDestino: string;
    modalidadEducativaDestino: string;
    nivelEducativoDestino: string;
    areaCurricularDestino: string;
    cargoDestino: string;
    jornadaLaboralDestino: string;
    tipoCargoDestino: string;
    categoriaRemunerativaDestino: string;
    tipoPlazaDestino: string;
    condicionPlazaDestino: string;
    tipoDocumentoSustento: string;
    numeroDocumentoSustento: string;
    entidadEmisora: string;
    tipoFormatoSustento: string;
    fechaEmision: string;
    folios: string;
    sumilla: string;
    estado: string;
    detalleObservacionAdjudicacion: string;
    codigoAprobacion: string;
    numeroProyectoResolucion: string;
    documentoProyectoResolucion: string;
    codigoEstadoDesplazamiento: string;
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
    cargo: string;
    centroTrabajo: string;
    modalidad: string;
    nivelEducativo: string;
    dependencia: string;
    tipoGestion: string;
    tipoPlaza: string;
    tipoIE: string;
    regimenLaboral: string;
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

export class CabeceraDatosAccion {
    idRegimenLaboral: number;
    abreviaturaRegimenLaboral: string;
    idGrupoAccion: number;
    abreviaturaGrupoAccion: string;
    idAccion: number;
    abreviaturaAccion: string;
    idMotivoAccion: number;
    abreviaturaMotivoAccion: string;
}

export class EnviarAccionGrabada {
    usuarioCreacion: string;
    numeroDocumentoIdentidad: string;
    codigoTipoDocumentoIdentidad: number;
    codigoTipoSede: string;
    codigoSede: string;
    accionesPersonalDesplazamiento: any[];
}

export class AccionesPersonalDesplazamiento {
    idAccionPersonal: number;
}

export class idRegimenLaboral {
    abreviaturaRegimenLaboral: string;
    idRegimenLaboral: number;
}

export class ValidarAdjudicacionPorServidorPublico {
    idServidorPublico: number;
    mensaje: string;
    esValido: boolean;
    adjudicado: 1
    areaCurricular: string;
    cargo: string;
    grupoOcupacional: string;
    categoriaRemunerativa: string;
    codigoPlazaDestino: string;
    itemPlaza: number;
    condicionLaboral: string;
    documentoEscalafonario: string;
    fechaFinAdjudicacion: string;
    fechaInformeEscalafonario: string;
    fechaInicioAdjudicacion: string;
    idAdjudicacionProceso: number;
    codigoAdjudicacionProceso: number;
    institucionEducativa: string;
    jornadaLaboral: string;
    modalidadEducativa: string;
    nivelEducativo: string;
    regimenLaboral: string;
    situacionLaboral: string;
    tiempoServicio: string;
    tipoCargo: string;
    tipoPlaza: string;
    vigenciaFin: string;
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

export enum TablaUsuarioRol {
    ResponsablePersonal = 1,
    EspecialistaDITEN = 2,
    EspecialistaUPP = 3,
    EspecialistaAIRHSP = 4,
    ResponsablePresupuesto = 5
}