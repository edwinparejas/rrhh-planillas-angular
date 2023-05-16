export class DatosDocumentoSustento {
    idReporte: number = null;
    idAtencionReporte: number = null;
    numeroRegistro: number = null;
    idTipoDocumentoSustento: number = -1;
    idTipoFormatoSustento: number = -1;
    tipoDocumentoSustento: string = null;
    tipoFormatoSustento: string = null;
    numeroDocumentoSustento: string = null;
    entidadEmisora: string = null;
    fechaEmision: Date = null;
    numeroFolios: string = null;
    sumilla: string = null;
    fechaRegistro: Date = null;
    plazoDescargo: any = null;
    eliminado: any = false;
}
export class DatosPersonales {
    idPersona: number;
    tipoDocumentoIdentidad: string;
    numeroDocumentoIdentidad: string;
    nombresCompletos: string;
    estadoCivil: string;
    genero: string;
    fechaNacimiento: Date;
}
export class DatosLaborales {
    idServidorPublico: number;
    codigoServidorPublico: string;  
    idPlaza: number;
    itemPlaza: number;
    codigoPlaza: string;
    vigenciaInicio: Date;
    vigenciaFin: Date;
    idRegimenLaboral: number;
    descripcionRegimenLaboral: string;
    idTipoCargo: number;
    idEstadoPlaza: number;
    idCargo: number;
    descripcionCargo: string;
    idCategoriaRemunerativa: number;
    descripcionCategoriaRemunerativa: string;
    codigoModular: string;
    institucionEducativa: string;
    idNivelEducativo: number;
    descripcionNivelEducativo: string;
    idModalidadEducativa: number;
    abreviaturaModalidadEducativa: string;
    descripcionModalidadEducativa: string;
    idUgel: number;
    descripcionUgel: string;
    idDre: number;
    descripcionDre: string;
    idTipoPlaza: number;
    descripcionTipoPlaza: string;
    idJornadaLaboral: number;
    descripcionJornadaLaboral: string;
    idCentroTrabajo: number;
    descripcionTipoCentroTrabajo: string;
    idCondicionLaboral: number;
    codigoCondicionLaboral: string;
    descripcionCondicionLaboral: string;
    idSituacionLaboral: number;
    codigoSituacionLaboral: string;
    descripcionSituacionLaboral: string;
    idAreaDesempenioLaboral: number;
}
export class DatosAtencionReporte{
    idPersona: number;
    fechaRegistroAtencion: Date;
}
export class PlazaDetalleAtencion{
    idPlazaDetalleAtencion: number;
    idAtencionReporte: number;
    codigoPlaza: string;
    itemPlaza: number;
    vigenciaInicioPlaza: Date;
    vigenciaFinPlaza: Date;
    idRegimenLaboral: number;
    idCentroTrabajo: number;
    idCondicionLaboral: number;
    idJornadaLaboral: number;
    idCategoriaRemunerativa: number;
    idTipoCargo: number;
    idCargo: number;
    idTipoPlaza: number;
    idAreaDesempenioLaboral: number;
    idEstadoPlaza: number;
    constructor(idPlazaDetalleAtencion:  number, idAtencionReporte:  number, codigoPlaza:  string, itemPlaza:  number, vigenciaInicioPlaza
        , vigenciaFinPlaza, idRegimenLaboral:  number, idCentroTrabajo:  number, idCondicionLaboral:  number, idJornadaLaboral:  number
        , idCategoriaRemunerativa: number, idTipoCargo:  number, idCargo:  number, idTipoPlaza:  number
        , idEstadoPlaza: number, idAreaDesempenioLaboral: number){
            this.idPlazaDetalleAtencion = idPlazaDetalleAtencion;
            this.idAtencionReporte = idAtencionReporte;
            this.codigoPlaza = codigoPlaza;
            this.itemPlaza = itemPlaza;
            this.vigenciaInicioPlaza = vigenciaInicioPlaza;
            this.vigenciaFinPlaza = vigenciaFinPlaza;
            this.idRegimenLaboral = idRegimenLaboral;
            this.idCentroTrabajo = idCentroTrabajo;
            this.idCondicionLaboral = idCondicionLaboral;
            this.idJornadaLaboral = idJornadaLaboral;
            this.idCategoriaRemunerativa = idCategoriaRemunerativa;
            this.idTipoCargo = idTipoCargo;
            this.idCargo = idCargo;
            this.idTipoPlaza = idTipoPlaza;
            this.idEstadoPlaza = idEstadoPlaza;
            this.idAreaDesempenioLaboral = idAreaDesempenioLaboral;
    }
}
export class ServidorPublicoDetalleAtencion{
    idServidorPublicoDetalleAtencion: number;
    idAtencionReporte: number;
    idServidorPublico: number;
    idPersona: number;
    idRegimenLaboral: number;
    idSituacionLaboral: number;
    idCondicionLaboral: number;
    idCargo: number;
    idJornadaLaboral: number;
    idCategoriaRemunerativa: number;
    idCentroTrabajo: number;
    codigoServidorPublico: string;
    codigoPlaza: string;
    itemPlaza: number;

