export class criterioBusqueda {
  public static validarCodigoTrabajo(codigoTrabajo:string):validacionRespuesta {
       let cantidad = codigoTrabajo.length;
       if(cantidad == 6 || cantidad == 7)return new validacionRespuesta(true,'');
       return new validacionRespuesta(false,'"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN CÓDIGO CON SEIS (6) Ó SIETE (7) DÍGITOS."');
   }
 
  public static validarCodigoPlaza(codigoPlaza:string):validacionRespuesta {
       let cantidad = codigoPlaza.length;
       if(cantidad == 12) return new validacionRespuesta(true,'');
       return new validacionRespuesta(false,'"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE PLAZA CON DOCE (12) DÍGITOS."');
   }

   public static validarNumeroDocumento(tipoDocumento:number, documento:string):validacionRespuesta {
      if(tipoDocumento == 1){
        let cantidad = documento.length;
        if(cantidad == 8) return new validacionRespuesta(true,'');
        return new validacionRespuesta(false,MESSAGE_GESTION.M34);
      } 

      if(tipoDocumento == 5) {
        debugger;
        let cantidad = documento.length;
        if(cantidad >= 6 && cantidad <= 12) return new validacionRespuesta(true,'');
        return new validacionRespuesta(false,MESSAGE_GESTION.M116a);
      }

      return new validacionRespuesta(true,'');

    }

 }

 class validacionRespuesta{
  esValido:boolean;
  mensaje:string;
  constructor(esValido:boolean, mensaje:string) {
  this.esValido = esValido;
  this.mensaje = mensaje;
  }
}

export enum TipoFormatoPlazaEnum {
  GENERAL = 1,
  CONVOCADAS = 2
}

export class AccionesPersonalVinculacion {
    id_gestion_vinculacion: number;
  }
  
  // Rol monitor
export class InstanciaModel {
  idDre?: number;
  idUgel?: number;
  codigoInstancia?: string;
  descripcionInstancia?: string;
  codigoTipoSede?: string;
}

export enum NivelInstanciaCodigoEnum {
  MINEDU = 1,
  DRE = 2,
  UGEL = 3,
}

export enum TablaEstadoDesvinculacion {
  REGISTRADO = 1,
  ELIMINADO = 2,
  PENDIENTE_PROYECTO = 3,
  CON_PROYECTO = 4,
  CON_RESOLUCION = 5,
  OBSERVADO = 6,
  PENDIENTE_AUTORIZACION = 7,
  AUTORIZADO = 8,
  NO_AUTORIZADO = 9
}

export enum TablaEquivalenciaSede {
  CODIGO_TIPO_SEDE_OFICINA = "TS005",
  CODIGO_TIPO_SEDE_DRE = "TS001",
  CODIGO_TIPO_SEDE_UGEL = "TS002",
  CODIGO_TIPO_SEDE_SIN_SEDE = "TS013",
  CODIGO_TIPO_SEDE = "TS005",
  CODIGO_SEDE = "000000"
}

export interface CentroTrabajoModel {
  idCentroTrabajo: number;
  idTipoCentroTrabajo?: number;
  idNivelInstancia?: number;
  idOtraInstancia?: number;
  idDre?: number;
  idUgel?: number;
  codigoCentroTrabajo: string;
  idInstitucionEducativa?:number;
}

