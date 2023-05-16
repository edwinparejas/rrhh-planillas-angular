export enum TablaEstadoCargaMasiva {
    EnProcesoCarga = 1,
    Cargado = 2,
    EnProcesoValidacion = 3,
    Validado = 4,
    ProcesandoCarga = 5,
    Procesado = 6,
    Anulado = 7,
    CargadoConError = 8,
    ValidadoConError = 9,
    ProcesadoConError = 10
}

 export enum TablaMetodosCargaMasiva {
    NUEVA_CARGA = 1,
    REFRESCAR = 2,
    GRID_CARGAS_MASIVAS = 3,
    VER_DETALLE = 4,
    ANULAR_CARGA = 5,
    VALIDAR_CARGA = 6,
    PROCESAR_CARGA = 7,
    EXPORTAR_DETALLE_CARGA_MASIVA = 8,
    DESCARGAR_FORMATO = 9,
    GRID_DETALLE_CARGA_MASIVA = 10,
    EXPORTAR_ERRORES = 11,
    GRID_ERRORES = 12,
    GRID_HISTORIAL_CARGAS_MASIVAS = 13,
    EXPORTAR_HISTORIAL_CARGAS_MASIVAS = 14,
    VER_HISTORIAL_CARGAS_MASIVAS = 15    

}