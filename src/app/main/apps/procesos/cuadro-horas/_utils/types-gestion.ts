export enum CodigoCatalogo {
    TipoDocumentoIdentidad = 6,
    EstadosComite = 99,
    EstadosCronograma = 116,
    TipoVigenca = 130
}
export enum CodigoTipoCronograma {
    Nacional = 1,
    Regional = 2,
    Local = 3
}
export enum CodigoTipoVigencia {
    diasHabiles = 1,
    diasHabilesIncluyendoSabado = 2,
    diasCalendario = 3
}
export enum TipoCronograma {
    Nacional = "Nacional",
    Regional = "Regional",
    Local = "Local",
}
export enum CodigoNumeroConvocatoria {
    Unica = 1,
    Primera = 2,
    Segunda = 3,
    Tercera = 4
}
export enum DescripcionNumeroConvocatoria {
    Unica = "ÚNICA",
    Primera = "PRIMERA",
    Segunda = "SEGUNDA",
    Tercera = "TERCERA"
}
export enum CodigoGrupoAccion {
    Comite = 14,
    Cronograma = 15
}
export enum CodigoAccion {
    ConformacionComite = 56,
    AprobacionCronograma = 57
}