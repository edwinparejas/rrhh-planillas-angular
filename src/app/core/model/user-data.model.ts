export class UserDataModel {
    NOMBRES_USUARIO: string;
    APELLIDO_PATERNO: string;
    APELLIDO_MATERNO: string;
    ID_TIPO_DOCUMENTO_ENUM: string;
    TIPO_DOCUMENTO_ENUM: string;
    NUMERO_DOCUMENTO: string;
    FECHA_NACIMIENTO: string;
    CORREO_USUARIO: string;

    constructor() {}
}

export class User {
    public idNivelInstancia?: string;
    public codigoNivelInstancia?: string;
    public idEntidadSede?: string;
    public idOtraInstancia?: string;
    public idDre?: string;
    public idUgel?: string;
    public idRolPassport?: string;
    public codigoRolPassport?: string;
    public descripcionRolPassport?: string;  

    constructor() {}
}

export class Session {
    public token: string;
    public user: User;
}
