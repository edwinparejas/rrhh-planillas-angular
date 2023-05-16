import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalsService {

  constructor() { }
  
  NIVEL_SEDE_PASSPORT = 12;
  ENTIDAD_PASSPORT = 1;

  CODIGO_SISTEMA = '3';
  //CODIGO_SISTEMA = '4';
  CODIGO_FUNCIONALIDAD = '1';

  ESTADO_ENPROCESO = '3';
  ESTADO_APROBADO = '4';
  ESTADO_ANULADO = '5';   

  REGISTRAR_PLAZA = 9;
  APROBAR_PLAZA = 10;
  ANULAR_PLAZA = 11;

  TIPO_OPERACION_CREAR = '1';
  TIPO_OPERACION_APROBAR = '2';
  TIPO_OPERACION_ANULAR = '3';  

  ACCION_CREADO = 'CREADO';
  ACCION_APROBADO = 'APROBADO';
  ACCION_ANULADO = 'ANULADO';

  PESO_ARCHIVO_ADJUNTO_2MB = (2 * 1024 * 1024);
  PESO_2MB = '2MB';

  paginatorPageIndex = 0;
  paginatorPageSize = 5;
  tamanioNombreArchivo = 60;

  ESTADO_CARGAMASIVA_EN_PROCESO_DE_CARGA = 27;
  ESTADO_CARGAMASIVA_CARGADO = 28;
  ESTADO_CARGAMASIVA_EN_PROCESO_DE_VALIDACION = 29;
  ESTADO_CARGAMASIVA_VALIDADO = 30;
  ESTADO_CARGAMASIVA_PROCESANDO_LA_CARGA = 31;
  ESTADO_CARGAMASIVA_PROCESADO = 32;
  ESTADO_CARGAMASIVA_ANULADO = 33;
  ESTADO_CARGAMASIVA_CARGADO_CON_ERROR = 34;
  ESTADO_CARGAMASIVA_ESTADO_VALIDADO_CON_ERROR = 35;  

  ESTADO_SOLICITUD = {
    REGISTRADO: 3,
    EN_PROCESO: 4,
    ANULADO: 5,
    ATENDIDO: 6,
    RECHAZADO: 7,  
};

  soloNumeros(target: any) {
    target.value = target.value.replace(/[^0-9]+/g, '');
  }

  soloNumerosPuntoDecimal(target: any) {
    target.value = target.value.replace(/[^0-9.]/g, '');
  }

  formatoFecha(fecha: Date) {
    return fecha.getFullYear() + '-' + ('0' + (fecha.getMonth() + 1)).slice(-2) + '-' + ('0' + fecha.getDate()).slice(-2) + 
    'T' + 
    ('0' + (fecha.getHours())).slice(-2) + ':' + ('0' + (fecha.getMinutes())).slice(-2) + ':' + ('0' + (fecha.getSeconds())).slice(-2);
  }
  PASSPORT_CODIGO_SEDE = '';
  PASSPORT_CODIGO_TIPO_SEDE = '';
  PASSPORT_CODIGO_PASSPORT = '';
 
  b64toBlob = (b64Data:any, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  
  onPanel(panel:string){
    setTimeout(() => {document.getElementById(panel).scrollIntoView(); }, 1000);
  }
}
