import { MESSAGE_CUADRO_30512 } from "../../cuadro-horas-30512/util/messages";

export enum EtapaEnum {
    PrePublicacionPlazas = 32,
    RatificacionCargo = 33,
    PromocionInterna = 34,
    EvaluacionRegular = 35,
    EvaluacionExcepcional = 36
}

export enum DescripcionMaestroProcesoEnum
{
    EncargaturaPuestoMayorResponsabilidad = 40
}

export enum SituacionValidacionEnum {
    PrePublicada = 1,
    AConvocar = 2,
    Observada = 3,
    Publicado = 4,
    Incorporacion = 5
}

export enum EstadoValidacionPlazaEnum {
    Pendiente = 1,
    Validado = 2,
    PrePublicado = 3,
    Rechazado = 4,
    Aprobado = 5,
    Publicado = 6,
    Aperturado = 7
}

export enum MotivoNoexportacionEnum {
    SentenciaJudicial = 1,
    MedidaDisciplinaria = 2,
    ProcesoAdministrativo = 3
}

export enum GrupoDocumentoEnum {
    Plaza = 1,
    CalificacionPreliminar = 2,
    CalificacionFinal = 3
}

export enum ResultadoCalificacionEnum {
    ResultadoPreliminar = 1,
    ResultadoFinal = 2
}

export enum EstadoResultadoFinalEnum {
    Pendiente = 1,
    Adjudicado = 2,
    Desierto = 3
}

export enum EstadoEtapaDesarolloEnum {
    Pendiente = 1,
    Iniciado = 2,
    Finalizado = 3,
    Cancelado = 4
}

export enum TipoPuntajeEnum {
    Cumple = 1,
    Puntaje = 2
}
export enum EstadoProcesoEnum {
    Pendiente = 1,
    Iniciado = 2,
    Finalizado = 3,
    Cancelado = 4
}

export enum EstadoPostulacionEnum {
    Registrado = 1,
    Eliminado = 2,
    Aprobado = 3
}

export enum EstadoAdjudicacionEnum {
    Pendiente = 1,
    Adjudicado = 2,
    NoAdjudicado = 3,
    Observado = 4
}

export enum TipoRegistroEnum {
    Manual = 1,
    Web = 2
}
export enum EstadoCalificacionEnum
{
    Pendiente = 1,
    Apto = 2,
    NoApto = 3,
    Observado = 4
}
export enum EstadoConsolidadoEnum
{
    Pendiente = 1,
    Validado = 2,
    Rechazado = 3,
    Aprobado = 4
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

export enum TablaEquivalenciaSede {
    codigoTipoSedeOficina = "TS005",
    codigoTipoSedeDre = "TS001",
    codigoTipoSedeUgel = "TS002",
    // codigoTipoSedeSinSede = "TS012",
    codigoTipoSedeSinSede = "TS013",
    codigoTipoSede = "TS005",
    codigoSede = "000000"
}


export enum EstadoDocumentoEnum {
    Pendiente = 1,
    EnProgreso = 2,
    PDFGenerado = 3,
    GeneradoPDF = 4,
    ProcesoConERROR = 5
}

export enum TablaTipoCentroTrabajo {
	Minedu = 1,
	SedeAdministrativaDRE = 2,
	InstitucionEducativaDRE = 3,
	InstitutoSuperiorDRE = 4,
	SedeAdministrativaUGEL = 5,
	InstitucionEducativaUgel = 6,
	InstitutoSuperiorUgel = 7
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
export enum PassportTipoSede {
	DRE = "TS001",
	UGEL = "TS002",
	IE = "TS004",
	MINEDU = "TS005",
	UNIVERSIDAD = "TS012",
	SIN_SEDE = "TS013"
}