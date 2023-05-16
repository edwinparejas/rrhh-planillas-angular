export class PlazaNombramientoResponseModel{

    codigoModular : string;
    anexoInstitucionEducativa : string;
    institucionEducativa : string;
    departamento:string;
    provincia:string;
    distrito:string;
    modalidadEducativa:string;
    nivelEducativo:string;
    descripcionInstancia : string;
    descripcionSubInstancia : string;
    descripcionGrupoInscripcion : string;

    descripcionTipoInstitucionEducativa : string;
    descripcionTipoGestionInstitucionEducativa : string;
    descripcionDependenciaInstitucionEducativa : string;
    descripcionTipoRuralidad : string;
    esBilingue : boolean;

    descripcionLenguaOriginaria : string;
    descripcionFormaAtencion : string;
    esFrontera : boolean;
    descripcionEsVraem : string;

    codigoPlaza : string;
    descripcionCargo : string;
    descripcionJornadaLaboral : string;
    descripcionAreaCurricular : string;
    descripcionEspecialidad : string;
    
    descripcionTipoPlaza : string;
    vigenciaInicio : Date;
    descripcionRegimenLaboral : string;
    motivoVacancia : string;

    descripcionMotivoObservacion : string;
    detalleObservacion : string;

    fechaCorte: Date;
    descripcionEstadoValidacionPlaza : string;
    codigoEstadoValidacionPlaza : number;

    idEtapaProceso :  number;								
    idPlazaNombramiento :  number;								
    idAlcanceProceso:  number;	

    incorporarPlazas:boolean;
    plazasConvocar:boolean;
    plazasObservadas:boolean;
    finalizarValidacionPlazas:boolean;
    migrarPlazasDesiertas:boolean;
    publicarPlazas:boolean;
    aperturarPublicacionPlazas:boolean;

}