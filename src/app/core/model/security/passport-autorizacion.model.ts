export class PassportAutorizacionModel {
    Data: Array<DataModel>;
    HasErrors: boolean;
    Messages: Array<any>
}

export class DataModel {
    ESTA_AUTORIZADO: boolean;
    ID_USUARIO: number;
}