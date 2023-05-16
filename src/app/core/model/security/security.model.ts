export class SecurityModel {

    idRol: number;
    idSede: number;
    idTipoSede: number;

    anexoSede: string;

    codigoRol: string;
    codigoSede: string;
    codigoTipoSede: string;
    codigoLocalSede: string;
    codigoPadreSede: string;

    descripcionTipoSede: string;
    nombreRol: string;
    nombreSede: string;

    numeroDocumento: string;
    tipoNumeroDocumento: string;
    nombreCompleto: string;
    correoElectronico: string;
    fechaNacimiento: string;
    nombreUsuario: string;
    constructor() {
    }
}
export class SessionDataModel{
    FECHA_CADUCIDAD: string;
    FECHA_CREACION: string;
    FECHA_ULTIMA_SESION: string;

    constructor() {
    }
}