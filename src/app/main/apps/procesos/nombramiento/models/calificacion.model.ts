export class CalificacionResponseModel{

    idCalificacion: number;

    abreviaturaTipoDocumentoIdentidad : string;
    numeroDocumentoIdentidad : string;
    nombres : string;
    primerApellido : string;
    segundoApellido : string;
    fechaNacimiento: Date;
    descripcionGenero: string;

    codigoPlaza: string;
    descripcionCargo: string;
    descripcionJornadaLaboral: string;
    descripcionAreaCurricular : string;
    descripcionEspecialidad : string;
    descripcionTipoPlaza : string;
    
    descripcionRegimenLaboral : string;
    codigoModular : string;
    institucionEducativa : string;
    descripcionInstancia : string;
    descripcionSubInstancia: string;
    descripcionGrupoInscripcion : string;

    descripcionTipoIEPadron : string;
    descripcionTipoGestionIE: string;
    descripcionDependenciaIE: string;
    descripcionTipoRuralidad: string;
    esBilingue: boolean;
    descripcionLenguajeIE: string;

    descripcionFormaAtencion: string;
    esFrontera: boolean;
    descripcionVraemIE: string;
    vigenciaInicio: Date;
    motivoVacancia: string;

}