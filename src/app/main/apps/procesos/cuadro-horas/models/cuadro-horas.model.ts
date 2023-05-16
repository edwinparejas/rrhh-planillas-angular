export class CentroTrabajoResponseModel {
    CODIGO_MODULAR: string;
    INSTITUCION_EDUCATIVA: string;
    ID_DRE: number;
    DESCRIPCION_DRE: string;
    ID_UGEL: number;
    DESCRIPCION_UGEL: string;
    ID_INSTITUCION_EDUCATIVA: number;
    DESCRIPCION_TIPO_CENTRO_TRABAJO: string;
    DESCRIPCION_MODALIDAD_EDUCATIVA: string;
    ID_MODALIDAD_EDUCATIVA: number;
    ID_NIVEL_EDUCATIVO: number;
    DESCRIPCION_NIVEL_EDUCATIVO: string;
    ANOFISCAL: number;
    MODELO_SERVICIO: string;
    ID_CENTRO_TRABAJO: number;
    ID_MODELO_SERVICIO_EDUCATIVO: number;
    ID_FORMA_ATENCION: number;
    
}
export class ParametroInicialRequestModel {
        id: string;
        anio: number;
        codigoModular: string;
        totalHoraAsignadaUnidadEjecutora: number;
        totalHoraAsignadaIIEE: number;
        totalSadoHoraAsignadaIIEE: number;
        idProceso: number;
        idEtapa: number;
        idCentroTrabajo: number;
        idModalidadEducativa: number;
        idNivelEducativo: number;
        idModeloServicioEducativo: number;
        idUnidadEjecutora: number;
        idBolsaHorasPedagogicas: number;
        idEstadoCuadroHoras: number;
        idPlanEstudio: number;
        activo: boolean;
        fechaCreacion: Date;
        usuarioCreacion: string;
        ipCreacion: string;
        fechaModificacion: Date;
        usuarioModificacion: string;
        ipModificacion: string;
}
export class ProcesoEtapaCabResponseModel {
    idEtapa: number;
    idProceso: number;
    anio: number;
    idEtapaFase: number;
    codigoProceso: string;
    codigoEtapa: string;
    descripcionEtapa: string;
    descripcionRegimenLaboral: string;
    abreviaturaRegimenLaboral: string;
    descripcionEtapaFase: string;
    descripcionNumeroConvocatoria: string;
    descripcionTipoProceso: string;
    descripcionProceso: string;
    fechaRegistro: string;
}

export const CUADRO_HORA_MESSAGE = {
    EXCEPTION_ERROR:"Error, no se pudo acceder al servicio. Si persiste el error, comuníquese con el administrador del sistema.",
    NO_FOUND_DATA_SEARCH_IIEE: 'No se encontró el código modular.',
    CODIGO_MODULAR_HORAS_REQUIRED: 'Código modular y  horas asignada son datos obligatorios.',
    CODIGO_MODULAR_REQUIRED: 'Ingrese código modular para realizar la busqueda.',
    NO_FOUND_DATA_ANIO: 'No se encontró datos de años.',
    NO_FOUND_DATA_INSTANCIA: 'No se encontró datos de instancia.',
    NO_FOUND_DATA_SUBINSTANCIA: 'No se encontró datos de subinstancia.',
    LIMIT_EXCEEDED_BOLSA: 'No se puede exceder el saldo pendiente por asignar en la bolsa de horas.',
    LIMIT_ZERO_BOLSA: 'La Ugel no tiene bolsa de horas para asignar.',
    LIMIT_MAYOR_ZERO: 'El número de horas para asignar debe ser mayor a 0.'

}

export class BolsaRequestModel {
    idBolsaHoraInsitucionEducativa:number;
    idBolsaHoras:number;
    idRegion :number;
    idInstitucionEducativa :number;
    idUnidadEjecutora:number;
    idSubUnidadEjecutora:number;
    anio:number;
    numeroHorasAsignadas:number;
    numeroHorasUtilizadas:number;
    idEstado:number;
    activo:boolean;
    fechaCreacion: Date;
    usuarioCreacion:string;
    ipCreacion: string;
    fechaModificacion: Date;
    usuarioModificacion: string;
    ipModificacion:string;
    codigoModular: string;
    idUgel:number;
}

