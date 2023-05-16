import {
    IAsistenciaServidor,
    IContainerReporteConsolidado,
    IFormBusquedaConsolidado,
    IGrillaReporteConsoliado,
    IReporteConsolidado,
} from "../../../interfaces/reporte-asistencia.interface";

export class AsistenciaServidorModel implements IAsistenciaServidor {
    idAsistenciaServidor = null;
    numeroDocumentoIdentidad = null;
    apellidosNombres = null;
    descripcionCargo = null;
    descripcionRegimenLaboral = null;
    descripcionCondicionLaboral = null;
    jornadaLaboral = null;
    totalTardanza = null;
    horasTardanza = null;
    minutosTardanza = null;
    totalPermisoSinGoce = null;
    horasPermisoSinGoce = null;
    minutosPermisoSinGoce = null;
    totalPermisoConGoce = null;
    horasPermisoConGoce = null;
    minutosPermisoConGoce = null;
    totalInasistenciaInjustificada = null;
    totalHuelgaParo = null;
    totalVacaciones = null;
    totalLicenciaConGoce = null;
    totalLicenciaSinGoce = null;
    sinIncidencias = null;
    registro = null;
    totalRegistro = null;
}

export class GrillaReporteConsoliadoModel implements IGrillaReporteConsoliado {
    totalRow = null;
    loading = false;
    servidores = [];
    displayedColumns = [
        "registro",
        "numeroDocumentoIdentidad",
        "apellidosNombres",
        "descripcionRegimenLaboral",
        "descripcionCargo",
        "jornadaLaboral",
        "totalTardanza",
        "totalPermisoSinGoce",
        "totalPermisoConGoce",
        "totalInasistenciaInjustificada",
        "totalHuelgaParo",

        "totalVacaciones",
        "totalLicenciaConGoce",
        "totalLicenciaSinGoce",
        "sinIncidencias",
    ];
}

export class FormBusquedaConsolidadoModel implements IFormBusquedaConsolidado {
    idControlAsistencia = null;
    descripcionMes = null;
    anio = null;
    p = 1;
    pp = 20;
}

export class ContainerReporteConsolidadoModel
    implements IContainerReporteConsolidado {
    title = "REPORTE CONSOLIDADO DE ASISTENCIAS";
    loading = false;
    grillaReporteConsoliadoModel = new GrillaReporteConsoliadoModel();
    formBusquedaConsolidadoModel = new FormBusquedaConsolidadoModel();
}

export class ReporteConsolidadoModel implements IReporteConsolidado {
    containerReporteConsolidadoModel = new ContainerReporteConsolidadoModel();
}

export const InitialState = new ReporteConsolidadoModel();
