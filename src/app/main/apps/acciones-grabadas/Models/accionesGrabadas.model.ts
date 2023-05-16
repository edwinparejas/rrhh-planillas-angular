export enum TablaCatalogoNivelInstanciaAnte {
    MINEDU = 34,
    DRE = 35,
    UGEL = 36,
}
export enum TablaCatalogoNivelInstancia {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3,
}
export enum TablaNivelInstanciaCodigo {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3,
}

export enum TablaGrupoAccionCodigo{
    DESPLAZAMIENTO = 5,
    VINCULACION = 12,
    DESVINCULACION = 6,
    COMITE = 14,
    CRONOGRAMA = 15
}

export interface AccesoUsuario {
    GENERAR_PROYECTO_INDIVIDUAL:boolean,
    GENERAR_PROYECTO_MASIVO:boolean,
    ELIMINAR_ACCION_GRABADA:boolean,
}