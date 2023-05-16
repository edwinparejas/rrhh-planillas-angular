export class ServidorPublicoModel {
    idServidorPublico: number;
    idPersona: number;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    fechaNacimiento: string;
    descripcionUgel: string;
    centroTrabajo: string;
    abreviaturaRegimenLaboral: string;
    situacionLaboral: string;
    genero: string;
    codigoPlaza: string;
    estadoCivil: string;
    idSituacionLaboral: number;
    idRegimenLaboral: number;
    idCentroTrabajo: number;

    
    descripcionModalidad    : string;
    descripcionNivelEducativo: string;
    jornadaLaboral: string;

    idNivelEducativo: number;
    idModalidadEducativa: number;
    idCargo : number;
    idCategoriaRemunerativa : number;
    idInstitucionEducativa: number;

    descripcionInstitucionEducativa:string;
    descripcionModalidadEducativa :string;
    descripcionCargo :string;
    descripcionCategoriaRemunerativa:string;
    
}

export class FaltaResponseModel {
    idFalta: number;
    idSancion: number;
    idTipoFalta: number;
    idDetalleFalta: number;
    plazoDescargo: number;
    idEstadoFalta: number;
    idTipoDocumentoSustento: number;
    codigoFalta: number;
    numeroDocumentoSustento: number;
    fechaRegistro: Date;
    fechaAviso: Date;
    codigoAdjuntoSustento: string;
    observaciones: string;
    idServidorPublico: number;
    idPersona: number;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    numeroDocumentoIdentidadCompleto: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    fechaNacimiento: string;
    descripcionUgel: string;
    centroTrabajo: string;
    abreviaturaRegimenLaboral: string;
    situacionLaboral: string;
    genero: string;
    codigoPlaza: string;
    estadoCivil: string;
    idSituacionLaboral: number;
    idRegimenLaboral: number;
    idCentroTrabajo: number;
    descripcionTipoFalta: string;
    descripcionDetalleFalta: string;
    descripcionModalidad: string;
    descripcionNivelEducativo: string;
    descripcionAreaCurricular: string;
    descripcionCondicionLaboral: string;
    escalaMagisterial: number;
    descripcionGrupoOcupacion: string;
    descripcionTipoServidor: string;
    documentosSustento: DocumentoSustentoModel[] = [];
    
    idNivelEducativo: number;
    idModalidadEducativa: number;
    idCargo : number;
    idCategoriaRemunerativa : number;
    idInstitucionEducativa: number;

    descripcionInstitucionEducativa:string;
    descripcionModalidadEducativa :string;
    descripcionCargo :string;
    descripcionCategoriaRemunerativa:string;
    jornadaLaboral :string;
}

export class SancionResponseModel {
    idSancion: number;
    idFalta: number;
    idServidorPublico: number;
    idPersona: number;
    idOrigen: number;
    codigoResolucion: string;
    observaciones: string;

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
    
    cantidasDiasTranscurridos: number;
    generaProyecto: boolean;
    descripcionOrigen: string;
    descripcionTipoSancion: string;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    fechaNacimiento: string;
    descripcionUgel: string;
   // centroTrabajo: string;
    abreviaturaRegimenLaboral: string;
    situacionLaboral: string;
    genero: string;
    codigoPlaza: string;
    cargo: string;
    estadoCivil: string;
    idSituacionLaboral: number;
    idRegimenLaboral: number;
   
    documentosSustento: DocumentoSustentoModel[] = [];
    abreviaturaTipoDocumento: string;
    desacripcionMotivoSancion: string;
    descripcionAccion: string;
    dias: number;
    meses: number;
    anios: number
    documentoAdjunto:string;
    fechaFin: Date;
    fechaInicio: Date;
    fechaResolucion: Date;


    descripcionNivelEducativo: string;
    jornadaLaboral: string;

    idNivelEducativo: number;
    idModalidadEducativa: number;
    idCargo : number;
    idCategoriaRemunerativa : number;
    idInstitucionEducativa: number;

    descripcionInstitucionEducativa:string;
    descripcionModalidadEducativa :string;
    descripcionCargo :string;
    descripcionCategoriaRemunerativa:string;

}

export class FaltaModel {
    idFalta: number;
    idServidorPublico: number;
    idPersona: number;
    idTipoFalta: number;
    idDetalleFalta: number;
    idPlazoDescargo: number;
    idEstadoFalta: number;
    idTipoDocumentoSustento: number;
    codigoFalta: number;
    numeroDocumentoSustento: number;
    fechaRegistro: Date;
    fechaAviso: Date;
    codigoAdjuntoSustento: string;
    observaciones: string;
    documentosSustento: DocumentoSustentoModel[] = [];
    usuarioCreacion:string;
    usuarioModificacion:string;
}

export class Sancion {
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
}




export class DocumentoSustentoModel {
    idDocumentoSustento: number = null;
    idLicencia: number = null;
    idTipoDocumentoSustento: number = null;
    idTipoFormatoSustento: number = null;
    idOrigenRegistro: number = null;
    numeroDocumentoSustento: string = null;
    entidadEmisora: string = null;
    fechaEmision: string = null;
    numeroFolios: number = null;
    sumilla: string = null;
    codigoDocumentoSustento: string = null;
    fechaRegistro: string = null;

    descripcionTipoSustento: string;
    descripcionTipoFormato: string;
    codigoOrigenRegistro: number = null;
}

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
    codigoResolucion: string;
    codigoDocumentoResolucion: string;
    //codigoAdjuntoResolucion: string;
    observaciones: string;
    cantidasDiasTranscurridos: number;
    generaProyecto: boolean;
    activo: boolean;
    idPersona:number;

    codigoMotivoAccion: number;
    codigoAccion: number;
    fechaResolucion: string;
    fechaInicio: string;
    fechaFin: string;
    anio:number;
    meses:number;
    dias:number;

    usuarioCreacion:string;
    usuarioModificacion:string;

}
 

export class ResolucionRequestModel
{
    numeroResolucion: string;
    numeroDocumentoIdentidad: string;
    codigoGrupoAccion:number;
    codigoSede: string;
    codigoTipoSede: string;
}
export class ResolucionModel
{
    numeroResolucion: string;
    tipoResolucion: string;
    fechaResolucion: string;
    regimenLaboral: string;
    grupoAccion: string;
    motivoAccion: string;
    codigoMotivoAccion: number;
    codigoResolucion: string;
    fechaInicio: string;
    fechaFin: string;
    anio:number;
    meses:number;
    dias:number;
    observaciones: string;
    codigoDocumentoResolucion: string;
    tipoDocumeentoIdentidad: string;
    abreviaturaRegimenLaboral: string;
    esMandatoJudicial: boolean;
    idEstadoResolucion: number;
    desEstadoResolucion: string;
    descripcionAccion: string;
    codigoAccion:number;
    motivoSancion: string;
    numeroDocumentoIdentidad: string;
    nombre: string;
    primerApellido: string;
    segundoApellido: string;
}