export enum ResultadoOperacion {
    UnprocessableEntity = 422,
    NotFound = 404,
    InternalServerError = 500
}


export enum MensajesConsolidado {
    M01 = 'DEBE INGRESAR POR LO MENOS UN CRITERIO DE BÚSQUEDA',
    M02 = '¿ESTÁ SEGURO DE QUE DESEA GUARDAR LA INFORMACIÓN?',
    M03 = '¿ESTÁ SEGURO DE QUE DESEA GUARDAR LOS CAMBIOS?',   
    M04 = '¿ESTÁ SEGURO DE QUE DESEA RECHAZAR LA INFORMACIÓN?',
    M05 = 'OPERACIÓN REALIZADA DE FORMA EXITOSA',
    M06 = 'DEBE COMPLETAR LOS DATOS REQUERIDOS',
    M07 = 'NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS',
    ERROR = 'Ocurrieron algunos problemas al guardar la información, por favor intente dentro de unos segundos, gracias.'
}  
export enum tipoDocumento {
    
    DNI =	28,
    LIBRETA_MILITAR =	29,
    BOLETA_MILITAR =	30,
    PASAPORTE =	31,
    CARNET_DE_EXTRANJERIA =	32,
    PARTIDA_DE_NACIMIENTO =	33,
    NO_ESPECIFICADO =	34
    
}  