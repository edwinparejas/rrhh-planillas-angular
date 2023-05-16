export const environment = {
    production: false,
    hmr: false,

    //INICIO CONFIGURACION DE DOCUMENTOS Y SEGURIDAD
    documentoConfig: {
        CODIGO_SISTEMA: "7",
        TAMANIO_MAXIMO_EN_MB: 2,
        FORMATOS_SOPORTADO: "application/pdf",
    },
    passportConfig: {
        codigoSistema: "001495",
        urlRetorno: "http://localhost:4200/ayni/authorization",
        urlSeguridadLogin: "https://passport4Seguridad-vpn1.minedu.gob.pe:1132/iniciarSesion",
        urlSeguridadPanel: "https://passport4Seguridad-vpn1.minedu.gob.pe:1132/panelSistema",
    },
    passportPrefix: "https://passport4seguridadAPI-vpn1.minedu.gob.pe:1134/api",
    kongAuthPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/tecnologia/seguridad/auth",

    //SERVICIOS GENERICOS - GLOBALES[TRANSVERSALES]
    documentosPrefix:  "http://10.200.8.136:8000/v2/tecnologia/util" ,//"https://dev-api-ayni-digital.minedu.gob.pe:8443/v2/tecnologia/util",
    // documentosPrefix: "http://localhost:81/v1/tecnologia/util",
    comunesPrefix: "http://10.200.8.105:9595/comunes/maestros/v1/rrhh/negocio/comunes/maestros",
    // comunesPrefix: "http://localhost:63819/v1/rrhh/negocio/comunes/maestros",

    //SERVICIOS ESPECIFICOS POR SU FUNCION
    asistenciaPrefix: "http://localhost:8114/v1/rrhh/personal/asistencia",
    licenciasPrefix: "http://localhost:8098/v1/rrhh/personal/licencias",
    gestionProcesosPrefix: "https://localhost:44310/v1/rrhh/personal/procesos/gestion",
    alertasPrefix: "http://localhost:98/v1/rrhh/negocio/comunes/alertas",
    actividadesPrefix: "http://localhost:99/v1/rrhh/negocio/comunes/actividades",
    accionesPrefix: "http://localhost:54712/api/personal/acciones/personal",
    desplazamientoPrefix: "https://localhost:44301/v1/rrhh/personal/acciones-personal/desplazamiento",
    solicitudesPrefix: "http://localhost:99/v1/rrhh/negocio/comunes/solicitudes",
    sancionesPrefix: "http://localhost:55296/v1/rrhh/personal/sanciones",
    contratacionesPrefix: "https://localhost:44337/v1/rrhh/personal/procesos/contratacion",
    plazaPrefix: "http://localhost:86/v1/rrhh/plazas/registro",
    historialPrefix: "http://localhost:89/v1/rrhh/plazas/historial",

   //cargaMasivaPrefix: 'http://localhost:5009/v1/rrhh/negocio/comunes/cargamasiva',
    cargaMasivaPrefix: 'http://localhost:8443/v1/rrhh/negocio/comunes/cargamasiva',
    //ascensoPrefix: "https://localhost:44317/v1/rrhh/personal/procesos/ascensos",
    rotacionPrefix: "https://localhost:44335/v1/rrhh/personal/procesos/rotacion",
    
    
   // cargaMasivaPrefix: "http://10.200.8.136:8000/v1/rrhh/negocio/comunes/cargamasiva",
    // ascensoPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/personal/procesos/ascensos",
    ascensoPrefix: "https://localhost:44301/v1/rrhh/personal/procesos/ascensos",

    //resolucionPrefix: "http://localhost:90/v1/rrhh/resoluciones/resoluciones",
    resolucionPrefix: "http://10.200.8.136:8000/v1/rrhh/resoluciones/resoluciones",
    reasignacionesPrefix: "http://localhost:8112/v1/rrhh/personal/procesos/reasignacion",
    //reasignacionesPrefix: "https://localhost:44301",
    nombramientoPrefix: "https://localhost:44308/v1/rrhh/personal/procesos/nombramiento",
    accionesGrabadasPrefix: "https://localhost:44305/v1/rrhh/negocio/comunes/accionesgrabadas",

    encargaturaPrefix: "https://localhost:44307/v1/rrhh/personal/procesos/encargatura",
    cuadroHorasPrefix: "http://localhost:39580/v1/rrhh/personal/procesos/cuadrohoras",
    cuadroHoras30512Prefix: "https://localhost:44301/v1/rrhh/personal/procesos/cuadrohora30512",

    vinculacionesPrefix: "https://localhost:44308/v1/rrhh/personal/acciones/vinculaciones",
    // aprobacionesPrefix: "http://localhost:44302/v1/rrhh/negocio/comunes/aprobaciones",
    aprobacionesPrefix: "http://10.200.8.105:9595/comunes/aprobaciones/v1/rrhh/negocio/comunes/aprobaciones",
    reportesCAPPrefix: "http://localhost:8595/v1/rrhh/personal/reportes/cap",

    proyectosResolucionPrefix: "https://localhost:44303/v1/rrhh/negocio/comunes/proyectosresolucion",
    plazaReubicacionPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/reubicacion",
    plazaAdecuacionPrefix: "https://dev-api-ayni-digital.minedu.gob.pe:8443/v1/rrhh/plazas/adecuacion",

    desvinculacionesPrefix: "https://localhost:44324/v1/rrhh/personal/acciones/desvinculaciones",
    plazaEspejoPrefix: "https://localhost:44313/v1/rrhh/personal/acciones/plazaespejo",
    beneficiosPrefix: "https://localhost:44354/v1/rrhh/personal/acciones/beneficios",

    personalHistorialPrefix: "https://localhost:44339/v1/rrhh/personal/historial",

    otrasFuncionalidadesPrefix: "http://localhost:1812/v1/rrhh/personal/otrasfuncionalidades"
};
