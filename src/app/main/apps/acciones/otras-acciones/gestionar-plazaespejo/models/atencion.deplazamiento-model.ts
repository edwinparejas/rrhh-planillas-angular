import { Validators } from '@angular/forms';
import { IActividadDesplazamientoResponse, IDatosPersonalesResponse, IDatosResolucionResponse } from '../interfaces/actividad.desplazamiento';

export class AtencionDesplazamientoModel {
    // datosPersona: IDatosPersonalesResponse;
    // datosResolucion: IDatosResolucionResponse;
    // datosPlaza: any;
    datosActividad: any;
    idActividadResolucion: number;
    idActividad: number;
    idEstadoActividad: number;
    datosDesplazamiento: IActividadDesplazamientoResponse;

    configurarActividad = (idActividadResolucion: number, idActividad: number) => {
        this.idActividadResolucion = idActividadResolucion;
        this.idActividad = idActividad;
    }
    AsignarEstado = (idEstadoActividad: number) => this.idEstadoActividad = idEstadoActividad;
    cargarDatosActividad = (item: any) => {
        this.datosActividad = item;
    }

    cargarDatosDesplazamiento(item: IActividadDesplazamientoResponse) {
        this.datosDesplazamiento = item;
    }

    // cargarDatosPersona = (item: any) => {
    // this.datosPersona = item;
    // }

    // cargarDatosResolucion = (item: any) => {
    // this.datosResolucion = item;
    // }

    // cargarDatosPlaza = (item: any) => {
    // this.datosPlaza = item;
    // }
    selectDefault: number = -1;
    private tipoFormDefault = (esReset: boolean): any => {
        return esReset ? this.selectDefault : [this.selectDefault];
    }
    private tipoFormNull = (esReset: boolean): any => {
        return esReset ? null : [null, Validators.required];
    }
    generarForm = (esReset?: boolean): any => {
        return {
            idTipoCargo: this.tipoFormDefault(esReset),
            idCargo: this.tipoFormDefault(esReset),
            idJornadaLaboral: this.tipoFormDefault(esReset),
            anotaciones:this.tipoFormNull(esReset),
            observacion:this.tipoFormNull(esReset)
        }
    };
    validarDatos = (dataForm: any): any => {
        let esValido: boolean = true;
        let controlErrors: any[] = [];

        Object.entries(dataForm).forEach(item => {
            if (item[1] == -1)
                controlErrors.push(item[0]);
        });
        esValido = !(controlErrors.length > 0);
        return [esValido, controlErrors];
    }
}
