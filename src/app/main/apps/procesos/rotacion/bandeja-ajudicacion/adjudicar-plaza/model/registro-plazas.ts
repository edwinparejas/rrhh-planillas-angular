import { FormControl, FormGroup, Validators } from '@angular/forms';

export class RegistroPlaza {
    select: boolean;
    totalRegistros: number;
    idPlaza: number;
    idPlazaRotacionDetalle: number;
    idCentroTrabajo: number;
    numeroRegistro: number;
    codigoModular: string;
    centroTrabajo: string;
    modalidad: string;
    nivelEducativo: string;
    tipoGestion: string;
    codigoPlaza: string;
    cargo: string;
    grupoOcupacional: string;
    categoriaRemunerativa: string;
    tipoPlaza: string;
    jornadaLaboral: string;
    motivoVacancia: string;
    fechaInicioVigencia?: Date;

    static asFormGroup(registro: RegistroPlaza): FormGroup {
        const fg = new FormGroup({
            select: new FormControl(registro.select),
            totalRegistros: new FormControl(registro.totalRegistros),
            idPlaza: new FormControl(registro.idPlaza),
            idPlazaRotacionDetalle: new FormControl(registro.idPlazaRotacionDetalle),
            idCentroTrabajo: new FormControl(registro.idCentroTrabajo),
            numeroRegistro: new FormControl(registro.numeroRegistro),
            codigoModular: new FormControl(registro.codigoModular),
            centroTrabajo: new FormControl(registro.centroTrabajo),
            modalidad: new FormControl(registro.modalidad),
            nivelEducativo: new FormControl(registro.nivelEducativo),
            tipoGestion: new FormControl(registro.tipoGestion),
            codigoPlaza: new FormControl(registro.codigoPlaza),
            cargo: new FormControl(registro.cargo),
            grupoOcupacional: new FormControl(registro.grupoOcupacional),
            categoriaRemunerativa: new FormControl(registro.categoriaRemunerativa),
            tipoPlaza: new FormControl(registro.tipoPlaza),
            jornadaLaboral: new FormControl(registro.jornadaLaboral),
            motivoVacancia: new FormControl(registro.motivoVacancia),
            fechaInicioVigencia: new FormControl(registro.fechaInicioVigencia),
        });
        return fg;
    }
}
