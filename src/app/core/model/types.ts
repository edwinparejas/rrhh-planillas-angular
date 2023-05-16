export enum TablaUsuarioRol {
    ResponsablePersonal = 1,
    EspecialistaDITEN = 2,
    EspecialistaUPP = 3,    
    EspecialistaAIRHSP = 4,
    ResponsablePresupuesto = 5
}

export enum TablaTipoRespuesta {
    VALIDATION,
    REQUIRED,
    DUPLICATE,
    GENERATE,
}

export enum TablaRolPassport {
    MINEDU_ESPECIALISTA_DITEN = 'AYNI_006',
    MINEDU_RESPONSABLE_PERSONAL = 'AYNI_004',
    DRE_RESPONSABLE_PERSONAL = '',
    UGEL_RESPONSABLE_PERSONAL = '',
    IGED_RESPONSABLE_PERSONAL = '',
    MINEDU_ESPECIALISTA_OGRH = 'AYNI_008',
    MINEDU_ESPECIALISTA_DIFOID = 'AYNI_009',
    MINEDU_ESPECIALISTA_DIGETSUPA = 'AYNI_010',
    DRE_INSTITUCION_EDUCATIVA = '',
    DRE_INSTITUTO_SUPERIOR = 'AYNI_012',
    UGEL_INSTITUCION_EDUCATIVA = '',
    IESP_DIRECTOR = 'AYNI_014',
    IEST_DIRECTOR = 'AYNI_015',
    IE_DIRECTOR = 'AYNI_016',
    ESFA_DIRECTOR = 'AYNI_017',
    IE_COMISION_EVALUACION = 'AYNI_018',
    MONITOR = 'AYNI_019',
    ESPECIALISTA_MINEDU = "AYNI_003",
    RESPONSABLE_CONTROL_ASISTENCIA = 'AYNI_007'
}



export const buscarRolPassport = (value) => {
    const codigosRol: any[] = Object.keys(TablaRolPassport).map(key => TablaRolPassport[key]);
    const data = codigosRol.filter(e => e === value);
    if (data)
        return true
    else return false;
};


export enum TablaIgedSeleccion {
    TODAS = 8,
    VARIAS = 9,
    UNA = 10,
}

export enum TablaNivelInstancia {
    MINEDU = 13,
    DRE = 14,
    UGEL = 15,
}

export enum TablaNivelInstanciaCodigo {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3
}

export enum TablaTipoOperacion {
    REGISTRAR = 1,
    APROBAR = 2,
    ANULAR = 3,
    RATIFICAR = 4,
    REUBICAR = 5,
    ADECUAR = 6
}


export enum TablaTipoCentroTrabajo {
    Minedu = 1,
    SedeAdministrativaDRE = 2,
    InstitucionEducativaDRE = 3,
    InstitutoSuperiorDRE = 4,
    SedeAdministrativaUGEL = 5,
    InstitucionEducativaUgel = 6,
    InstitutoSuperiorUgel = 7,
}

export enum TablaTipoCentroTrabajo {
    SEDE_MINEDU = "1",
    SEDE_ADMINISTRATIVA_DRE = "2",
    INSTITUCION_EDUCATIVA_DRE = "3",
    INSTITUTO_SUPERIOR_DRE = "4",
    SEDE_ADMINISTRATIVA_UGEL = "5",
    INSTITUCION_EDUCATIVA_UGEL = "6",
    INSTITUTO_SUPERIOR_UGEL = "7"
}

export enum TablaTipoDocumentoConfiguracion {
    DNI = 1,
    CE = 4,
    PASS = 5
}

export enum TablaConfiguracionSistema {
    LICENCIA_CERTIFICADO = 7,
    LICENCIA_DOCUMENTO_SUSTENTO = 8,
    PLAZA = 3,
    PERSONAL = 4,
    FALTA_DOCUMENTO_SUSTENTO = 7
}

