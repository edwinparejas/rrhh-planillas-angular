import {
    IAsiDetalladoCabecera,
    IAsistenciaDetallado,
    IContainerReporteDetallado,
    IFormBusquedaDetallado,
    IGrillaReporteDetallado,
} from "../../../interfaces/reporte-asistencia.interface";

export class AsiDetalladoCabeceraModel implements IAsiDetalladoCabecera {
    nombreMes = "";
    _1 = "";
    _2 = "";
    _3 = "";
    _4 = "";
    _5 = "";
    _6 = "";
    _7 = "";
    _8 = "";
    _9 = "";
    _10 = "";
    _11 = "";
    _12 = "";
    _13 = "";
    _14 = "";
    _15 = "";
    _16 = "";
    _17 = "";
    _18 = "";
    _19 = "";
    _20 = "";
    _21 = "";
    _22 = "";
    _23 = "";
    _24 = "";
    _25 = "";
    _26 = "";
    _27 = "";
    _28 = "";
    _29 = "";
    _30 = "";
    _31 = "";
}

export class AsistenciaDetalladoModel implements IAsistenciaDetallado {
    numeroDocumentoIdentidad = null;
    apellidosNombres = null;
    descripcionRegimenLaboral = null;
    descripcionCargo = null;
    descripcionCondicionLaboral = null;
    jornadaLaboral = null;
    _1 = null;
    _2 = null;
    _3 = null;
    _4 = null;
    _5 = null;
    _6 = null;
    _7 = null;
    _8 = null;
    _9 = null;
    _10 = null;
    _11 = null;
    _12 = null;
    _13 = null;
    _14 = null;
    _15 = null;
    _16 = null;
    _17 = null;
    _18 = null;
    _19 = null;
    _20 = null;
    _21 = null;
    _22 = null;
    _23 = null;
    _24 = null;
    _25 = null;
    _26 = null;
    _27 = null;
    _28 = null;
    _29 = null;
    _30 = null;
    _31 = null;
    registro = null;
    totalRegistro = null;
}

export class GrillaReporteDetalladoModel implements IGrillaReporteDetallado {
    totalRow = null;
    loading = false;
    servidores = [];
    displayedColumns = [
        "registro",
        "numeroDocumentoIdentidad",
        "apellidosNombres",
        "descripcionRegimenLaboral",
        "descripcionCargo",
        "_1",
        "_2",
        "_3",
        "_4",
        "_5",
        "_6",
        "_7",
        "_8",
        "_9",
        "_10",
        "_11",
        "_12",
        "_13",
        "_14",
        "_15",
        "_16",
        "_17",
        "_18",
        "_19",
        "_20",
        "_21",
        "_22",
        "_23",
        "_24",
        "_25",
        "_26",
        "_27",
        "_28",
        "_29",
        "_30",
        "_31",
    ];
    cabecera = new AsiDetalladoCabeceraModel();
}

export class FormBusquedaDetalladoModel implements IFormBusquedaDetallado {
    idControlAsistencia = null;
    descripcionMes = null;
    mes = null;
    anio = null;
    p = 1;
    pp = 20;
}

export class ContainerReporteDetalladoModel
    implements IContainerReporteDetallado {
    title: string = "REPORTE DETALLADO DE ASISTENCIAS";
    loading: boolean = false;
    grillaReporteDetalladoModel = new GrillaReporteDetalladoModel();
    formBusquedaDetalladoModel = new FormBusquedaDetalladoModel();
}

export class ReporteDetalladoModel {
    containerReporteDetalladoModel = new ContainerReporteDetalladoModel();
}

export const InitialState = new ReporteDetalladoModel();
