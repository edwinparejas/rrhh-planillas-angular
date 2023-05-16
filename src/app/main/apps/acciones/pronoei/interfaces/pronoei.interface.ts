export interface IPronoeiByIdPersona {
    tipoDocumentoIdentidad?: number;
    descTipoDocumentoIdentidad?: string;
    numeroDocumentoIdentidad?: string;
    nombres?: string;
    primerApellido?: string;
    segundoApellido?: string;
    idEstadoCivil?: number;
    descripcionEstadoCivil?: string;
    fechaNacimiento?: Date;
    fechaNacimientoStr?: string;
    idGenero?: number;
    descripcionGenero?: string;
    celular?: string;
    telefono?: string;
    email?: string;
}

export interface IPronoeiByIdIE {
    idCentroTrabajo?: number;
    codigoModular?: string;
    centroTrabajo?: string;
    descripcionZona?: string;
    codigoZona?: string;
    idModalidadEducativa?: number;
    descModalidadEducativa?: string;
    idNivelEducativo?: number;
    descNivelEducativo?: string;
    descTipoGestion?: string;
    descDependencia?: string;
    centroPoblado?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    descUgel?: string;
    descDre?: string;
}

export interface IPronoeiByIdRegGrupoAccion {
    codigoRegimenLaboral?: number;
    descripcionRegimenLaboral?: string;
    codigoGrupoAccion?: number;
    descripcionGrupoAccion?: string;
    codigoMotivoAccion?: number;
    descripcionMotivoAccion?: string;
    codigoAccion?: number;
    descripcionAccion?: string;
}

export interface IPronoeiByIdMaestroFormacionAcademica {
    idNivelEducativoFa?: number;
    idSecundaria?: number;
    idSuperior?: number;
    idNivelGradoAcademico?: number;
    idSituacionAcademica?: number;
}

export interface IPronoeiGetByIdResponse {
    idGestionPronoei?: number;
    fechaInicio?: Date;
    fechaInicioStr?: string;
    fechaFin?: Date;
    fechaFinStr?: string;
    codigoEstadoPronoei?: number;
    descripcionEstadoPronoei?: string;
    codEstadoResolucion?: number;
    descripcionEstadoResolucion?: string;
    propina?: number;
    descripcionTipoResolucion?: string;
    idNvlEducativo?: number;
    descripcionNvlEducativo?: string;
    idSitAcademica?: number;
    descripcionSitAcademica?: string;
    anotaciones?: string;
    esMandatoJudicial?: boolean;
    checkImpedimento?: boolean;
    persona?: IPronoeiByIdPersona;
    institucionEducativa?: IPronoeiByIdIE;
    regimenGrupoAccion?: IPronoeiByIdRegGrupoAccion;
    maestroFormacionAcademica?: IPronoeiByIdMaestroFormacionAcademica;
}