export interface IPlazaDestinoRequest {
    idRegimenLaboral?: number;
    idGrupoAccion?: number;
    idAccion?: number;
    idMotivoAccion?: number;
    esPorProceso?: boolean;
    idServidorPublicoDestino?: number;
    codigoPlazaDestino?: string;
    idServidorPublicoOrigen?: number;
    codigoPlazaOrigen?: string;
    fechaInicioAccion?: any;
}