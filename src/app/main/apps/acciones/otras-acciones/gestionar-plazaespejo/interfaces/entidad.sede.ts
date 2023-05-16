export interface IEntidadSedeResponse {
    idEntidadSede?: number;
    idOtraInstancia?: number;
    idDre?: number;
    idUgel?: number;
    codigoDre?: string;
    codigoUgel?: string;
    codigoTipoSede?: string;
    descripcionDre?: string;
    descripcionUgel?: string;
}

export interface IPassportResponse {
    ID_ROL?: number;
    ID_SEDE?: number;
    ANEXO_SEDE?:string;
    CODIGO_LOCAL_SEDE?:string;
    CODIGO_PADRE_SEDE?:string;
    CODIGO_ROL?:string;
    CODIGO_SEDE?:string;
    CODIGO_TIPO_SEDE?:string;
    DESCRIPCION_TIPO_SEDE?:string;
    NOMBRE_ROL?: string;   
    NOMBRE_SEDE?: string;
    ID_TIPO_SEDE?: number;
    POR_DEFECTO?: string;
    
}