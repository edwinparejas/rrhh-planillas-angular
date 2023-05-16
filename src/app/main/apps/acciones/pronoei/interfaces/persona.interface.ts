
export interface IPersonaResponse {
    numeroDocumentoIdentidad?: string;
    idTipoDocumentoIdentidad?: number;
    primerApellido?: string;
    segundoApellido?: string;
    nombres?: string;
    fechaNacimiento?: Date;
    fechaNacimientoStr?: string;
    sexo?: string;
    codigoGenero?: number;
    id_persona?: number;
    estadoCivil?: string;
    codigoEstadoCivil?: number;
    edad?: number;
    tipoDocumentoIdentidad?: string;
    tiene_pronoei?: boolean;
}