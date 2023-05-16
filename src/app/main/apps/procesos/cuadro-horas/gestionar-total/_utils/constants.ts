export enum TablaAccionesPassport {
    Acceder = 1,
    Consultar = 2,
    Agregar = 3,
    Modificar = 4,
    Eliminar = 5,
    Aprobar = 6,
    Derivar = 9,
    Exportar = 10,
    Importar = 11,
    Observar = 12
}

export enum TablaMetodosRotacion {
    GET_FILTROS_PROCESO = 1,
    GRID_PROCESOS_ETAPAS = 2,
    EXPORTAR_PROCESOS_ETAPAS = 3,
    PROCESO_POSTULACION_PLAZAS = 4,
    PROCESO_POSTULANTES = 5,
    PROCESO_CALIFICACIONES = 6,
    PROCESO_ADJUDICACIONES = 7,
    CONSULTAS_SUSTENTO_NO_PUBLICACION = 8,
    REGISTRAR_SUSTENTO_NO_PUBLICACION = 9,
    GET_BUSCAR_CENTRO_TRABAJO = 10,
    CONSULTAR_CENTRO_TRABAJO = 11,
    GET_LISTAR_PLAZA = 12,


}

export enum TablaEtapaFase {
    UNICA = 31
}
export enum TablaEstadosDesarrolloProceso {
    PENDIENTE = 1,
    INICIADO = 2,
    FINALIZADO = 3,
    CANCELADO = 4,
}

export enum TablaRolPassport {
    MONITOR = "AYNI_019",
    ESPECIALISTA_MINEDU = "AYNI_003",
    RESPONSABLE_TRAMITE_DOCUMENTARIO = "AYNI_002",
    RESPONSABLE_PROYECTAR_RESOLUCION = "AYNI_005",
    RESPONSABLE_PERSONAL = "AYNI_004"
}

export enum PassportTipoSede {
    DRE = "TS001",
    UGEL = "TS002",
    IE = "TS004",
    MINEDU = "TS005",
    UNIVERSIDAD = "TS012",
    SIN_SEDE = "TS013"
}

export enum TablaRotacionNivelInstancia {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3
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

export enum TablaTipoDocumentoIdentidad {
    DNI = 1,
    PASAPORTE = 4,
    CARNET_DE_EXTRANJERIA = 5,
}

export enum MISSING_TOKEN {
    INVALID_TOKEN = 'invalid_token'
}

export enum TablaUsuarioRol {
    ResponsablePersonal = 1,
    EspecialistaDITEN = 2,
    EspecialistaUPP = 3,
    EspecialistaAIRHSP = 4,
    ResponsablePresupuesto = 5
}

export enum TablaTipoRotacion {
    Interna = 1,
    Externa = 2
}

export enum TablaAlternativaPostulacion {
    Primera = 1,
    Segunda = 2,
    Tercera = 3
}



export enum ResultadoFinalizarEtapaEnum {
    EXISTE_ADJ_CONRESOL = 999,
    NO_EXISTE_DATA_CAL = 998

}
export enum ResultadoEliminarCagaEnum {
    NO_EXISTE_APTOS_ADJ = 999,
    NO_EXISTE_DATA_CAL = 998

}
export enum ResultadoOperacionEnum {
    NotFound = 404,
    UnprocessableEntity = 422
}

export enum EstadoAscensoEnum {
    EN_PROCESO = 1,
    ELIMINADO = 2,
    CANCELADO = 3,
    DESIERTO = 4,
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
export enum TablaConfiguracionFormatoCarga {
    EBR = 7,
    ETP = 8
};

export const PAGE_ORIGEN = {
    MENSUAL: 2,
    SERVICOR: 3,
};

export const ModalidadEdicativaEnum = {
    EBR: "EBR",
    ETP: "ETP",
};

