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

export class VerInformacionResponseModel {
    idTipoDocumentoIdentidad: number;
    documentoIdentidad: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    fechaIngreso: Date;
    idGenero: number;
    sexo: string;
    fechaCese: Date;   
    codigoPlaza: string;
    idRegimenLaboral: number;
    idCondicionLaboral: number;
    idSituacionLaboral: number;
    jornadaLaboral: string;
    cargo: string;
    
    descripcionRegimenLaboral: string;
    descripcionCondicionLaboral: string;
    descripcionSituacionLaboral: string;
}



