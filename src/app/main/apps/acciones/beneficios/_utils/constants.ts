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
    VALIDADO = 2,
    RECHAZADO = 3,
    APROBADO = 4
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

export enum EtapaFaseEnum {
    UNICA = 1,
    FASE1 = 2,
    FASE2 = 3,
    FASE3 = 4,
    ETAPA_ESPECIAL = 5,
    EVALUACION_DE_EXPEDIENTES = 6,
    EVALUACION_PRESENCIAL = 7,
    EVALUACION_CURRÍCULAR = 8,
    EVALUACION_DE_CONOCIMIENTO = 9,
    EVALUACION_PSICOLÓGICA = 10,
    ENTREVISTA_PERSONAL = 11
}

export enum EstadoCalificacionEnum {
    PENDIENTE = 1,
    APTO = 2,
    NO_APTO = 3,
    OBSERVADO = 4,
    CON_RECLAMO = 5
}

export enum EstadoAdjudicacionEnum {
    PENDIENTE = 1,
    ADJUDICADO = 2,
    NO_ADJUDICADO = 3,
    OBSERVADO = 4
}

export enum EstadoEtapaEnum {
    EN_PROCESO = 1,
    DESIERTO = 2,
    CANCELADO = 3,
    ELIMINADO = 4,
    FINALIZADO = 5
}

export enum ResultadoFinalEnum {
    /*DESIERTO = 0,
    ADJUDICADO = 1,
    NO_CONVOCADO = 4,
    */
   PENDIENTE = 1,
   ADJUDICADO = 2,
   DESIERTO = 3
}
export enum TipoDocumentoIdentidadEnum {
    DNI = 1,
    CARNET_EXTRANJERIA = 5,
    PASAPORTE = 3
}

export enum EstadoValidacionPlazaEnum {
    PENDIENTE = 1,
    VALIDADO = 2,
    PRE_PUBLICADO = 3,
    RECHAZADO = 4,
    APROBADO = 5,
    PUBLICADO = 6,
    APERTURADO = 7
}

export enum CatalogoItemEnum {
    CATALOGO_ITEM_ORDEN_PRIMERO = 1,
    CATALOGO_ITEM_ORDEN_SEGUNDO = 2,
    CATALOGO_ITEM_ORDEN_TERCERO = 3,
    TIPOS_DOCUMENTOS_IDENTIDAD = 6,
    TIPO_FORMATO_SUSTENTO = 33,
    ESTADOS_POSTULANTE = 123,
    ESTADOS_CONSOLIDADO = 106,
    NACIONALIDADES = 19,
    MOTIVO_NO_PUBLICACION = 105,
    TIPO_DOCUMENTO_SUSTENTO = 20,
    ESTADO_RESULTADO_FINAL = 103,
    ESTADO_CALIFICACION = 107,
    ESTADO_ADJUDICACION = 104,
    MOTIVO_NO_CALIFICACION = 122,
    RUBRO_CALIFICACION = 42,
    MOTIVO_NO_ADJUDICACION = 102
}

export enum CodigoDocumentoContratacionEnum {
    CODIGO_DOCUMENTO = 2
}

export enum EstadoEtapaProcesoEnum {
    PENDIENTE = 1,
    INICIADO = 2,
    FINALIZADO = 3,
    CANCELADO = 4
}

export enum SituacionPlazasEnum {
    PRE_PUBLICADA = 1,
    A_CONVOCAR = 2,
    OBSERVADA = 3,
    PUBLICADO = 4,
    INCORPORACION = 5
}

export enum SituacionPlazaAscensoEnum {
    PRE_PUBLICADA = 263,
    A_CONVOCAR = 264,
    OBSERVADA = 265,
    PUBLICADO = 266,
}

export enum ActivoFlagEnum {
    ACTIVO = 1,
    INACTIVO = 0
}

export enum ProcesoEtapaEnum {
    UNICA = 1,
    PUBLICACION_PLAZAS = 2,
    CONTRATACION_DIRECTA = 3,
    CONTRATACION_RESULTADOS_PUN = 4
}

export enum ProcesoEnum {
    CONTRATACION_DOCENTE = 2
}

export enum EdadMaximaEnum {
    EDAD_MAXIMA = 65
}

export enum EstadoPostulante {
    REGISTRADO = 1,
    ELIMINADO = 2,
    APROBADO = 3
}

export enum GrupoDocumentoPublicadoEnum {
    PLAZAS = 1,
    DOCENTES = 2,
    VALIDADAS = 1,
    PRELIMINAR = 2,
    FINAL = 3,
    PREPUBLICACIONBECARIOS = 4,
    PREPUBLICACIONDOCENTES= 5,
    PREPUBLICACIONAUXILIARES = 13,
    PUBLICACION = 6,
    INCORPORACION = 7
}

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
    CUMPLE = 1, PUNTAJE = 2,
    NO_APLICA = 3,
    BONIFICACIONES = 4,
}

export enum TipoProcesoPlazaEnum {
    SIN_PROCESO = 8
}

export enum EstadoPlazaIncorporarEnum {
    APROBADO = 2
}

