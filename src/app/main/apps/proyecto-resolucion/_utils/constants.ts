export const CODIGO_SISTEMA = 4;
export const CODIGO_SISTEMA_PLAZA = 4;
export const CODIGO_ROL_ESPECIALISTA_RACIONALIZACION = "AYNI_038";

export enum ResultadoOperacionEnum {
    UnprocessableEntity = 422,
    NotFound = 404,
    InternalServerError = 500,
}

export enum TablaPermisos {
    Acceder = 1,
    Consultar = 2,
    Agregar = 3,
    Modificar = 4,
    Eliminar = 5,
    Exportar = 10,
    Importar = 11,
}

export enum SeccionVistaProyectoEnum {
    PLAZA_SELECCIONADA = 2,
    NUEVA_UBICACIÓN = 3,
}

export enum DetalleVistaProyectoEnum {
    CODIGO_PLAZA = "CODIGO_PLAZA",
    CODIGO_MODULAR = "CODIGO_MODULAR",
    CENTRO_TRABAJO = "CENTRO_TRABAJO",
    NIVEL_EDUCATIVO = "NIVEL_EDUCATIVO",
    MODALIDAD_EDUCATIVA = "MODALIDAD_EDUCATIVA",
    GESTION = "GESTION",
    TIPO_CARGO = "TIPO_CARGO",
    CARGO = "CARGO",
    CARGO_CONFIANZA = "CARGO_CONFIANZA",
    JORNADA_LABORAL = "JORNADA_LABORAL",
    FECHA_VIGENCIA_INICIO = "FECHA_VIGENCIA_INICIO",
    FECHA_VIGENCIA_FIN = "FECHA_VIGENCIA_FIN",
}

export enum TipoDocumentoIdentidadEnum {
    DNI = 1,
    CARNET_EXTRANJERIA = 5,
    PASAPORTE = 4
}
export enum TablaEquivalenciaSede {
    codigoTipoSedeDre = "TS001",
    codigoTipoSedeUgel = "TS002",
    codigoTipoSedeIE = "TS004",
    codigoTipoSedeOficina = "TS005",    
    codigoTipoSedeUniversidad = "TS012",
    codigoTipoSedeSinSede = "TS013"
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
export enum CentroTrabajoEnum {
	MINEDU = '000000',
}