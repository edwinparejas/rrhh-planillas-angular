//#region reporte-consoliado-mensual
export interface IAsistenciaServidor {
    idAsistenciaServidor: number;
    numeroDocumentoIdentidad: string;
    apellidosNombres: string;
    descripcionCargo: string;
    descripcionRegimenLaboral: string;
    descripcionCondicionLaboral: string;
    jornadaLaboral: string;
    totalTardanza: number;
    horasTardanza: number;
    minutosTardanza: number;
    totalPermisoSinGoce: number;
    horasPermisoSinGoce: number;
    minutosPermisoSinGoce: number;
    totalPermisoConGoce: number;
    horasPermisoConGoce: number;
    minutosPermisoConGoce: number;
    totalInasistenciaInjustificada: number;
    totalHuelgaParo: number;
    totalVacaciones: number;
    totalLicenciaConGoce: number;
    totalLicenciaSinGoce: number;
    sinIncidencias: boolean;

    registro: number;
    totalRegistro: number;
}

export interface IGrillaReporteConsoliado {
    totalRow: number;
    loading: boolean;
    servidores: IAsistenciaServidor[];
    displayedColumns: string[];
}

export interface IFormBusquedaConsolidado {
    idControlAsistencia: number;
    descripcionMes: string;
    anio: number;
    p: number;
    pp: number;
}

export interface IContainerReporteConsolidado {
    title: string;
    loading: boolean;
    grillaReporteConsoliadoModel: IGrillaReporteConsoliado;
    formBusquedaConsolidadoModel: IFormBusquedaConsolidado;
}

export interface IReporteConsolidado {
    containerReporteConsolidadoModel: IContainerReporteConsolidado;
}
//#endregion

//#region reporte-detallado-mensual
export interface IAsiDetalladoCabecera {
    nombreMes: string;
    _1: string;
    _2: string;
    _4: string;
    _5: string;
    _6: string;
    _7: string;
    _8: string;
    _9: string;
    _10: string;
    _11: string;
    _12: string;
    _13: string;
    _14: string;
    _15: string;
    _16: string;
    _17: string;
    _18: string;
    _19: string;
    _20: string;
    _21: string;
    _22: string;
    _23: string;
    _24: string;
    _25: string;
    _26: string;
    _27: string;
    _28: string;
    _29: string;
    _30: string;
    _31: string;
}

export interface IAsistenciaDetallado {
    numeroDocumentoIdentidad: string;
    apellidosNombres: string;
    descripcionRegimenLaboral: string;
    descripcionCargo: string;
    descripcionCondicionLaboral: string;
    jornadaLaboral: string;
    _1: string;
    _2: string;
    _4: string;
    _5: string;
    _6: string;
    _7: string;
    _8: string;
    _9: string;
    _10: string;
    _11: string;
    _12: string;
    _13: string;
    _14: string;
    _15: string;
    _16: string;
    _17: string;
    _18: string;
    _19: string;
    _20: string;
    _21: string;
    _22: string;
    _23: string;
    _24: string;
    _25: string;
    _26: string;
    _27: string;
    _28: string;
    _29: string;
    _30: string;
    _31: string;
    registro: number;
    totalRegistro: number;
}

export interface IGrillaReporteDetallado {
    totalRow: number;
    loading: boolean;
    servidores: IAsistenciaDetallado[];
    displayedColumns: string[];
    cabecera: IAsiDetalladoCabecera;
}

export interface IFormBusquedaDetallado {
    idControlAsistencia: number;
    descripcionMes: string;
    mes: number;
    anio: number;
    p: number;
    pp: number;
}

export interface IContainerReporteDetallado {
    title: string;
    loading: boolean;
    grillaReporteDetalladoModel: IGrillaReporteDetallado;
    formBusquedaDetalladoModel: IFormBusquedaDetallado;
}

export interface IReporteDetallado {
    containerReporteDetalladoModel: IContainerReporteDetallado;
}
//#endregion