export enum TipoRegistroEnum {
    MANUAL = 1,
    WEB = 2
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


export enum MensajesSolicitud {
    M01 = '"DEBE INGRESAR POR LO MENOS UN CRITERIO DE BÚSQUEDA."',
    M02 = '¿ESTÁ SEGURO DE QUE DESEA GUARDAR LA INFORMACIÓN?',
    M03 = '¿ESTÁ SEGURO DE QUE DESEA GUARDAR LOS CAMBIOS?',
    M04 = '¿ESTÁ SEGURO DE QUE DESEA ANULAR LA INFORMACIÓN?',
    M05 = '¿ESTÁ SEGURO DE QUE DESEA ELIMINAR LA INFORMACIÓN?',    
    M06 = '¿ESTÁ SEGURO DE QUE DESEA RECHAZAR LA INFORMACIÓN?',
    M07 = '"OPERACIÓN REALIZADA DE FORMA EXITOSA."',
    M08 = '"COMPLETAR LOS DATOS REQUERIDOS."',
    M09 = '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS."',
    M11 = '"NO SE ENCONTRÓ INFORMACIÓN DEL SERVIDOR PÚBLICO."',
    M12 = '"NO SE ENCONTRÓ INFORMACIÓN DEL INFORME ESCALAFONARIO."',
    M13 = '"COMPLETAR DATOS DE MOTIVO ACCIÓN (ACCIÓN DE PERSONAL A REALIZAR)"',
    M14 = '"COMPLETAR DATOS DE TIPO DE DOCUMENTO (SERVIDOR PÚBLICO)"',
    M15 = '"COMPLETAR DATOS DEL NÚMERO DE DOCUMENTO (SERVIDOR PÚBLICO)"',
    M16 = '"COMPLETAR DATOS DEL NÚMERO DE INFORME ESCALAFONARIO (INFORME ESCALAFONARIO)"',
    M17 = '"NO SE ENCONTRÓ INFORMACIÓN DE FAMILIAR DIRECTO FALLECIDO"',
    M18 = 'SE ELIMINÓ CORRECTAMENTE',
    M19 = '"FECHA DE INICIO ES REQUERIDO."',  
    M20= '"BASE DE CÁLCULO ES REQUERIDO."', 
    M21= '"TIPO CRÉDITO ES REQUERIDO."',
    M22= '"FECHA DE INICIO CRÉDITO DEVENGADO ES REQUERIDO."',
    M23= '"FECHA DE TÉRMINO CRÉDITO DEVENGADO ES REQUERIDO."',
    M24= '"TOTAL LIQUIDACIÓN ES REQUERIDO."',
    M25= '"PAGADO ES REQUERIDO."',
    M26= '"INTERESES LEGALES ES REQUERIDO."',
    M27= '"IMPORTE DEL BENEFICIO ES REQUERIDO."',
    M28= '"AGREGAR COMO MÍNIMO UN REGISTRO DE VACACIONES TRUNCAS."',
    M29= '"AGREGAR COMO MÍNIMO UN REGISTRO DE BENEFICIARIO."',
    M30= '"ACTA DEFUNCIÓN ES REQUERIDO."',
    M31='“DEBE REGISTRAR COMO MÍNIMO UN DOCUMENTO DE SUSTENTO QUE SE MUESTRE EN EL VISTO DEL PROYECTO”',
    M32 = '"AÑO DEL NÚMERO DE INFORME ESCALAFONARIO INCORRECTO"',
    M33 = '"MOTIVO DE BENEFICIO ES REQUERIDO"',
    M34= '"TIPO BENEFICIO ES REQUERIDO."', 
    M35= '"CATEGORIA ES REQUERIDO."', 
    M36= '"FECHA DEFUNCIÓN ES REQUERIDO."',
    ERROR = '"OCURRIERON ALGUNOS PROBLEMAS AL GUARDAR LA INFORMACIÓN, POR FAVOR INTENTE DENTRO DE UNOS SEGUNDOS, GRACIAS."',
    ERROR_PDF = '"OCURRIERON ALGUNOS PROBLEMAS AL GENERAR EL DOCUMENTO PDF."'
}  
export enum PassportTipoSede {
    DRE = "TS001",
    UGEL = "TS002",
    IE = "TS004",
    MINEDU = "TS005",
    UNIVERSIDAD = "TS012",
    SIN_SEDE = "TS013"
}

export enum CodigoMaestroActividad{
    PRE_PUBLICACION = 15,
    PUBLICACION_VALIDACION = 21,
    PUBLICACION_CONTRATACION_DIRECTA = 22, //  TODO: ARREGLAR CON DEYSI. NO EXISTE EN TABLA MAESTRO_ACTIVIDAD_PROCESO ("ES_PUBLICADO=1") CAMBIADO A ETAPA "PRESENTACIÓN DE EXPEDIENTES"
    PUBLICACION_CONTRATACION_PUN = 25,
    PUBLICACION_CONTRATACION_EVALUACION = 25,

}

export enum CentroTrabajoEnum {
    MINEDU = '000000',
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

export enum TipoFormularioBeneficioEnum {
    CTS29944 = 1,
    CTS276 = 2,
    CreditoDevengado = 3,
    VacacionesTruncas = 4,
    SubsidioFamiliar = 5,
    ATS25 = 6,
    ATS30 = 7,
    GST25 = 8,
    BonificacionFamiliar = 9,
    BonificacionPersonal = 10,
    IncentivoProfesional = 11,
    IncentivoEstudios = 12,
    PremioAnual = 13,
}
export enum TipoMotivoAccionEnum {
    CTS29944 = "CTS29944",
    CTS276 = "CTS276",
    CreditoDevengado = "CreditoDevengado",
    VacacionesTruncas = "VacacionesTruncas",
    SubsidioTitular = "SubsidioTitular",
    SubsidioFamiliar = "SubsidioFamiliar",
    ATS25 = "ATS25",
    ATS30 = "ATS30",
    GST25 = "GST25",
    BonificacionFamiliar = "BonificacionFamiliar",
    BonificacionPersonal = "BonificacionPersonal",
    IncentivoProfesional = "IncentivoProfesional",
    IncentivoEstudios = "IncentivoEstudios",
    // PremioAnual = 13,
}