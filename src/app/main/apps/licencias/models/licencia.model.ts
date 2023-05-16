export class LicenciaModel {
    idLicencia: number = null;
    idPersona: number = null;
    idServidorPublico: number = null;
    idRegimenLaboral: number = null;
    idGrupoAccion: number = null;
    idAccion: number = null;
    idMotivoAccion: number = null;
    idEstadoLicencia: number = null;
    idDocumentoSustento: number = null;
    idTipoResolucion: number = null;
    idCentroTrabajo: number = null;
    fechaInicio: string = null;
    fechaFin: string = null;
    cantidadDias: number = null;
    codigoResolucion: string = null;
    codigoDocumentoResolucion: string = null;
    codigoAccionPersonalGrabada: number = null;
    generaProyecto: boolean = null;
    generaAccionGrabada: boolean = null;
    anotaciones: string = null;

    descripcionGrupoAccion: string = null;
    descripcionAccion: string = null;
    descripcionMotivoAccion: string = null;
    descripcionTipoResolucion: string = null;
    codigoMotivoAccion: number = null;

    licenciaBienestarSocial: LicenciaBienestarModel = null;
    detalleCertificado: DetalleCertificadoModel = null;
    documentosSustento: DocumentoSustentoModel[] = [];
    licenciaPaternidad: LicenciaPaternidadModel = null;
    licenciaAdopcion: LicenciaAdopcionModel = null;
    licenciaFallecimiento: LicenciaFallecimientoModel = null;
    otraLicencia: OtraLicenciaModel = null;
    usuarioRegistro: string = null;
    nombreUsuarioRegistro: string = null;
    codigoSedeRegistro: string = null;
    codigoRolRegistro: string = null;
}

export class LicenciaBienestarModel {
    idLicenciaBienestarSocial: number = null;
    idLicencia: number = null;
    idTipoDescanso: number = null;
    diasCargoMinedu: number = null;
    diasCargoEssalud: number = null;
    diasAcumuladosAnual: number = null;
    numeroCertificado: string = null;
    fechaProbableParto: string = null;
    descripcionTipoDescanso: string = null;
}

export class DetalleCertificadoModel {
    idDetalleCertificado: number = null;
    idLicencia: number = null;
    idEntidadAtencion: number = null;
    idTipoCertificado: number = null;
    numeroCertificado: string = null;
    nombreDoctor: string = null;
    numeroCmp: string = null;
    fechaEmision: string = null;
    codigoDocumentoCertificado: string = null;
    diagnostico: string = null;
    nombreEntidadAtencion: string = null;
    descripcionTipoCertificado: string = null;
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
    vistoProyecto: boolean = null;

    descripcionTipoSustento: string;
    descripcionTipoFormato: string;
    codigoOrigenRegistro: number = null;
    descripcionVistoProyecto: string = null;
}

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
    cargo: string;
    estadoCivil: string;
    idSituacionLaboral: number;
    idRegimenLaboral: number;
    idCentroTrabajo: number;
    codigoCentroTrabajo: string;
    idDre: number;
    idUgel: number;
    codigoSituacionLaboral: number;
    codigoGenero: number;
    codigoRegimenLaboral: number;
    idCargo: number;
    idCondicionLaboral: number;
    fechaInicio: Date;
    descripcionCargo: string;
    descripcionCondicionLaboral: string;
}

export class LicenciaPaternidadModel {
    idLicenciaPaternidad: number = null;
    idLicencia: number = null;
    idTipoParto: number = null;
    descripcionTipoParto: string = null;
}

export class LicenciaAdopcionModel {
    idLicenciaAdopcion: number;
    idLicencia: number;
    idPersona: number;
    idFamiliarServidorPublico: number;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    numeroDocumentoIdentidadCompleto: string = null;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    fechaNacimiento: string;
    edad: number;
    descripcionParentesco: string = null;
}

export class LicenciaFallecimientoModel {
    idLicenciaFallecimiento: number;
    idLicencia: number;
    idPersona: number;
    idFamiliarServidorPublico: number;
    idLugarDeceso: number;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    numeroDocumentoIdentidadCompleto: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    fechaNacimiento: string;
    edad: number;
    descripcionLugarDesceso: string;
    descripcionParentesco: string;
}

export class OtraLicenciaModel {
    idOtraLicencia: number;
    idLicencia: number;
    idPersona: number;
    idFamiliarServidorPublico: number;
    idTipoDocumentoIdentidad: number;
    numeroDocumentoIdentidad: string;
    idTipoDiagnostico: number;
    diasAcumulados: number;
    descripcionTipoDiagnostico: string;
    primerApellido: string;
    segundoApellido: string;
    nombres: string;
    fechaNacimiento: string;
    edad: number;
}

export class FamiliarServidorPublico {
    idFamiliarServidorPublico: number = null;
    idPersona: number = null;
    nombreCompleto: string = null;
    primerApellido: string = null;
    segundoApellido: string = null;
    nombres: string = null;
    idTipoDocumentoIdentidad: number = null;
    numeroDocumentoIdentidad: string = null;
    numeroDocumentoIdentidadCompleto: string = null;
    fechaNacimiento: string = null;
    edad: number = null;
    descripcionParentesco: string = null;
}

export class ComboItem {
    constructor(value: number, label: string) {
        this.value = value;
        this.label = label;
    }
    value: number;
    label: string;
}

export class OpcionFiltro {
    item = new ComboItem(-1, '--TODOS--')
}