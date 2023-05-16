export enum CatalogoEnum {
    TIPODOCUMENTO = 6,
    TIPOACCIONACTIVIDAD = 200,
    TIPORESOLUCION = 4,
    TIPOCARGO = 22
}
export enum GrupoAccionEnum {
    DESPLAZAMIENTO = 5,
    LICENCIAS = 8,
    SANCION = 10,
    VACACIONES = 11
}
export enum EstadoActividadEnum {
    PENDIENTE = 58,
    ATENDIDO = 59,
    RECHAZADO = 60
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


export enum NivelInstanciaCodigoEnum {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3,
}

export enum TablaUsuarioRolEnum {
    ResponsablePersonal = 1,
    EspecialistaDITEN = 2,
    EspecialistaUPP = 3,
    EspecialistaAIRHSP = 4,
    ResponsablePresupuesto = 5
}

export enum TipoDocumentoIdentidadEnum {
    DNI = 1,
    CARNET_EXTRANJERIA = 5,
    PASAPORTE = 3
}

export enum IdTipoActividadEnum {
    GENERACION_PLAZAS_ESPEJO = 1
}

export enum TablaEquivalenciaSede {
    CODIGO_TIPO_SEDE_OFICINA = "TS005",
    CODIGO_TIPO_SEDE_DRE = "TS001",
    CODIGO_TIPO_SEDE_UGEL = "TS002",
    CODIGO_TIPO_SEDE_SIN_SEDE = "TS013",
    CODIGO_TIPO_SEDE = "TS005",
    CODIGO_SEDE = "000000"
}

export enum TipoDocumentosIdentidadActivoEnum {
    DNI = 1,
    PASAPORTE = 4,
    CARNET_EXTRANJERIA = 5
}


export enum DesplazamientoAccionCodigoEnum {
    DESTAQUE = 14,
    ENCARGATURA = 15,
    PERMUTA = 16,
    ROTACION = 18,
    UBICACION = 19,
    DESIGNACION = 13,
    REASIGNACION = 17,
    // ASCENSOCARGO= 10,
    ASCENSOESCALAMAGISTERIAL = 5,
    RETORNAR = 73
}


export enum DesplazamientoRegimenLaboralEnum {
    LEY_29944 = 1,
    LEY_30512 = 2,
    LEY_276 = 5,
    LEY_30493 = 4,
    LEY_30328 = 3
}