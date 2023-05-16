import { AsistenciaRestangularService } from '../data/services/resources/asistencia-restangular.service';
import { Model } from './base-model';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export class AsistenciaModel extends Model {
    
    idControlAsistencia: string;
    idEstado: string;
    idMes: string;
    descripcion: string;
    descripcionMes: string;
    // idModalidad: string;
    // descripcionModalidad: string;
    // idNivel:string; 
    // descripcionNivel:string;
    descripcionEstado: string;
    fechaCreacion: string;
    codigo: string;
    anio: string;

  

    constructor(restangular: AsistenciaRestangularService) {
        super(restangular);
    }

    build(): AsistenciaModel {
        return new AsistenciaModel(this.restangular);
    }

    // RegistroAsistencia
    getInformacionServidor = (
        idAsistenciaServidor: any
    ): Observable<any> => {
        return this.restangular.one("asistenciasservidor", idAsistenciaServidor).get();
    }

}
