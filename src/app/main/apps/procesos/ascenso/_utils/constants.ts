export enum ResultadoFinalizarEtapaEnum {
    EXISTE_ADJ_CONRESOL = 999,
    NO_EXISTE_DATA_CAL=998

}
export enum ResultadoEliminarCagaEnum {
    NO_EXISTE_APTOS_ADJ = 999,
    NO_EXISTE_DATA_CAL=998

}
export enum ResultadoOperacionEnum {
    NotFound = 404,
    UnprocessableEntity = 422,
    InternalServerError
}
export enum EstadoAscensoEnum {
    EN_PROCESO = 1,
    ELIMINADO = 2,
    CANCELADO = 3,
    DESIERTO = 4,
    FINALIZADO = 5
}
export enum EstadoEtapaEnum {
    EN_PROCESO = 1,
    DESIERTO = 2,
    CANCELADO = 3,
    ELIMINADO = 4,
    FINALIZADO = 5
}
export enum EstadoCalificacionEnum {
    EN_PROCESO = 1,
    ELIMINADO = 2,
    CANCELADO = 3,
    DESIERTO = 4,
    FINALIZADO = 5
}

export enum EstadoAdjudicacionEnum {
    APTO = 1,
    ADJUDICADO = 2,
    NO_ADJUDICADO = 3,
    OBSERVADO = 4,
    CON_RESOLUCION = 5
}
export enum TablaConfiguracionFormatoCarga  {
    EBR= 7,
    ETP= 8
};

export const PAGE_ORIGEN = {
    MENSUAL: 2,
    SERVIDOR: 3,
};

export const ModalidadEdicativaEnum = {
    EBR: "EBR",
    ETP: "ETP",
};
 
 