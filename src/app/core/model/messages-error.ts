export const SNACKBAR_BUTTON = {
    CLOSE: 'Cerrar',
    CANCEL: 'Cancelar',
    OK: 'Ok',
    ACEPTED: 'Aceptar',
    DEFAULT: 'Aceptar'
}

export const KONG_MESSAGE = {
    AUTHORIZE: 'Ud. no cuenta con código de autorización para acceder.',
    TOKEN: 'El código de autorización es incorrecto, imposible obtener los datos de autorización.',
    REFRESH_TOKEN: 'No se pudo obtener los datos de acceso.'
}

export const PASSPORT_MESSAGE = {
    //GENERIC MESSAGES
    END_SESION: 'Su sesión ha expirado, ud. será redirigido a la página de inicio de sesión',
    UNAUTHORIZED: 'Ud. no se encuentra autorizado para acceder al sistema. Será redirigido a la página de inicio de sesión',
    PERMISO_NOT_FOUND: "UD. NO TIENE PERMISO PARA REALIZAR ESTA OPERACIÓN. COMUNÍQUESE CON EL ADMINISTRADOR DEL SISTEMA",
    BAD_REQUEST: 'El servidor no entendió la solicitud del usuario, Se ha producido un error inesperado en uno de nuestros servidores.',
    BAD_TOKEN: 'El servidor no retoró la autorización para acceder a los servicios del personal, Será redirigido al panel de sistemas. Gracias.',
    BUTTON_UNAUTHORIZED: 'Ud. No tiene permiso para realizar esta operación.',
    METHOD_UNAUTHORIZED: 'Ud. no se encuentra autorizado para acceder a uno o mas operaciones de passport. Será redirigido a la página de inicio de sesión.',
    NOT_ALLOWED: 'El sistema no pudo acceder a los servidores de autorización. Será redirigido a la página de inicio de sesión.',
    OPERATION_NOT_FOUND: 'Ud. no tiene operaciones y permisos de passport asignados, sera redirigido a la página de inicio de sesión.',
    END_SESSION: 'Ud. está cerrando la sesión del usuario, Será redirigido a la página de inicio de sesión. Gracias.',
    SESION_END: "SU SESIÓN HA CADUCADO. SERÁ REDIRIGIDO A LA PÁGINA DE INICIO DE SESIÓN.",
    // API MESSAGES
    BUSCAR_SISTEMA_PERMISO_USUARIO: 'Error, no se pudo acceder al servicio passport "PERMISOS DE USUARIO AL SISTEMA". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_SESION: 'Error, no se pudo acceder al servicio passport "SESIONES DEL USUARIO". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_USUARIO: 'Error, no se pudo acceder al servicio passport "INFORMACION DEL USUARIO". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_MENU: 'Error, no se pudo acceder al servicio passport "MENU". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_ROL_USUARIO: 'Error, no se pudo acceder al servicio passport "ROLES DEL USUARIO". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_ACCION: 'Error, no se pudo acceder al servicio passport "ACCIONES". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_AUTHORIZACION: 'Error, no se pudo acceder al servicio passport "PERMISOS". Si persiste el error, comuníquese con el administrador del sistema.',
    BOOT: 'Error, no se pudo acceder al servicio passport "BOOT". Si persiste el error, comuníquese con el administrador del sistema.'
}

export const RENIEC_MESSAGE = {
    BUSCAR_DNI: 'Error, no se pudo acceder al servicio de reniec "BUSCAR POR DNI". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_NOMBRE: 'Error, no se pudo acceder al servicio de reniec "BUSCAR POR NOMBRES". Si persiste el error, comuníquese con el administrador del sistema.'
}

