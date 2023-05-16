export class Comment {
    text: string;
    comments?: Comment[];
}

export class SeccionVistaProyecto {
    idSeccionVistaProyecto: number;
    idSeccionVistaProyectoPadre: number;
    idTipoPresentacion: number;
    etiquetaSeccioVistaProyecto: string;
    detalleVistaProyecto?: DetalleVistaProyecto[];
    tituloSecciones: string;
    seccionVistaProyecto?: SeccionVistaProyecto[];
}

export class DetalleVistaProyecto {
    idDetalleVistaProyecto: number;
    etiquetaCampo: string;
    valorCampoFormateado: string;
}

export class ValorProyectoResolucion {
    codigo_seccion: number;
    nombre_campo: string;
    valor_campo: any;
}

export class GenerarProyectoResolucion {
    idTipoResolucion: number;
    codigoFormatoResolucion: number;
    codigoSistema: number;
    usuarioCreacion: string;
    acciones: any;
    codigoPlaza: string;
}

export interface GenerarProyectoResolucionRabbit {
    codigoTipoResolucion: number;
    codigoSistema: number;
    codigoRegimenLaboral: number;
    codigoGrupoAccion: number;
    codigoAccion: number;
    codigoMotivoAccion: number;
    codigoDre: string;
    codigoUgel: string;
    usuarioCreacion: string;
    acciones: AccionGenerarProyectoResolucionRabbit[];
    documentosSustento: DocumentoSustentoRabbit[];
}

export interface DocumentoSustentoRabbit {
    codigoTipoDocumentoSustento: number;
    codigoTipoFormatoSustento: number;
    numeroDocumentoSustento: string;
    entidadEmisora: string;
    fechaEmision: Date;
    numeroFolios: number;
    sumilla: string;
    codigoDocumentoSustento: string;
}

export interface AccionGenerarProyectoResolucionRabbit {
    codigoPlaza?: string;

    codigoCentroTrabajo?: string;
    codigoAnexoCentroTrabajo?: string;

    codigoServidorPublico?: number;

    codigoTipoDocumentoIdentidad?: number;
    numeroDocumentoIdentidad?: string;

    codigoTipoDocumentoEmpresa?: number;
    numeroRuc?: string;

    codigoRegimenLaboral: number;
    codigoGrupoAccion: number;
    codigoAccion: number;
    codigoMotivoAccion: number;
    codigoAccionGrabada: number;
    esLista: boolean;
    esMandatoJudicial?: boolean;
    detalleAccion: string;
}

export enum EstadoProyectoResolucionEnum {
    CON_RESOLUCION = 131,
    EN_PROYECTO = 130,
    ELIMINADO = 132,
}

export enum TablaTipoOperacion {
    REGISTRAR = 1,
    APROBAR = 2,
    ANULAR = 3,
    RATIFICAR = 4,
    REUBICAR = 5,
    ADECUAR = 6,
}

export interface CentroTrabajoModel {
    centroTrabajo: string;
    codigoCentroTrabajo: string;
    anexoCentroTrabajo: string;
    idCentroTrabajo: number;
    idNivelEducativo?: number;
    idNivelInstancia?: number;
    idTipoCentroTrabajo?: number;
    idUnidadEjecutora?: number;
    unidadEjecutora?: string;
    instancia?: string;
    modalidadEducativa?: string;
    nivelEducativo?: string;
    subinstancia?: string;
    tieneEstructuraOrganica?: boolean;
    tipoCentroTrabajo: string;
}
export enum TablaNivelInstancia {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3,
}

export enum TablaCatalogoNivelInstancia {
    MINEDU = 1,
    DRE = 2,
    UGEL = 3,
}

export enum TablaTipoCentroTrabajo {
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

export enum TablaUsuarioRol {
    ResponsablePersonal = 1,
    EspecialistaDITEN = 2,
    EspecialistaUPP = 3,
    EspecialistaAIRHSP = 4,
    ResponsablePresupuesto = 5,
}

export const TablaEquivalenciaSede = {
    CODIGO_TIPO_SEDE: "TS005",
    CODIGO_SEDE: "000000",
};

export enum TablaGrupoAccion {
    PLAZA = 1,
}

export enum TablaGrupoAccionCodigo{
    VINCULACION = 12,
    DESVINCULACION = 12,
    COMITE = 14,
    CRONOGRAMA = 15,
    PRONOEI = 20,
    DESPLAZAMIENTO = 5
}