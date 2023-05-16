
export interface ControlesActivos{
    btnIncorporarPlazas: boolean,
    btnPlazasConvocar:boolean,
    btnPlazasObservadas:boolean,    
    btnFinalizarValidacionPlazas:boolean,
    btnPlazasDesiertasCD:boolean,
    btnPublicarPlazas:boolean,
    btnAperturarPlazas:boolean,    
    btnVerPlazasPDF:boolean, 
    btnExportar:boolean
}
export interface ControlesActivosPostulante{
    btnNuevoPostulante:boolean,
    btnAprobarPostulantes:boolean,
    btnEditarPostulante:boolean,
    btnEliminarPostulante: boolean,
    btnSolicitarInformeEscalafonario:boolean,
    btnExportar:boolean,
}
export interface ControlesActivosCalificacion {
    btnRealizarEvaluacion: boolean;
    btnEvaluarCuadroMerito: boolean;
    btnRealizarCalificacion: boolean;
    btnObservarPostulante: boolean;
    btnRegistrarReclamo: boolean;
    btnGenerarOrdenMerito: boolean;
    btnPublicarResultados: boolean;
    btnPublicarResultadoPreliminar: boolean;
    btnPublicarResultadoFinal: boolean;
    btnPublicarCuadroPreliminar: boolean;
    btnPublicarCuadroFinal: boolean;
    btnExportar:boolean;
    btnImportarInformeEscalafonarioSolicitados:boolean;
}

export interface ControlesActivosAdjudicacion{
    btnFinalizarAdjudicacion:boolean,
    btnFinalizarEtapa:boolean,
    btnAdjudicarPlaza:boolean,
    btnNoAdjudicarPlaza: boolean,
    btnSubsanarObservacion:boolean,
    btnExportar:boolean,
}
