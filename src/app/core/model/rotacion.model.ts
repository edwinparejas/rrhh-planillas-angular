import { RotacionRestangularService } from '../data/services/resources/rotacion.restangular.service';
import { RotacionBaseModel } from './rotacion-base.model';

export class RotacionModel extends RotacionBaseModel {

    idEtapaProceso: string;
    idDesarrolloProceso: number;
    idAlcanceProceso: number;
    anioProceso: string;
    codigoProceso: string;
    regimenLaboral: string;
    maestroProceso: string;
    numeroConvocatoria: string;
    etapaFase: string;
    fechaCreacionProceso: string;
    estadoProceso: string;
    codigoEstadoProceso: number;
    codigoCentroTrabajo: string;

    idCentroTrabajo: string;
    centroTrabajo: string;
    descripcionDre: string;
    descripcionUgel: string;
    esRolMonitor: boolean;

    constructor(restangular: RotacionRestangularService) {
        super(restangular);
    }

    build(): RotacionModel {
        return new RotacionModel(this.restangular);
    }
}
