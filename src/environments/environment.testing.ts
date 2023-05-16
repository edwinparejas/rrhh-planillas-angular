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
        urlRetorno: "http://10.200.8.105:9599/ayni/authorization",
        urlSeguridadLogin: "https://passport4Seguridad-vpn1.minedu.gob.pe:1132/iniciarSesion",
        urlSeguridadPanel: "https://passport4Seguridad-vpn1.minedu.gob.pe:1132/panelSistema",
    },
    passportPrefix: "https://passport4seguridadAPI-vpn1.minedu.gob.pe:1134/api",
    kongAuthPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/tecnologia/seguridad/auth",      

    //COMUNES
    accionesGrabadasPrefix: "http://10.200.8.105:9596/comunes/accionesgrabadas/v1/rrhh/negocio/comunes/accionesgrabadas",
    aprobacionesPrefix: "http://10.200.8.105:9596/comunes/aprobaciones/v1/rrhh/negocio/comunes/aprobaciones",
    proyectosResolucionPrefix: "http://10.200.8.105:9596/comunes/proyectoresolucion/v1/rrhh/negocio/comunes/proyectosresolucion",
    cargaMasivaPrefix: "http://10.200.8.105:9596/comunes/cargamasiva/v1/rrhh/negocio/comunes/cargamasiva",

    plazaReubicacionPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/reubicacion",
    plazaAdecuacionPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/adecuacion",
    
    //PERSONAL
    desplazamientoPrefix: "http://10.200.8.105:9596/personal/accion-desplazamiento/v1/rrhh/personal/acciones-personal/desplazamiento",
    vinculacionesPrefix: "http://10.200.8.105:9596/personal/accion-vinculacion/v1/rrhh/personal/acciones/vinculaciones",
    gestionProcesosPrefix: "http://10.200.8.105:9596/personal/gestion-procesos/v1/rrhh/personal/procesos/gestion",

    contratacionesPrefix: "http://10.200.8.105:9596/personal/proceso-contratacion/v1/rrhh/personal/procesos/contratacion",
    cuadroHorasPrefix: "http://10.200.8.105:9596/personal/proceso-cuadrohoras/v1/rrhh/personal/procesos/cuadrohoras",
    encargaturaPrefix: "http://10.200.8.105:9596/personal/proceso-encargatura/v1/rrhh/personal/procesos/encargatura",
    nombramientoPrefix: "http://10.200.8.105:9596/personal/proceso-nombramiento/v1/rrhh/personal/procesos/nombramiento",
    reasignacionesPrefix: "http://10.200.8.105:9596/personal/proceso-reasignacion/v1/rrhh/personal/procesos/reasignacion",
    rotacionPrefix: "http://10.200.8.105:9596/personal/proceso-rotacion/v1/rrhh/personal/procesos/rotacion",
    reportesCAPPrefix: "http://10.200.8.105:9596/personal/reportes-cap/v1/rrhh/personal/reportes/cap",
    desvinculacionesPrefix: "http://10.200.8.105:9596/personal/accion-desvinculacion/v1/rrhh/personal/acciones/desvinculaciones",
    plazaEspejoPrefix: "http://10.200.8.105:9596/personal/accion-plazaespejo/v1/rrhh/personal/acciones/plazaespejo",
    beneficiosPrefix: "http://10.200.8.105:9596/personal/accion-beneficios/v1/rrhh/personal/acciones/beneficios",
    
    //
    cuadroHoras30512Prefix: "http://10.200.8.105:9596/v1/rrhh/personal/procesos/cuadrohora30512",
    licenciasPrefix: "http://10.200.8.105:9596/personal/accion-licencias/v1/rrhh/personal/licencias",

    //OTROS
    comunesPrefix: "http://10.200.8.105:9596/comunes/maestros/v1/rrhh/negocio/comunes/maestros",
    documentosPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v2/tecnologia/util",
    asistenciaPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/personal/asistencia",
    alertasPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/negocio/comunes/alertas",
    actividadesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/negocio/comunes/actividades",
    accionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/api/personal/acciones/personal",
    solicitudesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/negocio/comunes/solicitudes",
    sancionesPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/personal/sanciones",
    historialPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/historial",
    ascensoPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/personal/proceso-ascensos/v1/rrhh/personal/procesos/ascensos",

    personalHistorialPrefix: "http://10.200.8.105:9596/personal/personal-historial/v1/rrhh/personal/historial",

    otrasFuncionalidadesPrefix: "http://10.200.8.105:9596/personal/accion-otrasfuncionalidades/v1/rrhh/personal/otrasfuncionalidades"
};