export enum TablaUsuarioRol {
  ResponsablePersonal = 1,
  EspecialistaDITEN = 2,
  EspecialistaUPP = 3,    
  EspecialistaAIRHSP = 4,
  ResponsablePresupuesto = 5
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

export enum TipoDocumentoIdentidadEnum {
  DNI = 1,
  CARNET_EXTRANJERIA = 5,
  PASAPORTE = 3
}

export  const MESSAGE_GESTION = {
  M01: '"DEBE INGRESAR POR LO MENOS UN CRITERIO DE BÚSQUEDA"',
  M02: '¿ESTÁ SEGURO QUE DESEA GUARDAR LA INFORMACIÓN?',
  M03: '¿ESTÁ SEGURO QUE DESEA GUARDAR LOS CAMBIOS?',
  M05: '¿ESTÁ SEGURO QUE DESEA ELIMINAR LA INFORMACIÓN?',
  M07: '"OPERACIÓN REALIZADA DE FORMA EXITOSA"',
  M08: '"COMPLETAR LOS DATOS REQUERIDOS"',
  M09: '"NO SE ENCONTRÓ INFORMACIÓN PARA LOS CRITERIOS DE BÚSQUEDA INGRESADOS"',
  M10: '¿ESTÁ SEGURO QUE DESEA PUBLICAR EL CRONOGRAMA PARA LAS ETAPAS SELECCIONADAS?',
  M11: '¿ESTÁ SEGURO QUE DESEA MODIFICAR EL CRONOGRAMA PARA LAS ETAPAS SELECCIONADAS?',
  M29: '¿ESTÁ SEGURO QUE DESEA GENERAR EL PROYECTO DE RESOLUCIÓN?',
  M31: '"EL DNI INGRESADO NO SE ENCUENTRA REGISTRADO EN RENIEC"',
  M34: '"NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON OCHO (8) DÍGITOS"',
  M38: '"CÓDIGO MODULAR NO VÁLIDO, DEBE INGRESAR UN NÚMERO CON SEIS (06) O SIETE (7) DÍGITOS"',
  M47: 'SERVIDOR PÚBLICO NO ENCONTRADO',
  M43: '"DEBE INGRESAR LA INFORMACIÓN PARA REALIZAR LA BÚSQUEDA"',
  M63: '"FECHA NO VÁLIDA, FECHA DEBE SER MAYOR O IGUAL A LA FECHA ACTUAL"',
  M64: '"CÓDIGO NO VÁLIDO, DEBE INGRESAR UN CÓDIGO DE PLAZA CON DOCE (12) DÍGITOS"',
  M66: 'FECHA NO VÁLIDA, VUELVA A INGRESAR',
  M88: '"FECHA NO VÁLIDA, DEBE INGRESAR UNA FECHA MAYOR A LA FECHA DE INICIO"',
  M91: '"DEBE SELECCIONAR COMO MÍNIMO UN REGISTRO DE LA GRILLA"',
  M99: '"NÚMERO DE DOCUMENTO YA EXISTE EN LA GRILLA, SELECCIONAR OTRO"',
  M103: '¿ESTÁ SEGURO QUE DESEA APROBAR LOS MIEMBROS DEL COMITÉ?',
  M116: '"NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR DOCE (12) DÍGITOS"',
  M116a: '"NÚMERO DE DOCUMENTO NO VÁLIDO, DEBE INGRESAR UN NÚMERO ENTRE SEIS (06) A DOCE (12) DÍGITOS"',
  M124: '"DEBE REGISTRAR COMO MÍNIMO UN DOCUMENTO DE SUSTENTO QUE SE MUESTRE EN EL VISTO DEL PROYECTO"',
  M125: '"EL NÚMERO DE DOCUMENTO INGRESADO NO SE ENCUENTRA REGISTRADO EN MIGRACIONES"',
  M127: '"DEBE SELECCIONAR COMO MÍNIMO UN CENTRO DE TRABAJO EN EL ALCANCE DEL PROCESO"',
  M128: '¿ESTÁ SEGURO QUE DESEA INACTIVAR LA ETAPA?',
  M129: '¿ESTÁ SEGURO QUE DESEA RESTAURAR ETAPA?',
  M132: '¿ESTÁ SEGURO QUE DESEA CULMINAR EL CRONOGRAMA PARA LAS ETAPAS SELECCIONADAS?',
  M133: '"UNO O MÁS ACTIVIDADES NO CUENTAN CON VIGENCIA REGISTRADA"',
  M136: '"DEBE REGISTRAR COMO MÍNIMO TRES (03) MIEMBROS TITULARES PARA APROBAR EL COMITÉ"',
  M162: '"AGREGUE AL MENOS UN TIPO DE PLAZA PARA CONTINUAR CON LA CREACIÓN DEL PROCESO"',
  M163: '"AGREGUE AL MENOS UNA CONDICIÓN DE PLAZA PARA CONTINUAR CON LA CREACIÓN DEL PROCESO"',
  M164: '"AGREGUE AL MENOS UNA MODALIDAD / NIVEL EDUCATIVO PARA CONTINUAR CON LA CREACIÓN DEL PROCESO"',
  M165: '"AGREGUE AL MENOS UN TIPO DE GESTIÓN / DEPENDENCIA PARA CONTINUAR CON LA CREACIÓN DEL PROCESO"',
  M166: '"AGREGUE AL MENOS UN TIPO DE CARGO / CARGO PARA CONTINUAR CON LA CREACIÓN DEL PROCESO"',
  M185: '"NO SE PUEDE [accionCronograma] EL CRONOGRAMA [tipoCronograma], YA QUE FALTAN REGISTRAR LAS VIGENCIAS DE LAS ACTIVIDADES DE ALGUNA ETAPA"',
  M195: '"EL NÚMERO DE PASAPORTE INGRESADO NO SE ENCUENTRA REGISTRADO EN EL SISTEMA"',
  M198: '"EL MOTIVO DE ACCIÓN SELECCIONADO NO SE REALIZA POR MANDATO JUDICIAL, SELECCIONAR OTRO MOTIVO DE ACCIÓN"',
  M200: '"NO SE PUEDE REGISTRAR LA VINCULACION DE LA PERSONA, YA QUE SUPERA LA EDAD LÍMITE"',
  M201: '"LA PLAZA SELECCIONADA PERTENECE A OTRA DRE O UGEL"',
  M202: '"LA PLAZA SELECCIONADA DEBE SER DEL TIPO CENTRO DE TRABAJO INSTITUCIÓN EDUCATIVA UGEL O INSTITUCIÓN EDUCATIVA DRE"',
  M203: '"LA PLAZA SELECCIONADA NO SE ENCUENTRA EN ESTADO APROBADO"',
  M204: '"LA PLAZA SELECCIONADA SE ENCUENTRA ASIGNADA EN OTRO PROCESO"',
  M208: '"DEBE SELECCIONAR UNA PLAZA QUE TENGA LA CONDICIÓN DE VACANTE"',
  M216: '"NO SE PUEDE REALIZAR LA ACCIÓN POR MANDATO JUDICIAL, YA QUE LA ACCIÓN ESTÁ ACTIVA POR PROCESO"',
  M198B: '"EL MOTIVO DE ACCIÓN SELECCIONADO NO SE VIENE POR PROCESO DEL SISTEMA, SELECCIONAR OTRO MOTIVO DE ACCIÓN"',

  CONFIRM_CAMBIO_REGIMEN_REINICIO: '"AL CAMBIAR EL RÉGIMEN LABORAL SE REINICIARÁ EL ALCANCE DE PROCESO Y CARGOS SELECCIONADOS". ¿ESTÁ SEGURO DE PROCEDER?',
  CONFIRM_MODIFICAR_COMITE: '¿ESTÁ SEGURO DE QUE DESEA MODIFICAR EL COMITÉ?',
  INVALID_FILTROS_IMPORTAR: '"SELECCIONE TODOS LOS FILTROS DE LA SECCIÓN DATOS DEL PROCESO PARA IMPORTAR EL AÑO ANTERIOR EN EL ALCANCE DE PLAZA"',
  CONFIRM_IMPORTAR_ANIO_ANTERIOR: '"AL REALIZAR ESTA ACCIÓN, SE PERDERÁN LOS DATOS REGISTRADOS". ¿ESTÁ SEGURO DE CONTINUAR?',
  RESULT_NULL_IMPORTAR_ANIO_ANTERIOR: '"NO SE ENCONTRÓ INFORMACIÓN DEL PROCESO DEL AÑO ANTERIOR PARA EL ALCANCE DE PLAZA".',
  RESULT_NULL_TIPO_PLAZA: '"NO SE ENCONTRÓ INFORMACIÓN DE LOS TIPOS DE PLAZA PARA EL ALCANCE DE PLAZA"',
  RESULT_NULL_CONDICION_PLAZA: '"NO SE ENCONTRÓ INFORMACIÓN DE LAS CONDICIONES DE PLAZA PARA EL ALCANCE DE PLAZA"',
  RESULT_NULL_NIVEL_EDUCATIVO: '"NO SE ENCONTRÓ INFORMACIÓN DE LAS MODALIDADES Y NIVELES EDUCATIVOS PARA EL ALCANCE DE PLAZA"',
  RESULT_NULL_TIPO_GESTION_DEPENDENCIA: '"NO SE ENCONTRÓ INFORMACIÓN DE LOS TIPOS GESTIÓN DEPENDENCIAS PARA EL ALCANCE DE PLAZA"',
  INVALID_TIPO_DOCUMENTO_PERSONA: '"SELECCIONE EL TIPO DE DOCUMENTO DE IDENTIDAD DE LA PERSONA"',
  INVALID_NRO_DOCUMENTO_PERSONA: '"INGRESE EL NÚMERO DE DOCUMENTO DE IDENTIDAD DE LA PERSONA PARA REALIZAR LA BÚSQUEDA"',
  INVALID_CANTIDAD_DIAS: '"LA CANTIDAD DE DÍAS DEBE SER MAYOR O IGUAL A LA DURACIÓN MÍNIMA NACIONAL Y MENOR O IGUAL A LA DURACIÓN MÁXIMA NACIONAL"',
  INVALID_FOLIOS: '"INGRESE UN NÚMERO DE FOLIOS VÁLIDO"',

}