export class MetasRequestModel {
    idMetas:number;
    idRegion :number;
    idInstitucionEducativa :number;
    idUnidadEjecutora:number;
    idSubUnidadEjecutora:number;
    anio:number;
    totalDocentes:number;
    totalAlumnos:number;
    totalSeccion:number;
    totalGrados:number;
    totalHoras:number;
    totalBolsaHoras:number;

    totalAlumnoGrado1:number;
    totalAlumnoGrado2:number;
    totalAlumnoGrado3:number;
    totalAlumnoGrado4:number;
    totalAlumnoGrado5:number;

    totalSeccionGrado1:number;
    totalSeccionGrado2:number;
    totalSeccionGrado3:number;
    totalSeccionGrado4:number;
    totalSeccionGrado5:number;

    idEstado:number;
    activo:boolean;
    fechaCreacion: Date;
    usuarioCreacion:string;
    ipCreacion: string;
    fechaModificacion: Date;
    usuarioModificacion: string;
    ipModificacion:string;
    //codigoModular: string;
    idUgel:number;
}


export enum NivelInstanciaCodigoEnum {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3,
}
export enum TipoCentroTrabajoCodigoEnum {
    Minedu = 1,
    SedeAdministrativaDRE = 2,
    InstitucionEducativaDRE = 3,
    InstitutoSuperiorDRE = 4,
    SedeAdministrativaUGEL = 5,
    InstitucionEducativaUgel = 6,
    InstitutoSuperiorUgel = 7,
    SedeCentroLaboralDre = 8,
    SedeCentroLaboralUgel = 9,
}

export class EtapaResponseModel {
    idEtapa: number;
    idProceso: number;
    anio: number;
    idEtapaFase?: number;
    codigoProceso: string;
    descripcionEtapa: string;
    descripcionRegimenLaboral: string;
    descripcionEtapaFase: string;
    descripcionNumeroConvocatoria: string;
    descripcionTipoProceso: string;
    fechaCreacion: string;
    descripcionNivelEducativo?: string;
    descripcionCargosConvocados?: string;
    idRegimenLaboral?: number;
    idNivelEducativo?: number;
    codigoRegimenLaboral?: number;
    codigoEtapaFase: number;
    codigoEtapa: string;
    descripcioncargosconvocados?: string;
    descripcionEstadoEtapaProceso: string;

    // adicionales
    accesoPublicacionPlaza?: boolean;
    accesoValidarPlazas?: boolean;
    accesoAprobarPlazas?: boolean;
    accesoRechazarPlazas?: boolean;
    accesoPublicarPlazas?: boolean;
    accesoPostulantes?: boolean;
    accesoCargaMasivaPostulantes?: boolean;
    accesoEliminarCargaPostulantes?: boolean;
    accesoCalificacion?: boolean;
    accesoPublicarCalificacion?: boolean;
    accesoCargaMasivaCalificacion?: boolean;
    accesoEliminarCargaCalificacion?: boolean;
    accesoCalificacionAutomatica?: boolean;
    accesoAdjudicacion?: boolean;
    accesoPublicarAdjudicados?: boolean;
    accesoCargaMasivaAdjudicacion?: boolean;
    accesoEliminarCargaAdjudicacion?: boolean;
    accesoConsolidado?: boolean;
    accesoAprobarPlazaConsolidado?: boolean;
    accesoPlazaPrepublicada?: boolean;
    accesoPlazaResultadoFinal?: boolean;
    accesoRegistrarCalificacion?: boolean;
    accesoRegistrarReclamoCalificacion?: boolean;
    accesoFinalizarEtapa?: boolean;
    accesoAdjudicarPlaza?: boolean;
    accesoNoAdjudicarPlaza?: boolean;
}