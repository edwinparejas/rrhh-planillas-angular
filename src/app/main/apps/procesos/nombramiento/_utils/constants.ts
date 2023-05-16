export enum EstadoProcesoEnum {
    EN_PROCESO = 4,
    DESIERTO = 7,
    CANCELADO = 6,
    ELIMINADO = 5,
    FINALIZADO = 8
}

export enum ResultadoOperacionEnum {
    NotFound = 404,
    UnprocessableEntity = 422
}

export enum CatalogoItemEnumNombramiento {
    ESTADO_ETAPA = 100,
    ESTADO_DESARROLLO = 102,
    ESTADO_DESARROLLO_PROCESO = 112,
    MOTIVO_OBSERVACION = 105,
    TIPO_DOCUMENTO_SUSTENTO = 20,
    TIPO_FORMATO_SUSTENTO = 33,
    ESTADO_CONSOLIDADO = 120,
    TIPO_DOCUMENTO_IDENTIDAD = 121,
    ESTADO_ADJUDICACION = 122,
    ESTADO_CALIFICACION = 124,
    MOTIVO_OBSERVACION_CALIFICACION = 126
}

export enum CatalogoEstadoDesarrolloEnum {
    PENDIENTE = 1,
    INICIADO = 2,
    FINALIZADO = 3,
    CANCELADO = 4,
}

export enum CatalogoEstadoConsolidadoPlazaEnum {
    PENDIENTE = 1,
    VALIDADO = 2,
    RECHAZADO = 3,
    APROBADO = 4
}

export enum CatalogoSituacionValidacionEnum {  
    PRE_PUBLICADA = 1,
    A_CONVOCAR= 2,
    OBSERVADA= 3
}

export enum CatalogoEstadoValidacionPlazaEnum {
    PENDIENTE = 1,
    VALIDADO = 2,
    RECHAZADO = 3,
    APROBADO = 4,
    PUBLICADO = 5,
}

export enum CatalogoTipoProcesoEnum {
	// CONTRATACION = 1,
    NOMBRAMIENTO = 2,
	// ENCARGATURA = 3,
	// REASIGNACION = 4,
	// DESIGNACION = 5,
	// ROTACION = 6,
	// ASCENSO = 7,
	// CUADRO_HORAS_PEDAGOGICAS = 8
}

export enum CatalogoEstadoProcesoEnum {
    EN_PROCESO = 1,
	DESIERTO = 2,
	CANCELADO = 3,
	ELIMINADO = 4,
	FINALIZADO = 5
}

export enum CatalogoEstadoConsolidadoEnum {
    PENDIENTE = 1,
    VALIDADO = 2,
    RECHAZADO = 3,
    APROBADO = 4,
}

export enum CatalogoEstadoClasificaionEnum {
    PENDIENTE = 1,
    APTO = 2,
    NO_APTO = 3,
    OBSERVADO = 4,
}