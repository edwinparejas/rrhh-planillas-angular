export const environment = {
    production: true,
    hmr: false,
    //INICIO CONFIGURACION DE DOCUMENTOS Y SEGURIDAD
    documentoConfig: {
        CODIGO_SISTEMA: "7",
        TAMANIO_MAXIMO_EN_MB: 2,
        FORMATOS_SOPORTADO: "application/pdf",
    },
    passportConfig: {
        codigoSistema: "001495",
        urlRetorno: "http://10.200.8.105:9598/ayni/authorization",
        urlSeguridadLogin:
            "https://passport4Seguridad-vpn1.minedu.gob.pe:1132/iniciarSesion",
        urlSeguridadPanel:
            "https://passport4Seguridad-vpn1.minedu.gob.pe:1132/panelSistema",
    },
    passportPrefix: "https://passport4seguridadAPI-vpn1.minedu.gob.pe:1134/api",
    kongAuthPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/tecnologia/seguridad/auth",

    //SERVICIOS GENERICOS - GLOBALES[TRANSVERSALES]
    documentosPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v2/tecnologia/util",
    comunesPrefix: "http://10.200.8.105:9595/comunes/maestros/v1/rrhh/negocio/comunes/maestros",

    gestionProcesosPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/gestion-procesos/v1/rrhh/personal/procesos/gestion",
    desplazamientoPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/accion-desplazamiento/v1/rrhh/personal/acciones-personal/desplazamiento",
    rotacionPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-rotacion/v1/rrhh/personal/procesos/rotacion",
    reasignacionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-reasignacion/v1/rrhh/personal/procesos/reasignacion",

    //COMUNES
    cargaMasivaPrefix: "http://10.200.8.105:9595/comunes/cargamasiva/v1/rrhh/negocio/comunes/cargamasiva",
    accionesGrabadasPrefix: "http://10.200.8.105:9595/comunes/accionesgrabadas/v1/rrhh/negocio/comunes/accionesgrabadas",
    aprobacionesPrefix: "http://10.200.8.105:9595/comunes/aprobaciones/v1/rrhh/negocio/comunes/aprobaciones",
    proyectosResolucionPrefix: "http://10.200.8.105:9595/comunes/proyectoresolucion/v1/rrhh/negocio/comunes/proyectosresolucion",

    plazaReubicacionPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/reubicacion",
    plazaAdecuacionPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/adecuacion",
    
    //SERVICIOS ESPECIFICOS POR SU FUNCION
    asistenciaPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/personal/asistencia",
    licenciasPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/accion-licencias/v1/rrhh/personal/licencias",
    alertasPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/negocio/comunes/alertas",
    actividadesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/negocio/comunes/actividades",
    accionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/api/personal/acciones/personal",
    solicitudesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/negocio/comunes/solicitudes",
    sancionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/personal/sanciones",
    contratacionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-contratacion/v1/rrhh/personal/procesos/contratacion",
    historialPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/historial",
    reportesCAPPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/reportes-cap/v1/rrhh/personal/reportes/cap",
    ascensoPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443//personal/proceso-ascensos/v1/rrhh/personal/procesos/ascensos",
    nombramientoPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-nombramiento/v1/rrhh/personal/procesos/nombramiento",
    encargaturaPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-encargatura/v1/rrhh/personal/procesos/encargatura",
    cuadroHorasPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-cuadrohoras/v1/rrhh/personal/procesos/cuadrohoras",
    cuadroHoras30512Prefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-cuadrohoras30512/v1/rrhh/personal/procesos/cuadrohora30512",
    vinculacionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/accion-vinculacion/v1/rrhh/personal/acciones/vinculaciones",
    desvinculacionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/accion-desvinculacion/v1/rrhh/personal/acciones/desvinculaciones",
    plazaEspejoPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/accion-plazaespejo/v1/rrhh/personal/acciones/plazaespejo",
    beneficiosPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/accion-beneficios/v1/rrhh/personal/acciones/beneficios",
    personalHistorialPrefix: "http://10.200.8.105:9595/personal/personal-historial/v1/rrhh/personal/historial",
    
    otrasFuncionalidadesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/accion-otrasfuncionalidades/v1/rrhh/personal/otrasfuncionalidades"
};