    constructor( idServidorPublicoDetalleAtencion: number, idAtencionReporte: number, idServidorPublico: number, idPersona: number
        , idRegimenLaboral: number, idSituacionLaboral: number, idCondicionLaboral: number, idCargo: number, idJornadaLaboral: number
        ,idCategoriaRemunerativa: number, idCentroTrabajo: number, codigoServidorPublico: string,
        codigoPlaza: string, itemPlaza: number){
            this.idServidorPublicoDetalleAtencion = idServidorPublicoDetalleAtencion;
            this.idAtencionReporte = idAtencionReporte;
            this.idServidorPublico = idServidorPublico;
            this.idPersona = idPersona;
            this.idRegimenLaboral = idRegimenLaboral;
            this.idSituacionLaboral = idSituacionLaboral;
            this.idCondicionLaboral = idCondicionLaboral;
            this.idCargo = idCargo;
            this.idJornadaLaboral = idJornadaLaboral;
            this.idCategoriaRemunerativa = idCategoriaRemunerativa;
            this.idCentroTrabajo = idCentroTrabajo;
            this.codigoServidorPublico = codigoServidorPublico;
            this.codigoPlaza = codigoPlaza;
            this.itemPlaza = itemPlaza;
    }
}
export class AtencionReporte{
    idTipoDocumentoIdentidad: number;
    tipoDocumentoIdentidad: string;
    numeroDocumentoIdentidad: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    idEstadoCivil: number;
    estadoCivil: string;
    idMotivoAccion: number;
    codigoMotivoAccion:number;
    idGenero: number;
    genero: string;
    fechaNacimiento: Date;
    codigoPlaza: string;
    descripcionDre: string;
    descripcionUgel: string;
    institucionEducativa: string;
    abreviaturaModalidadEducativa: string;
    descripcionNivelEducativo: string;
    descripcionRegimenLaboral: string;
    descripcionCargo: string;
    descripcionJornadaLaboral: string;
    descripcionCategoriaRemunerativa: string;
    idEstadoReporte: number;
    estadoReporte: string;
    observaciones: string;
    documentoSustento: DocumentoSustentoAbandono[];
}
export class DocumentoSustentoAbandono{
    codigoDocumentoSustento: string;
    entidadEmisora: string;
    fechaEmision: Date;
    fechaRegistro: Date;
    idAtencionReporte: number;
    idDocumentoSustento: number;
    idReporte: number;
    idTipoDocumentoSustento: number;
    tipoDocumentoSustento: string;
    numeroDocumentoSustento: string;
    idTipoFormatoSustento: number;
    tipoFormatoSustento: string;    
    numeroFolios: string;
    sumilla: string;
    vistoProyecto: boolean;
    eliminado: boolean;
}