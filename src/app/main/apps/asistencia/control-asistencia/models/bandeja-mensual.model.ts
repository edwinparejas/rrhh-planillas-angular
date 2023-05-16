import { MatTableDataSource } from "@angular/material/table";

export interface ModalVerMotivoDevolucionModel {
  
    
    usuarioDevuelto?: string;
    usuarioRolDevolucionAsistencia?: string;
    detalleDevolucion?: string;
}


export class BuscarBandejaMensualModel {
    codigoCentroTrabajo: string = "";
    usuarioCreacion: string = "";
    anio: any = null;
    p: number = 1;
    pp: number = 10;
}

export class FormBuscarBandejaMensualModel {
    buscarBandejaMensualModel = new BuscarBandejaMensualModel();
}

export class MesListaModel {
    idControlAsistencia: number = 0;
    descripcionMes: string = "";
    descripcion: string = "";
    idEstado: number = null;
    estadoControlAsistencia: string = "";
    fechaAprobado: string = "";
    fechaRemitido: string = "";
    fechaDevuelto: string = "";
    registro: number = 0;
    totalRegistro: number = 0;
    permiteEditar:boolean = null;
}

export class GrillaBandejaMensualModel {
    totalRow: number = 0;
    loading: boolean = false;
    meses = new MatTableDataSource<MesListaModel>();
    displayedColumns: string[] = [
        "registro",
        "descripcionMes",
        "descripcion",
        "estadoControlAsistencia",
        "fechaRemitido",
        "fechaDevuelto",
        "fechaAprobado",
        "accion",
    ];
}

export class ContainerBandejaMensualModel {
    title: string = "Control de asistencia mensual";
    loading: boolean = false;
    formBuscarBandejaMensualModel = new FormBuscarBandejaMensualModel();
    grillaBandejaMensualModel = new GrillaBandejaMensualModel();
 //   modalVerMotivoDevolucionModel = new ModalVerMotivoDevolucionModel();
}

export class BandejaMensualModel {
    containerBandejaMensualModel = new ContainerBandejaMensualModel();
}


export class BandejaMensualGrillaModel {
    descripcion: string = "";
    estadoControlAsistencia: string = "";
    descripcionMes: string = "";
    fechaAprobado: string = "";
    fechaRemitido: string = "";
    fechaDevuelto: string = "";
    idControlAsistencia: number = 0;
    registro: number = 0;
    totalRegistro: number = 0;
}
