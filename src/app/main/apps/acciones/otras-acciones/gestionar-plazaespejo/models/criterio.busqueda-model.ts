import { CatalogoEnum, IdTipoActividadEnum } from '../types/Enums';

export class CriterioBusquedaModel {
    private todos = [{ id: -1, descripcion: '--TODOS--' }];
    comboLists = {
        tipoActividades: this.todos,
        tipoDocumentos: this.todos,
        tipoResoluciones: this.todos,
        regimenLaborales: this.todos,
        grugoAcciones: this.todos,
        acciones: this.todos,
        motivoAcciones: this.todos,
    };

    selectDefault: number = -1;
    private tipoFormDefault = (esReset: boolean): any => {
        return esReset ? this.selectDefault : [this.selectDefault];
    }

    private tipoFormNull = (esReset: boolean): any => {
        return esReset ? null : [null];
    }

    generarForm = (esReset?: boolean): any => {
        return {
            idTipoActividad: this.tipoFormDefault(esReset),
            idTipoDocumento: this.tipoFormDefault(esReset),
            numeroDocumento: this.tipoFormNull(esReset),
            //   primerApellido: this.tipoFormNull(esReset),
            //   segundoApellido: this.tipoFormNull(esReset),
            //   nombres: this.tipoFormNull(esReset),
            fechaVigenciaInicio: this.tipoFormNull(esReset),
            fechaVigenciaFin: this.tipoFormNull(esReset),
            idTipoResolucion: this.tipoFormDefault(esReset),
            idRegimenLaboral: this.tipoFormDefault(esReset),
            idGrupoAccion: this.tipoFormDefault(esReset),
            idAccion: this.tipoFormDefault(esReset),
            idMotivoAccion: this.tipoFormDefault(esReset),
            codigoPlaza: this.tipoFormNull(esReset),
            codigoModular: this.tipoFormNull(esReset)
        }
    };
    cargarCatalogo = (catalogos: any[]) => {

        this.comboLists.tipoResoluciones = [...this.todos,
        ...catalogos
            .filter(x =>
                x.codigo == CatalogoEnum.TIPORESOLUCION)];
        this.comboLists.tipoDocumentos = [...this.todos,
        ...catalogos
            .filter(x =>
                x.codigo == CatalogoEnum.TIPODOCUMENTO)];
    }
    cargarRegimenaLaboral = (regimenLaborales: any[]) => {
        this.comboLists.regimenLaborales = [...this.todos, ...regimenLaborales];
    }
    cargarGrupoAccion = (grugoAcciones: any[]) => {
        this.comboLists.grugoAcciones = [...this.todos, ...grugoAcciones];
    }
    cargarAccion = (acciones: any[]) => {
        this.comboLists.acciones = [...this.todos, ...acciones];
    }
    cargarMotivoAccion = (motivoAcciones: any[]) => {
        this.comboLists.motivoAcciones = [...this.todos, ...motivoAcciones];
    }

    cargarEstadoActividad = (tipoActividades: any[]) => {
        this.comboLists.tipoActividades = [...this.todos, ...tipoActividades];
    }
}
