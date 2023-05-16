import { ReasignacionesRestangularService } from 'app/core/data/services/resources/reasignaciones-restangular.service';
import { ReasignacionBaseModel } from './reasignacion-base.model';

export class ReasignacionesModel extends ReasignacionBaseModel{
    
    idProceso?:number;
    idEtapaProceso: number;
    idAlcanceProceso?: number;
    idDesarrolloProceso?: number;
    anioProceso: string;
    codigoProceso: string;
    regimenLaboral: string;
    maestroProceso: string;
    numeroConvocatoria: string;
    codigoEtapaFase: number;
    etapaFase: string;
    fechaCreacionProceso: string;
    estadoProceso: string;
    codigoEstadoProceso: number;
    codigoCentroTrabajo: string;

    idCentroTrabajo: number;
    centroTrabajo: string;
    descripcionDre: string;
    descripcionUgel: string;
    esRolMonitor: boolean;
    idPlazaReasignacion?:number;
    idEstadoValidacionPlaza ?: number;
    codigoEstadoValidacionPlaza?: number;
    estadoValidacionPlaza?:string;

    constructor(restangular: ReasignacionesRestangularService) {
        super(restangular);
    }

    build(): ReasignacionBaseModel {
        return new ReasignacionesModel(this.restangular);
    }

}

export class MaestroPermisoCalificacionModel {
    idMaestroPermisoCalificacion: number;
    idMaestroEtapaProceso: number;
    idRolPassport: number;
    idTipoSede: number;
    realizarCalificacion: boolean;
    observarPostulante: boolean;
    registrarReclamo: boolean;
    generarOrdenMerito: boolean;
    publicarResultadoPreliminar: boolean;
    publicarResultadoFinal: boolean;
}