export const DOCUMENTO_MESSAGE = {
    CREAR: 'Error, no se pudo acceder al servicio de documentos "CREAR NUEVO DOCUMENTO". Si persiste el error, comuníquese con el administrador del sistema.',
    DESCARGAR: 'Error, no se pudo acceder al servicio de documentos "DESCARGAR DOCUMENTO". Si persiste el error, comuníquese con el administrador del sistema.',
    IMAGE_PREVIEW: 'Error, no se pudo acceder al servicio de documentos "BUSCAR IMAGEN" del personal. Si persiste el error, comuníquese con el administrador del sistema.'
}
export const ASISTENCIA_MESSAGE = {

    ASISTENCIA_MENSUAL: 'Error, no se pudo acceder al servicio "EXPORTAR ASISTENCIA MENSUAL". Si persiste el error, comuníquese con el administrador del sistema.',
    ASISTENCIA_MENSUAL_VER_MOTIVO_DEVOLUCION: 'Error, no se pudo acceder al motivo de devolución de asistencia. Si persiste el error, comuníquese con el administrador del sistema.',
    CONTROL_CENTRO_TRABAJO: 'Error, no se pudo acceder al servicio "EXPORTAR ASISTENCIA MENSUAL". Si persiste el error, comuníquese con el administrador del sistema.',
    CENTRO_TRABAJO_ERROR: 'Error, no se pudo acceder al servicio "BÚSQUEDA DE CENTROS DE TRABAJO". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTADOS_ASISTENCIA_MENSUAL_ERROR: 'Error, no se pudo acceder al servicio "ESTADOS DE ASISTENCIA". Si persiste el error, comuníquese con el administrador del sistema.',
    MESES_ERROR: 'Error, no se pudo acceder al servicio "MESES". Si persiste el error, comuníquese con el administrador del sistema.',
    REGISTRAR_ASISTENCIA_ERROR: 'Error, no se pudo acceder al servicio "REGISTRAR ASISTENCIA". Si persiste el error, comuníquese con el administrador del sistema.',
    CONSOLIDADO_APROBACION: 'Error, no se pudo acceder al servicio "EXPORTAR ASISTENCIA MENSUAL". Si persiste el error, comuníquese con el administrador del sistema.',
    EXPORTAR_ASISTENCIA_MENSUAL: 'Error, no se pudo acceder al servicio "EXPORTAR ASISTENCIA MENSUAL". Si persiste el error, comuníquese con el administrador del sistema.',
    EXPORTAR_ASISTENCIA_CONSOLIDADO: 'Error, no se pudo acceder al servicio "EXPORTAR CONSOLIDADO POR CENTRO DE TRABAJO ". Si persiste el error, comuníquese con el administrador del sistema.',
    EXPORTAR_ASISTENCIA_APROBACION: 'Error, no se pudo acceder al servicio "EXPORTAR CONSOLIDADO APROBACION". Si persiste el error, comuníquese con el administrador del sistema.',
    REGISTRAR_ASISTENCIA: 'Error, no se pudo acceder al servicio "REGISTRAR ASISTENCIA". Si persiste el error, comuníquese con el administrador del sistema.',
    REPORTE_CONSOLIDADO: 'Error, no se pudo acceder al servicio "REPORTE CONSOLIDADO". Si persiste el error, comuníquese con el administrador del sistema.',
    REPORTE_DETALLADO: 'Error, no se pudo acceder al servicio "REPORTE DETALLADO". Si persiste el error, comuníquese con el administrador del sistema.',
    APROBAR_MASIVO: 'Error, no se pudo acceder al servicio "APROBAR MASIVO". Si persiste el error, comuníquese con el administrador del sistema.',
    RECHAZAR_MASIVO: 'Error, no se pudo acceder al servicio "RECHAZAR MASIVO". Si persiste el error, comuníquese con el administrador del sistema.',
    APROBAR: 'Error, no se pudo acceder al servicio "APROBAR". Si persiste el error, comuníquese con el administrador del sistema.',
    RECHAZAR: 'Error, no se pudo acceder al servicio "RECHAZAR ". Si persiste el error, comuníquese con el administrador del sistema.',
    REMITIR_REPORTES: 'Error, no se pudo acceder al servicio "REMITIR REPORTES". Si persiste el error, comuníquese con el administrador del sistema.',
    VER_MOTIVO_DEVOLUCION: 'Error, no se pudo acceder al servicio "VER MOTIVO DE DEVOLUCION". Si persiste el error, comuníquese con el administrador del sistema.',
    ENVIAR_COMPENSACIONES: 'Error, no se pudo acceder al servicio "ENVIAR A COMPENSACIONES". Si persiste el error, comuníquese con el administrador del sistema.',
    SOLICITAR_APROBACION: 'Error, no se pudo acceder al servicio "SOLICITAR APROBACION ". Si persiste el error, comuníquese con el administrador del sistema.',
    GUARDAR: 'Error, no se pudo acceder al servicio "GUARDAR ASISTENCIA". Si persiste el error, comuníquese con el administrador del sistema.',
    CERRAR_ASISTENCIA: 'Error, no se pudo acceder al servicio "CERRAR ASISTENCIA". Si persiste el error, comuníquese con el administrador del sistema.'
}
export const CONFIGURACION_PROCESO_MESSAGE = {
    REGIMENES_LABORALES: 'Error, no se pudo acceder al servicio "REGÍMENES LABORALES". Si persiste el error, comuníquese con el administrador del sistema.',
    TIPOS_PROCESO: 'Error, no se pudo acceder al servicio "TIPOS DE PROCESO". Si persiste el error, comuníquese con el administrador del sistema.',
    LISTAR_PROCESOS: 'Error, no se pudo acceder al servicio "LISTAR PROCESOS". Si persiste el error, comuníquese con el administrador del sistema.',
    PROCESO_ANIO_ANTERIOR: 'Error, no se pudo acceder al servicio "PROCESO ANIO ANTERIOR". Si persiste el error, comuníquese con el administrador del sistema.',
    TIPOS_DOCUMENTO_SUSTENTO: 'Error, no se pudo acceder al servicio "TIPOS DE DOCUMENTO SUSTENTO". Si persiste el error, comuníquese con el administrador del sistema.',
    TIPOS_FORMATO_SUSTENTO: 'Error, no se pudo acceder al servicio "TIPOS DE FORMATO SUSTENTO". Si persiste el error, comuníquese con el administrador del sistema.',
    AREAS_DESEMPENIO: 'Error, no se pudo acceder al servicio "AREAS DE DESEMPEÑO". Si persiste el error, comuníquese con el administrador del sistema.',
    TIPOS_CARGO: 'Error, no se pudo acceder al servicio "TIPOS DE CARGO". Si persiste el error, comuníquese con el administrador del sistema.',
    CARGOS: 'Error, no se pudo acceder al servicio "CARGOS". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTADOS_PROCESO: 'Error, no se pudo acceder al servicio "ESTADOS DE PROCESO". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTADOS_CRONOGRAMA: 'Error, no se pudo acceder al servicio "ESTADOS DE CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTADOS_ETAPA: 'Error, no se pudo acceder al servicio "ESTADOS DE ETAPA". Si persiste el error, comuníquese con el administrador del sistema.',
    ACTIVIDADES: 'Error, no se pudo acceder al servicio "ACTIVIDADES". Si persiste el error, comuníquese con el administrador del sistema.',
    TIPOS_DOCUMENTOS_IDENTIDAD: 'Error, no se pudo acceder al servicio "TIPOS DE DOCUMENTOS DE IDENTIDAD". Si persiste el error, comuníquese con el administrador del sistema.',
    CARGOS_COMITE: 'Error, no se pudo acceder al servicio "TIPOS DE CARGOS DE COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    MIEMBROS_COMITE: 'Error, no se pudo acceder al servicio "TIPOS DE MIEMBROS DE COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    NOMBRES_COMITE: 'Error, no se pudo acceder al servicio "TIPOS DE NOMBRES DE COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTADOS_COMITE: 'Error, no se pudo acceder al servicio "TIPOS DE ESTADO DE COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTAPAS_FASE: 'Error, no se pudo acceder al servicio "ESTADOS DE ETAPA/FASE". Si persiste el error, comuníquese con el administrador del sistema.',
    CALCULAR_VIGENCIA: 'Error, no se pudo acceder al servicio "CALCULAR VIGENCIA". Si persiste el error, comuníquese con el administrador del sistema.',
    REGIMEN_TIPO_PROCESO: 'Error, no se pudo acceder al servicio "RÉGIMEN TIPO PROCESO". Si persiste el error, comuníquese con el administrador del sistema.',
    CONFIGURACION_PROCESO: 'Error, no se pudo acceder al servicio "CONFIGURACIÓN DEL PROCESO". Si persiste el error, comuníquese con el administrador del sistema.',
    TIPOS_CAUSALES: 'Error, no se pudo acceder al servicio "CAUSALES DE LA ETAPA / FASE". Si persiste el error, comuníquese con el administrador del sistema.',
    TIPOS_NUMEROS_CONVOCATORIA: 'Error, no se pudo acceder al servicio "TIPOS DE NÚMERO DE CONVOCATORIA". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_CENTRO_TRABAJO: 'Error, no se pudo acceder al servicio "BUSCAR CENTRO DE TRABAJO". Si persiste el error, comuníquese con el administrador del sistema.',
    ENTIDAD_PASSPORT: 'Error, no se pudo acceder al servicio "ENTIDAD PASSPORT". Si persiste el error, comuníquese con el administrador del sistema.',
    INSTANCIAS: 'Error, no se pudo acceder al servicio "INSTANCIAS". Si persiste el error, comuníquese con el administrador del sistema.',
    SUB_INSTANCIAS: 'Error, no se pudo acceder al servicio "SUB INSTANCIAS". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_PERSONA: 'Error, no se pudo acceder al servicio "BUSCAR PERSONA". Si persiste el error, comuníquese con el administrador del sistema.',
    CONSULTAR_PROCESOS: 'Error, no se pudo acceder al servicio "CONSULTAR PROCESOS". Si persiste el error, comuníquese con el administrador del sistema.',
    EXPORTAR_PROCESOS: 'Error, no se pudo acceder al servicio "EXPORTAR PROCESOS". Si persiste el error, comuníquese con el administrador del sistema.',
    OBTENER_PROCESOS: 'Error, no se pudo acceder al servicio "OBTNER PROCESO". Si persiste el error, comuníquese con el administrador del sistema.',
    ELIMINAR_PROCESOS: 'Error, no se pudo acceder al servicio "ELIMINAR PROCESO". Si persiste el error, comuníquese con el administrador del sistema.',
    OBTENER_ETAPA: 'Error, no se pudo acceder al servicio "OBTENER ETAPA". Si persiste el error, comuníquese con el administrador del sistema.',
    ELIMINAR_ETAPA: 'Error, no se pudo acceder al servicio "ELIMINAR ETAPA". Si persiste el error, comuníquese con el administrador del sistema.',
    CONSULTAR_ETAPA: 'Error, no se pudo acceder al servicio "CONSULTAR ETAPA". Si persiste el error, comuníquese con el administrador del sistema.',
    EXPORTAR_ETAPA: 'Error, no se pudo acceder al servicio "EXPORTAR ETAPA". Si persiste el error, comuníquese con el administrador del sistema.',
    OBTENER_CRONOGRAMA: 'Error, no se pudo acceder al servicio "OBTENER CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    ELIMINAR_CRONOGRAMA: 'Error, no se pudo acceder al servicio "ELIMINAR CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    CONSULTAR_CRONOGRAMA: 'Error, no se pudo acceder al servicio "CONSULTAR CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    CONSULTAR_AMPLIACION: 'Error, no se pudo acceder al servicio "CONSULTAR AMPLIACIÓN". Si persiste el error, comuníquese con el administrador del sistema.',
    EXPORTAR_CRONOGRAMA: 'Error, no se pudo acceder al servicio "EXPORTAR CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    PERMISO_ACCIONES_CRONOGRAMA: 'Error, no se pudo acceder al servicio "VERIFICAR PERMISO A ACCIONES DE CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    IMPORTAR_CRONOGRAMA: 'Error, no se pudo acceder al servicio "IMPORTAR CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    APROBAR_CRONOGRAMA: 'Error, no se pudo acceder al servicio "APROBAR CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    GENERAR_PROYECTO_CRONOGRAMA: 'Error, no se pudo acceder al servicio "GENERAR PROYECTO RESOLUCIÓN CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    GENERAR_PROYECTO_COMITE: 'Error, no se pudo acceder al servicio "GENERAR PROYECTO RESOLUCIÓN DE COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    PUBLICAR_CRONOGRAMA: 'Error, no se pudo acceder al servicio "PUBLICAR CRONOGRAMA". Si persiste el error, comuníquese con el administrador del sistema.',
    OBTENER_COMITE: 'Error, no se pudo acceder al servicio "OBTENER COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    ELIMINAR_COMITE: 'Error, no se pudo acceder al servicio "ELIMINAR COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    CONSULTAR_COMITE: 'Error, no se pudo acceder al servicio "CONSULTAR COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    EXPORTAR_COMITE: 'Error, no se pudo acceder al servicio "EXPORTAR COMITÉ". Si persiste el error, comuníquese con el administrador del sistema.',
    GENERAR_PROYECTO_RESOLUCION: 'Error, no se pudo acceder al servicio "GENERAR PROYECTO RESOLUCIÓN". Si persiste el error, comuníquese con el administrador del sistema.',
    OBTENER_PROYECTO_RESOLUCION: 'Error, no se pudo acceder al servicio "VERIFICAR PROYECTO RESOLUCIÓN". Si persiste el error, comuníquese con el administrador del sistema.',
    GENERAR_DOCUMENTO_SUSTENTO: 'Error, no se pudo acceder al servicio "GENERAR DOCUMENTO SUSTENTO". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTADOS_POSTULANTE: 'Error, no se pudo acceder al servicio "ESTADOS POSTULANTE". Si persiste el error, comuníquese con el administrador del sistema.',
    NACIONALIDADES: 'Error, no se pudo acceder al servicio "NACIONALIDADES". Si persiste el error, comuníquese con el administrador del sistema.',
    ESTADOS_RESULTADO_FINAL: 'Error, no se pudo acceder al servicio "ESTADOS-CONTRATACIÓN DIRECTA". Si persiste el error, comuníquese con el administrador del sistema.',
    IMPEDIMENTOS: 'Error, no se pudo acceder al servicio "IMPEDIMENTOS". Si persiste el error, comuníquese con el administrador del sistema.',
}

export const COMMON_MESSAGE = {
    CARGAR_INSTANCIAS:
        'Error, no se pudo acceder al servicio "CONSULTAR DRE.". Si persiste el error, comuníquese con el administrador del sistema.',
    CARGAR_SUB_INSTANCIAS:
        'Error, no se pudo acceder al servicio "CONSULTAR UGELES". Si persiste el error, comuníquese con el administrador del sistema.',
    CARGAR_TIPOS_DOCUMENTO_EMPRESA:
        'Error, no se pudo acceder al servicio "CONSULTAR TIPOS DE DOCUMENTO PARA EMPRESAS". Si persiste el error, comuníquese con el administrador del sistema.',
    CARGAR_INSTITUCIONES_EDUCATIVAS:
        'Error, no se pudo acceder al servicio "CONSULTAR INSTITUCIONES EDUCATIVAS". Si persiste el error, comuníquese con el administrador del sistema.',
    BUSCAR_PROYECTO_RESOLUCION:
        'Error, no se pudo acceder al servicio "BUSCAR PROYECTO DE RESOLUCIÓN". Si persiste el error, comuníquese con el administrador del sistema.',
};