import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RestangularService } from './restangular.service';
import { HttpParams } from '@angular/common/http';

// const basePath = 'negocio';

@Injectable({
  providedIn: 'root'
})
export class CargamasivaService {

  constructor(private restangular: RestangularService) { 
    // this.restangular = restangular.allCargaMasiva(basePath).allCargaMasiva('comunes').allCargaMasiva('cargamasiva');
  }
  
  getCargaMasiva(data: any, pageIndex: any, pageSize: any) {
    let queryParam = new HttpParams();
    if (data.datosRegistroOrigen !== null && data.datosRegistroOrigen !== '') { queryParam = queryParam.set('datosRegistroOrigen', data.datosRegistroOrigen); }
    if (data.codigoSistema !== null && data.codigoSistema > 0) { queryParam = queryParam.set('codigoSistema', data.codigoSistema); }
    if (data.codigoFuncionalidad !== null && data.codigoFuncionalidad > 0) { queryParam = queryParam.set('codigoFuncionalidad', data.codigoFuncionalidad); }
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);

    queryParam = queryParam.set('codigoRol', data.codigoRol);
    queryParam = queryParam.set('codigoSede', data.codigoSede);
    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);

    return this.restangular.allCargaMasiva('cargasmasivas').getCargaMasiva(queryParam);
  }

  getCargaMasivaHistorial(data: any, pageIndex: any, pageSize: any) {
    let queryParam = new HttpParams();
    if (data.datosRegistroOrigen !== null && data.datosRegistroOrigen === '') { queryParam = queryParam.set('datosRegistroOrigen', data.datosRegistroOrigen); }
    if (data.codigoSistema !== null && data.codigoSistema > 0) { queryParam = queryParam.set('codigoSistema', data.codigoSistema); }
    if (data.codigoFuncionalidad !== null && data.codigoFuncionalidad > 0) { queryParam = queryParam.set('codigoFuncionalidad', data.codigoFuncionalidad); }
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);

    queryParam = queryParam.set('codigoRol', data.codigoRol);
    queryParam = queryParam.set('codigoSede', data.codigoSede);
    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);

    return this.restangular.allCargaMasiva('cargasmasivas').allCargaMasiva('historial').getCargaMasiva(queryParam);
  }

  crearCargaMasiva(data: any): Observable<any> {
    return this.restangular.allCargaMasiva('cargasmasivas').postCargaMasiva(data);
  }

  listaDetalleCargaMasiva(data: any, pageIndex, pageSize): Observable<any> {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);

    queryParam = queryParam.set('codigoRol', data.codigoRol);
    queryParam = queryParam.set('codigoSede', data.codigoSede);
    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);

    return this.restangular.oneCargaMasiva('cargasmasivas', data.idCarga).allCargaMasiva('detalle').getCargaMasiva(queryParam);
  }

  listaDetalleErrorCargaMasiva(data: any, pageIndex, pageSize): Observable<any> {
    let queryParam = new HttpParams();
    queryParam = queryParam.set('error', data.error);
    queryParam = queryParam.set('paginaActual', pageIndex);
    queryParam = queryParam.set('tamanioPagina', pageSize);
    
    queryParam = queryParam.set('codigoRol', data.codigoRol);
    queryParam = queryParam.set('codigoSede', data.codigoSede);
    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
    
    return this.restangular.oneCargaMasiva('cargasmasivas', data.idCarga).allCargaMasiva('detalle').getCargaMasiva(queryParam);
  }

  anularCargaMasiva(data: any): Observable<any> {  
    return this.restangular.oneCargaMasiva('cargasmasivas', data.idCarga).allCargaMasiva('anular').patchCargaMasiva(data);
  }

  validarCargaMasiva(data: any): Observable<any> {
    return this.restangular.oneCargaMasiva('cargasmasivas', data.idCarga).allCargaMasiva('validar').patchCargaMasiva(data);
  }

  procesarCargaMasiva(data: any): Observable<any> {
    return this.restangular.oneCargaMasiva('cargasmasivas', data.idCarga).allCargaMasiva('procesar').patchCargaMasiva(data);
  }

  exportarHistorialCargaMasivaExcel() {      
    return this.restangular.allCargaMasiva('cargasmasivas').allCargaMasiva('exportarhistorico').getCargaMasivaFile();
  }

  exportarDetalleCargaMasivaExcel(data: any) {      
    let queryParam = new HttpParams();
    queryParam = queryParam.set('error', data.error);   
    queryParam = queryParam.set('idFormato', data.idFormato);
    
    queryParam = queryParam.set('codigoRol', data.codigoRol);
    queryParam = queryParam.set('codigoSede', data.codigoSede);
    queryParam = queryParam.set('codigoTipoSede', data.codigoTipoSede);
     
    return this.restangular.oneCargaMasiva('cargasmasivas', data.idCarga).allCargaMasiva('exportardetalles').getCargaMasivaFile(queryParam);
  }

  getFormato(data: any) {    
    let queryParam = new HttpParams();
    if (data.codigoSistema !== null && data.codigoSistema > 0) { queryParam = queryParam.set('codigoSistema', data.codigoSistema); }
    if (data.codigoFuncionalidad !== null && data.codigoFuncionalidad > 0) { queryParam = queryParam.set('codigoFuncionalidad', data.codigoFuncionalidad); }
    return this.restangular.allCargaMasiva('formatos').getCargaMasiva(queryParam);
  }

  exportarFormatoExcel(data: any) {      
    return this.restangular.oneCargaMasiva('formatos', data).allCargaMasiva('exportar').getCargaMasivaFile();
  }

  downloadFile(blob: Blob, nombreFile: string) {  
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = nombreFile;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadURL);
    }, 100);
  }

  getCamposDerivadosFormato1(codigosModulares: string) {    
    return this.restangular.oneCargaMasiva('cargasmasivas', codigosModulares).allCargaMasiva('camposDerivadosFormato1').getCargaMasiva();    
  }

  listarEstado(activo: any) {
    let queryParam = new HttpParams();    
    if (activo !== null) { queryParam = queryParam.set('activo', activo); }
    return this.restangular.allCargaMasiva('estados').getCargaMasiva(queryParam);
  } 
  
}
