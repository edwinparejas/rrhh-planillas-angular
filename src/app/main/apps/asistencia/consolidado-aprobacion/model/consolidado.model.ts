export class AprobarConsolidadoModel {
    idConsolidado: number = null;
    usuarioAprobador: string = null;
    usuario: string = null; 
}

export class RechazarConsolidadoModel {
    idConsolidado: number = null;
    motivoRechazo: string = null;
    usuario: string = null;
}
export class ConsolidadoAprobacionModel {
idConsolidado: number;
idCentroTrabajo: number;
descripcionCentroTrabajo: string;
codigoModular: string;
idNivelEducativo: number;
descripcionNivelEducativo: string;
idModaliadEducativa: number;
descripcionModalidadEducativa: string;
idEstado: number;
descripcionEstado: string;
fechaSolicitada: string;

}
