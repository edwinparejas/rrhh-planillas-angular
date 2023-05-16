export enum EstadoProcesoEnum {
    EN_PROCESO = 1,
    ELIMINADO = 2,
    CANCELADO = 3,
    DESIERTO = 4,
    FINALIZADO = 5,
}

export enum EstadoPlazaEnum {
    VACANTE = 1,
    OCUPADA = 2,
    PENDIENTE = 3,
    VALIDADO = 4,
    RECHAZADO = 5,
    APROBADO = 6
}

export enum CodigoTipoOperacionSustentoEnum {
    MOTIVO_NO_PUBLICACION = 1,
    OTROS_DATOS_POSTULACION = 2
}

export enum OrigenRegistroEnum {
    MODULO = 1,
    WEB = 2
}

export enum RegimenLaboralEnum {
    LEY_29944 = 1,
    LEY_30328 = 3,
    LEY_30493 = 4,
    LEY_30512 = 5
}

export enum EstadoConsolidadoPlazaEnum {
    PENDIENTE = 1,
    REMITIDO = 2,
    APROBADO = 3,
    RECHAZADO = 4

}

export enum EstadoPostulacionEnum {
    REGISTRADO = 1,
    ELIMINADO = 2,
    APROBADO = 3
}

export enum TipoFormatoPlazaEnum {
    GENERAL = 1,
    CONVOCADAS = 2
}

 
export enum TipoDocumentoIdentidadEnum {
    DNI = 1,
    CARNET_EXTRANJERIA = 5,
    PASAPORTE = 3
}
 

export enum TablaRolPassport {
    ESPECIALISTA_DITEN = "AYNI_006",
    RESPONSABLE_PERSONAL_DRE = "AYNI_004",
    RESPONSABLE_PERSONAL_UGEL = "AYNI_004",
    RESPONSABLE_PERSONAL_IEM = "AYNI_004", // TODO: CREAR ESTE USUARIO EN PASSPORT, POSIBLEMENTE ES AYNI_004
    COMITE_CONTRATACION_DRE = "AYNI_030",
    COMITE_CONTRATACION_UGEL = "AYNI_030",
    COMITE_CONTRATACION_IE = "AYNI_030",  // TODO: CREAR ESTE USUARIO EN PASSPORT, POSIBLEMENTE ES AYNI_004
    ROL_MONITOR = "SIN SEDE" 
}