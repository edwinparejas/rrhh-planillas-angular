export class BusquedaCentroTrabajoListaModel {
    idCentroTrabajo: number = null;
    codigoCentroTrabajo: string = null;
    centroTrabajo: string = null;
    instancia: string = null;
    subInstancia: string = null;
    idTipoCentroTrabajo: number = null;
    tipoCentroTrabajo: string = null;
}
export class BusquedaCentroTrabajoGrillaModel {
    totalRow: number = 0;
    loading: boolean = false;
    idConsolidadoIged: number = null;

    //centros = new MatTableDataSource<CentroListaModel>();
    centros: BusquedaCentroTrabajoListaModel[] = [];
    displayedColumns: string[] = [
        "codigoCentroTrabajo",
        "centroTrabajo",
        "instancia",
        "subInstancia",
        "tipoCentroTrabajo",
    ];
}
export class BusquedaCentroTrabajoModel {
    idDre: number = null;
    idUgel: number = null;
    p: number = null;
    pp: number = null;
    codigoTipoSede: string = null;
    codigoSede: string = null;
}
export class ModalBusquedaCentroTrabajoModel {
    title: string = "Búsqueda de centro de trabajo";
    type: number = null; //exx
    loading: boolean = false;
    dres: any[] = [];
    ugeles: any[] = [];

    busquedaCentroTrabajoModel = new BusquedaCentroTrabajoModel();
    busquedaCentroTrabajoGrillaModel = new BusquedaCentroTrabajoGrillaModel();
}
export class ControlAsistenciaObservacionModel {
    usuarioCreacion: string = "";
    observacion: string = "";
    usuarioObservado: string = "";
    usuarioRolObservado: string = "";
}

export class ModalRegistrarObservacionModel {
    title: string = "";
    type: number = null; //exx
    loading: boolean = false;
    idControlAsistencia: number = null;
    controlAsistenciaObservacionModel = new ControlAsistenciaObservacionModel();
}

export class BuscarCentroTrabajoModel {
    p: string = "";
    pp: string = "";
    anio: number = null;
    idMes: number = null;
    idEstado: number = null;
    idsEstado: number[] = null;
    codigoCentroTrabajo: string = null;
    codigoModular: string=null;
}
export class BuscarOmisosModel {
    p: string = "";
    pp: string = "";
    anio: number = null;
    idMes: number = null;
    idEstado: number = null;
    //idsEstado: number[] = null;
    codigoCentroTrabajo: string = null;
}
export class FormBuscarOmisosModel {
    //idConsolidadoIged: number = null;
    buscarOmisosModel = new BuscarOmisosModel();
    meses = [];
    estados = [];
    loading: boolean = false;
}
export class FormBuscarCentroTrabajoModel {
    idConsolidadoIged: number = null;
    buscarCentroTrabajoModel = new BuscarCentroTrabajoModel();
    meses = [];
    estados = [];
    loading: boolean = false;
}

export class CentroListaModel {
    seleccionado: boolean = false;
    idControlAsistencia: number = null;  
    descripcionCentroTrabajo: string = "";
    //descripcionUgel: string ="";
    descripcionDre: string ="";
    codigoModular: string = "";
    descripcionNivelEducativo: string = "";
    descripcionModalidadEducativa: string = "";
    idEstado: number = null;
    descripcionEstado: string = "";
    fechaRemitida: string = "";
    fechaRechazado: string = "";
    fechaAprobado: string = "";
    fechaDevueltaComp: string = "";
    observacion: string = "";
    usuarioRechazado: string = "";
    usuarioRolRechazado: string = "";
    usuarioRolDevolucionAsistencia: string = "";
    usuarioRolDevueltoCompensacion: string = "";
    permiteEditar: boolean = null;
}

export class GrillaBandejaCentroTrabajoModel {
    totalRow: number = 0;
    loading: boolean = false;
    idConsolidadoIged: number = null;
    selectArray: Array<number> = [];
    //centros = new MatTableDataSource<CentroListaModel>();
    centros: CentroListaModel[] = [];
    displayedColumns: string[] = [
        //"seleccionar",
        "registro",
        //"descripcionUgel",
        //"descripcionDre",
        "institucionEducativa",  
        "codigoModular",             
        "descripcionNivelEducativo",
        "descripcionModalidadEducativa",
        "descripcionEstado",
        "fechaRemitida",
        "fechaRechazado",
        "fechaAprobado",
        "fechaDevueltaComp",
        "accion",
    ];
}

export class GrillaBandejaOmisosModel {
    totalRow: number = 0;
    loading: boolean = false;
    idConsolidadoIged: number = null;
    selectArray: Array<number> = [];
    //centros = new MatTableDataSource<CentroListaModel>();
    centros: CentroListaModel[] = [];
    displayedColumns: string[] = [
       // "seleccionar",
        "registro",
   //     "descripcionUgel",
    //    "descripcionDre",
        "codigoModular",
        "institucionEducativa",        
        "descripcionNivelEducativo",
        "descripcionModalidadEducativa",
        "descripcionEstado",
        "fechaRemitida",
        "fechaRechazado",
        "fechaAprobado",
        "fechaDevueltaComp",
        "accion",
    ];
}

export class ContainerBandejaOmisosModel {
    title: string = "Omisos y Remitidos fuera de plazo";
    loading: boolean = false;
    grillaBandejaCentroTrabajoModel = new GrillaBandejaOmisosModel();
    formBuscarCentroTrabajoModel = new FormBuscarCentroTrabajoModel();
}

export class ContainerBandejaCentroModel {
    title: string = "Consolidado por centro de trabajo";
    loading: boolean = false;
    grillaBandejaCentroTrabajoModel = new GrillaBandejaCentroTrabajoModel();
    formBuscarCentroTrabajoModel = new FormBuscarCentroTrabajoModel();
}

export class BandejaCentroTrabajoModel {
    containerBandejaCentroModel = new ContainerBandejaCentroModel();
    modalRegistrarObservacionModel = new ModalRegistrarObservacionModel();
    containerBandejaOmisosModel = new ContainerBandejaOmisosModel();
    modalBusquedaCentroTrabajoModel = new ModalBusquedaCentroTrabajoModel();
}

export const InitialState = new BandejaCentroTrabajoModel();
