import { HttpParams } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActividadesRestangularService } from './resources/actividades-restangular.service';
import { convertObjectToGetParams } from "@minedu/functions/http.helpers";

@Injectable({
    providedIn: 'root'
})
export class ActividadesService {
  CODIGO_SISTEMA = '3';
    constructor(private restangular: ActividadesRestangularService) {
    }
    getComboEstadosActividad = (): Observable<any> => {
      return this.restangular.all('estadosactividad').get();
    }

    getComboTiposActividad = (): Observable<any> => {
      return this.restangular.all('tiposactividad').get();
    }

    getComboTiposDocumentoIdentidad = (): Observable<any> => {
      return this.restangular.all('tiposdocumentoidentidad').get();
    }

    getComboTiposResolucion = (): Observable<any> => {
      return this.restangular.all('tiposresolucion').get();
    }

    getComboRegimenesLaborales = (): Observable<any> => {   
      return this.restangular.all('regimeneslaborales').get();
    }    

    getComboGruposAccion = (idRegimenLaboral: string): Observable<any> => {
        let queryParam = new HttpParams();           
        if (idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
        return this.restangular.all('gruposaccion').get(queryParam);        
    }

    getComboAcciones = (idRegimenLaboral: string, idGrupoAccion: string): Observable<any> => {
      let queryParam = new HttpParams();          
      if (idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
      if (idGrupoAccion !== null) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
      return this.restangular.all('acciones').get(queryParam);        
    }

    getComboMotiviosAccion = (idRegimenLaboral: string, idGrupoAccion: string, idAccion: string): Observable<any> => {
      let queryParam = new HttpParams();      
      if (idRegimenLaboral !== null) { queryParam = queryParam.set('idRegimenLaboral', idRegimenLaboral); }
      if (idGrupoAccion !== null) { queryParam = queryParam.set('idGrupoAccion', idGrupoAccion); }
      if (idAccion !== null) { queryParam = queryParam.set('idAccion', idAccion); }
      return this.restangular.all('motivosaccion').get(queryParam);        
    }    

    consultar(actividad: any, paginaActual: any, tamanioPagina: any): Observable<any> {
      let queryParam: HttpParams = new HttpParams()
        .set('idSistema', this.CODIGO_SISTEMA)
        .set('paginaActual', paginaActual)
        .set('tamanioPagina', tamanioPagina);
      return this.restangular.all("actividades").post(actividad, queryParam);
    }

    getRegistroActividades = (idActividad: string): Observable<any> => {
      return this.restangular.one('actividades', idActividad).get(); 
    }
   
    ObservarActividad(actividad: any): Observable<any> {
      return this.restangular.one(actividad.idActividad, 'observar').patch(actividad);
      // return this.restangular.all('observar').patch(actividad);
    }     
    
    AprobarActividad(actividad: any): Observable<any> {
      return this.restangular.one(actividad.idActividad, 'aprobar').patch(actividad);
      // return this.restangular.all('aprobar').patch(actividad);
    }     

    exportar(data: any) {  
      let queryParam = new HttpParams();    
      if (data.idFuncionalidad !== null) { queryParam = queryParam.set('idFuncionalidad', data.idFuncionalidad); }
      if (data.idEstadoBandeja !== null) { queryParam = queryParam.set('idEstadoBandeja', data.idEstadoBandeja); }
      return this.restangular.all('exportarbandeja').getBandejaFile(queryParam);
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

}