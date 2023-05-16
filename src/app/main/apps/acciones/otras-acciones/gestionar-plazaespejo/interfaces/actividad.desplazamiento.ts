
export interface IDatosPersonalesResponse {
    documentoIdentidad?: string;
    numeroDocumentoIdentidad?: string;
    primerApellido?: string;
    segundoApellido?: string;
    nombre?: string;
    descripcionSituacionLaboral?: string;
    institucionEducativa?: string;
    descripcionRegimenLaboral?: string;
}

export interface IDatosResolucionResponse {
    numeroResolucion?: any;
    descripcionTipoResolucion?: any;
    numeroProyectoResolucion?: string;
    fechaResolucion?: any;
    descripcionRegimenLaboralResolucion?: string;
    descripcionGrupoAccion?: string;
    descripcionAccion?: string;
    descripcionMotivoAccion?: string;
    anotaciones?: string;
}

export interface IDatosPlazaOrigenResponse {
    codigoPlazaOrigen?: string;
    tipoPlazaOrigen?: string;
    centroTrabajoOrigen?: string;
    regimenLaborarOrigen?: string;
    condicionPlazaOrigen?: string;
    jornadaLaboralOrigen?: string;
    categoriaRemunerativaOrigen?: string;
    tipoCargoOrigen?: string;
    modalidadEducativaOrigen?: string;
    nivelEducativoOrigen?: string;
    areaCurricularOrigen?: any;
    cargoOrigen?: string;
}

export interface IDatosPlazaDestinoResponse {
    codigoPlazaDestino?: string;
    tipoPlazaDestino?: string;
    centroTrabajoDestino?: string;
    regimenLaborarDestino?: string;
    condicionPlazaDestino?: string;
    jornadaLaboralDestino?: string;
    categoriaRemunerativaDestino?: string;
    tipoCargoDestino?: string;
    modalidadEducativaDestino?: string;
    nivelEducativoDestino?: string;
    areaCurricularDestino?: any;
    cargoDestino?: string;
}

export interface IActividadDesplazamientoResponse {
    datosPersonales: IDatosPersonalesResponse;
    datosResolucion: IDatosResolucionResponse;
    datosPlazaOrigen: IDatosPlazaOrigenResponse;
    datosPlazaDestino: IDatosPlazaDestinoResponse;
}