export enum TablaConfiguracionFuncionalidad {
    REGISTRO = 1,                                    /*Registro de Plaza*/
    RATIFICACION = 2,
    REGISTRAR_ASISTENCIA = 3,
    REGISTRAR_CALIFICACIONES = 7,
    REGISTRAR_CALIFICACIONES_PUN = 10,
    REGISTRAR_ASCENSOS = 11,
    GESTIONAR_PLAN_ESTUDIOS = 14,
}

export enum TipoOperacionEnum {
    Registrar = 1,
    Modificar = 2,
    Eliminar = 3,
    Ver = 4
}

export enum ResultadoOperacionEnum {
    UnprocessableEntity = 422,
    NotFound = 404,
    InternalServerError = 500
}

export enum TablaPermisos {
    Acceder = 1,
    Consultar = 2,
    Agregar = 3,
    Modificar = 4,
    Eliminar = 5,
    Exportar = 6
}

export enum TablaEstadoAccionesGrabadas {
    CREANDO_ACCION_GRABADA=6,
    PENDIENTE_DE_PROYECTO = 1,
    CREANDO_PROYECTO = 2,
    EN_PROYECTO=3,
    ELIMINADO=4,
    CON_RESOLUCION=5
}

export enum TablaEquivalenciaSede {
    CODIGO_TIPO_SEDE_OFICINA = "TS005",
    CODIGO_TIPO_SEDE_DRE = "TS001",
    CODIGO_TIPO_SEDE_UGEL = "TS002",
    CODIGO_TIPO_INSTITUCION_EDUCATIVA = "TS004",
    CODIGO_TIPO_SEDE_SIN_SEDE = "TS013",
    CODIGO_TIPO_SEDE = "TS005",
    CODIGO_SEDE = "000000"
}

export enum MISSING_TOKEN {
    INVALID_TOKEN = 'invalid_token'   
}

export enum ComboDefault {
    TextSeleccionar = '-- Seleccionar --',
    TextTodos = 'TODOS',
    ValueTodos = -1,
    ValueSeleccionar = -1
}

export enum TablaCodigoSistemas {
    ESCALAFON = 1,
    PLATAFORMA_SERVICIOS_SERVIDOR_PUBLICO = 2,
    PLAZAS = 3,
    PERSONAL = 4,
    COMPENSACIONES = 5,
    CONFIGURACIONES = 6,
    RESOLUCIONES = 7,
    SERVICIONES_TRANSVERSALES = 8,
}

export enum TablaNivelInstanciaAprobacionesPerdientes {
    MINEDU = 13,
    DRE = 14,
    UGEL = 15
}

export enum TablaConfiguracionDias
{
    diferenciaDias = 30,
    anioDias = 365
}
export enum PassportRol {
    MONITOR = "AYNI_019",
    ESPECIALISTA_DITEN = "AYNI_006",
    ESPECIALISTA_UPP = "AYNI_020",
    RESPONSABLE_PERSONAL ="AYNI_004",
    ESPECIALISTA_DE_RACIONALIZACION ="AYNI_038"
}

export enum TablaTipoDocumentoIdentidad {
    DNI = 1,
    PASAPORTE = 4,
    CARNET_DE_EXTRANJERIA = 5,
}
export const TablaSeccion = {
    SECCION : "Considerando",
}
export const TablaTipoSeccion ={
    PARRAFO :"Párrafo",
}

export const TablaEquivalenciaNombramiento = {
    CODIGO_TIPO_SEDE_OFICINA: 'TS005',
    CODIGO_TIPO_SEDE_DRE: 'TS001',
    CODIGO_TIPO_SEDE_UGEL: 'TS002',    
}

export enum PassportTipoSede {
    DRE = "TS001",
    UGEL = "TS002",
    IE = "TS004",
    MINEDU = "TS005",
    UNIVERSIDAD = "TS012",
    SIN_SEDE = "TS013"
}
