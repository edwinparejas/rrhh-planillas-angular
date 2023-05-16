import { MatTableDataSource } from "@angular/material/table";

export class IncidenciaModel {
    idIncidencia: number = null;
    idAsistenciaServidor: number = null;
    idServidorPublic: number =null;
    idTipoIncidencia: number = null;
    idTipoRegistro: number = 23;
    fechaIncidencia: string = null;
    eliminado: boolean = false;
    horas: number = 0;
    minutos: number = 0;
}

export class IncidenciaListaModel {
    registro: number;
    idIncidencia: number;

    idAsistenciaServidor: string;
    idTipoIncidencia: number;
    idTipoRegistro: number;

    fechaIncidencia: string;
    horas: number;
    minutos: number;
    cantidadIncidencia: number;
    eliminado: boolean;
    usuarioCreacion: string;
    hovered: boolean;
}

export class ModalIncidenciaModel {
    title: string = "";
    type: 1; //exx
    loading: boolean = false;
    idAsistenciaServidor: string = "";
    idTipoIncidencia: number = null;
    onlyFecha: boolean = false;
    dateMin: Date = null;
    dateMax: Date = null;
    
    incidencias: IncidenciaListaModel[] = [];
    incidenciasNoVisual: IncidenciaListaModel[] = [];
    displayedColumns: string[] = [
        "registro",
        "fechaIncidencia",
        "horas",
        "minutos",
        "accion",
    ];
    totalRow: number = 0;
}

export class BuscarServidorModel {
    idTipoDocumentoIdentidad: number = 0;
    numeroDocumentoIdentidad: string = "";
    primerApellido: string = "";
    segundoApellido: string = "";
    nombres: string = "";
    codigoPlaza: string = "";
    idRegimen: number = null;
    p: string = "";
    pp: string = "";
}

export class FormBuscarServidorModel {
    buscarServidorModel = new BuscarServidorModel();
}

export class ServidorListaModel {
    apellidosNombres: string = null;
    descripcionCargo: string = null;
    descripcionCondicionLaboral: string = null;
    descripcionRegimenLaboral: string = null;
    horasPermisoConGoce: number = null;
    horasPermisoSinGoce: number = null;
    horasTardanza: number = null;
    hovered: boolean = null;
    idAsistenciaServidor: number = null;
    jornadaLaboral: string = null;
    minutosPermisoConGoce: number = null;
    minutosPermisoSinGoce: number = null;
    minutosTardanza: number = null;
    numeroDocumentoIdentidad: string = null;
    permiteEditar: boolean = null;
    registro: number = null;
    sinIncidencias: boolean = null;
    totalHuelgaParo: number = null;
    totalInasistenciaInjustificada: number = null;
    totalLicenciaConGoce: number = null;
    totalLicenciaSinGoce: number = null;
    totalPermisoConGoce: number = null;
    totalPermisoSinGoce: number = null;
    totalRegistro: number = null;
    totalTardanza: number = null;
    totalVacaciones: number = null;
}

export class GrillaBandejaServidorModel {
    totalRow: number = 0;
    loading: boolean = false;
    idControlAsistencia: number = null;
    selectArray: Array<number> = [];
    ////
    servidores = new MatTableDataSource<ServidorListaModel>();
    displayedColumns: string[] = [
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
    //
    filterLists = { tiposDocumentos: [], regimenesLaboral: [] };
}

export class ContainerBandejaServidorModel {
    title: string = "Registrar asistencia mensual";
    loading: boolean = false;
    grillaBandejaServidorModel = new GrillaBandejaServidorModel();
    formBuscarServidorModel = new FormBuscarServidorModel();
}

export class BandejaServidorModel {
    containerBandejaServidorModel = new ContainerBandejaServidorModel();
    modalIncidenciaModel = new ModalIncidenciaModel();
}