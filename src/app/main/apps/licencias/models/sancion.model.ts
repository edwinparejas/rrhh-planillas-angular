export class SancionModel {
    idSancion: number;
    idFalta: number;
    idServidorPublico: number;
    idOrigen: number;
    idTipoSancion: number;
    idEstadoSancion: number;
    codigoSancion: number;
    fechaInformeSancion: Date;
    numeroInformeSancion: string;
    codigoAdjuntoSancion: string;
    esSancionado: boolean;
    tiempoSancion: number;
    tieneResolucion: boolean;
    numeroResolucion: string;
    codigoAdjuntoResolucion: string;
    observaciones: string;
    cantidasDiasTranscurridos: number;
    generaProyecto: boolean;
    activo: boolean;
}
