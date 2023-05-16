export enum TipoIncidenciaEnum {
    TARDANZA = 17,
    PERMISO_SIN_GOCE = 18,
    INASISTENCIA_INJUSTIFICADA = 19,
    HUELGA_PARO = 20,
    PERMISO_CON_GOCE = 21,
    LICENCIA_SIN_GOCE = 61,
    LICENCIA_CON_GOCE = 62,
}
export enum Mes
{
    ENERO = 5,
    FEBRERO = 6,
    MARZO = 7,
    ABRIL = 8,
    MAYO = 9,
    JUNIO = 10,
    JULIO = 11,
    AGOSTO = 12,
    SEPTIEMBRE = 13,
    OCTUBRE = 14,
    NOVIEMBRE = 15,
    DICIEMBRE = 16
}

export enum TipoRegistroEnum {
    MANUAL = 22,
    MASIVO = 23,
    MIXTO = 24,
    SIN_REGISTRO = 25,
}

export enum EstadoControlAsistenciaMensualEnum {
  //  PENDIENTE = 35,
    //CERRADO=51, 
    //REMITIDO_DENTRO_DE_PLAZO =53,
    //REMITIDO_FUERA_PLAZO =50, 
    //APROBADO = 36,
    //DEVUELTO = 39,
    //SUBSANADO = 41,
    //DEVUELTO_POR_COMPENSACIONES=52, 
    //RECHAZADO = 38,
    //PENDIENTE_DE_APROBACION =40,

    PENDIENTE = 32,
    CERRADO=37, 
    REMITIDO_DENTRO_DE_PLAZO =39,
    REMITIDO_FUERA_PLAZO =38, 
    APROBADO = 33,
    DEVUELTO = 36,
    SUBSANADO = 42,
    DEVUELTO_POR_COMPENSACIONES=40, 
    RECHAZADO = 35,
    PENDIENTE_DE_APROBACION =41,
}

export enum TablaPermisos {
    Acceder = 1,
    Consultar = 2,
    Agregar = 3,
    Modificar = 4,
    Eliminar = 5,
    Exportar = 10,
    Importar = 11
}

export enum EstadoControlConsolidadoEnum {
    // PENDIENTE = 35,
    // REMITIDO_DENTRO_DE_PLAZO =53, // azul
    // REMITIDO_FUERA_PLAZO =50, 
    // DEVUELTO = 39,
    // SUBSANADO = 41,
    // PENDIENTE_DE_APROBACION = 40,
    // RECHAZADO = 38,
    // APROBADO = 36,
    // DEVUELTO_POR_COMPENSACIONES=52, 

    PENDIENTE = 32,
    CERRADO=37, 
    REMITIDO_DENTRO_DE_PLAZO =39, // azul
    REMITIDO_FUERA_PLAZO =38, 
    DEVUELTO = 36,
    SUBSANADO = 42,
    PENDIENTE_DE_APROBACION =41,
    RECHAZADO = 35,
    APROBADO = 33,
    DEVUELTO_POR_COMPENSACIONES=40, 
    
    
}
export enum EstadoConsolidadoAprobacionEnum {
  
    // APROBADO = 36,   
    // PENDIENTE_DE_APROBACION = 40

    APROBADO = 33,   
    PENDIENTE_DE_APROBACION = 41
}
export enum TipoMotivoDevolucion {
  
    DETALLE_DEVOLUCION_ASISTENCIA = 1, 
    DETALLE_DEVOLUCION_COMPENSACIONES = 2,
    DETALLE_RECHAZO = 3,
}

export enum SituacionLaboralEnum {

    EN_ACTIVIDAD=43,
    REASIGNADO=58,
    DESTACADO=59,
    DESIGNADO=60,
    ENCARGADO=54,
    CON_LICENCIA_CON_GOCE=55,
    CON_LICENCIA_SIN_GOCE=56,
    CON_SANCION=57,
    CESADO=42,
    
}

export enum CondicionLaboralEnum {
  
    CONTRATADO =27,
    NOMBRADO =26,
}
export enum TablaNivelInstancia {
    MINEDU = 70,
    DRE = 71,
    UGEL = 72,
}