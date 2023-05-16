export const environment = {
    production: false,
    hmr: false,
    documentoConfig: {
        CODIGO_SISTEMA: "7",
        TAMANIO_MAXIMO_EN_MB: 2,
        FORMATOS_SOPORTADO: "application/pdf",
    },
    comunesPrefix: "http://localhost:63819/v1/rrhh/negocio/comunes/maestros",
    documentosPrefix: "http://localhost:81/v2/tecnologia/util",
    asistenciaPrefix: "http://localhost:94/v1/rrhh/personal/asistencia",
    licenciasPrefix: "https://localhost:44376/v1/rrhh/personal/licencias",
    aprobacionesPrefix:
        "http://localhost:51179/v1/rrhh/personal/procesos/configuracion",

    alertasPrefix: "http://localhost:98/v1/rrhh/negocio/comunes/alertas",
    actividadesPrefix:
        "http://localhost:99/v1/rrhh/negocio/comunes/actividades",
    accionesPrefix: "http://localhost:54712/api/personal/acciones/personal",
    solicitudesPrefix:
        "http://localhost:99/v1/rrhh/negocio/comunes/solicitudes",

    sancionesPrefix: "http://localhost:55296/v1/rrhh/personal/sanciones",
    contratacionesPrefix:
        "http://localhost:55296/v1/rrhh/personal/procesos/contratacion",
    ascensoPrefix: "http://localhost:44317/v1/rrhh/personal/procesos/ascensos",
    rotacionPrefix:
        "https://localhost:44317/v1/rrhh/personal/procesos/ascensos",
    resolucionPrefix: "http://localhost:90/v1/rrhh/resoluciones/resoluciones",
    nombramientoPrefix: "http://localhost:5013/v1/rrhh/personal/procesos/nombramiento",
    reportesCAPPrefix: "http://localhost:4256/v1/rrhh/personal/reportes/cap",
    plazaEspejoPrefix: "https://localhost:44313/v1/rrhh/personal/acciones/plazaespejo",

    otrasFuncionalidadesPrefix: "http://localhost:1812/v1/rrhh/personal/otrasfuncionalidades"
};
