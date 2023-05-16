export enum ResultadoOperacionEnum {
    UnprocessableEntity = 422,
    NotFound = 404,
    InternalServerError = 500
}

export enum EstadoFaltaEnum {
    REGISTRADO = 10,
    PENDIENTE_DE_PROYECTO = 20,
    EN_PROYECTO = 3,
    RESOLUCION = 4,
    ELIMINADO = 5,
    INVESTIGADO=2,
    DECIDIDO=1
}

export enum SituacionLaboralEnum {
    cesante = 1,
    activo = 2,
}

export enum EstadoSancionEnum {
    PENDIENTE = 1,
    EN_PROYECTO = 2,
    RESOLUCION = 3,
    ELIMINADO = 5
}
export enum OrigenRegistroDSEnum {
    REGISTRO_LICENCIA = 1,
    GENERARACION_PROYECTO = 2
}
export enum TipoDocumentoIdentidadEnum {
    DNI = 1,
    CARNET_EXTRANJERIA = 2,
    PASAPORTE = 3
}
export enum GrupoAccionEnum {
    SANCIONES = 10,
    ASCENSOS = 2,
    
}
export enum CodigoRolEnum {
    RESPONSABLE_PERSONAL = 'AYNI_004',
    ESPECIALISTA_DITEN = 'AYNI_006',
    DIRECTOR_SANCIONES = 'AYNI_037'
    
}

