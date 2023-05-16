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
    ESTADOS_POSTULANTE = 45,
    ESTADOS_CONSOLIDADO = 18,
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
    PREPUBLICACIONDOCENTES = 5,
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
    CUMPLE = 1,
    PUNTAJE = 2,
    NO_APLICA = 3
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

export enum EtapaEnum {
  PUBLICACIÓN_DE_PLAZAS = 6,
    CONTRATACIÓN_DIRECTA = 7,
    CONTRATACIÓN_POR_RESULTADOS_DE_LA_PUN = 8,
    CONTRATACIÓN_POR_EVALUACIÓN_DE_EXPEDIENTES = 9
}
