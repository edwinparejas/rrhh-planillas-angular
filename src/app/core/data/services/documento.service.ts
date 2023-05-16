import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DocumentosRestangularService } from './resources/documentos-restangular.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  constructor(private restangular: DocumentosRestangularService) {
  }

  crear(documento: any): Observable<any> {
    return this.restangular.all("Documentos").post(documento);
  }

  crearDocumento(data: any): Observable<any> {  
      console.log("data", data);
    return this.restangular.all('Documentos').postDocumento(data);
  }

  confirmar(pIdDocumento: any): Observable<any> {
    return this.restangular.one("Documentos", pIdDocumento).patch();
  }

  descargar(pIdDocumento: any): Observable<any> {
    return this.restangular.one("Documentos", pIdDocumento).download();
  }

  downloadFile(data: any, nombreFile: string) {
    switch (data.type) {
      case HttpEventType.DownloadProgress:
        break;
      case HttpEventType.Response:
        const downloadedFile = new Blob([data.body], { type: data.body.type });
        const a = document.createElement('a');
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        a.download = nombreFile;
        a.href = URL.createObjectURL(downloadedFile);
        a.target = '_blank';
        a.click();
        document.body.removeChild(a);
        break;
    }
  }

  getDocumentoFormato(codigoDocumento: any): Observable<any> {
    return this.restangular.one('documentos', codigoDocumento).getDocumentoFormato();
  }


}
