import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { desplazamientoErrorMessages } from '../../_utils/desplazamiento.error.messages';

@Injectable({
    providedIn: 'root'
})
export class ReglasFechaValidacionService {

    constructor() { }

    private obtenerFechasInicioFin(formulario: FormGroup) {
        const datosAccionForm = formulario?.controls["datosAccion"] as FormGroup;
        const _fechaInicioValue = datosAccionForm?.controls["fechaInicio"]?.value ?? null;
        const fechaInicioValue = _fechaInicioValue ? moment(_fechaInicioValue).toDate() : null;
        const _fechaTerminoValue = datosAccionForm?.controls["fechaTermino"]?.value ?? null;
        const fechaTerminoValue = _fechaTerminoValue ? moment(_fechaTerminoValue).toDate() : null;
        return { fechaInicioValue, fechaTerminoValue };
    }

    fechaInicioMayorFechaTermino(formulario: FormGroup) {
        const { fechaInicioValue, fechaTerminoValue } = this.obtenerFechasInicioFin(formulario);
        const isValid = (fechaInicioValue && fechaTerminoValue && fechaInicioValue < fechaTerminoValue) ?? false;
        let errorMessage = null;
        if (!isValid) {
            errorMessage = desplazamientoErrorMessages.FECHA_INICIO_MAYOR_FECHA_TERMINO
        }
        return { isValid, errorMessage };
    }

    fechaInicioMenorPlazaVigenciaInicio(formulario: FormGroup) {
        const { fechaInicioValue } = this.obtenerFechasInicioFin(formulario);

        const plazaDestinoForm = formulario.controls["plazaDestino"] as FormGroup;
        const _vigenciaInicioValue = plazaDestinoForm?.controls["vigenciaInicio"].value ?? null;
        const vigenciaInicioValue = _vigenciaInicioValue ? moment(_vigenciaInicioValue).toDate() : null;
        const isValid = vigenciaInicioValue && vigenciaInicioValue < fechaInicioValue;
        let errorMessage = null;
        if (!isValid) {
            errorMessage = desplazamientoErrorMessages.FECHA_INICIO_MENOR_VIGENCIA_INICIO;
        }
        return { isValid, errorMessage };
    }

    fechaInicioFinRango4AniosMenor30Dias(formulario: FormGroup) {
        const { fechaInicioValue, fechaTerminoValue } = this.obtenerFechasInicioFin(formulario);
        const fechaInicioDateValue = moment(fechaInicioValue, "DD/MM/YYYY");
        const fechaTerminoDateValue = moment(fechaTerminoValue, "DD/MM/YYYY");

        const dias = moment.duration(fechaTerminoDateValue.diff(fechaInicioDateValue)).asDays();
        const anios = moment.duration(fechaTerminoDateValue.diff(fechaInicioDateValue)).asYears();
        const isValid = dias >= 30 && anios <= 4;
        let errorMessage = null;

        if (!isValid) {
            errorMessage = desplazamientoErrorMessages.RANGO_FECHAS_MAYOR_4ANIOS;
        }
        return { isValid, errorMessage };
    }

    fechaInicioFinRangoMayorAnioFiscalMenor30Dias(formulario: FormGroup) {
        const { fechaInicioValue, fechaTerminoValue } = this.obtenerFechasInicioFin(formulario);
        const fechaInicioDateValue = moment(fechaInicioValue, "DD/MM/YYYY");
        const fechaTerminoDateValue = moment(fechaTerminoValue, "DD/MM/YYYY");

        const currentYear = moment().year();
        const fiscalLastDay = `31/12/${currentYear}`;
        const fiscalLastDayDate = moment(fiscalLastDay, "DD/MM/YYYY");

        const dias = moment.duration(fechaTerminoDateValue.diff(fechaInicioDateValue)).asDays();

        const isValid = dias >= 30 && fechaInicioDateValue <= fiscalLastDayDate && fechaTerminoDateValue <= fiscalLastDayDate;
        let errorMessage = null;

        if (!isValid) {
            errorMessage = desplazamientoErrorMessages.RANGO_FECHAS_MAYOR_ANIO_FISCAL;
        }
        return { isValid, errorMessage };
    }


    fechaInicio1erDiaMesMarzoProxAnio(formulario: FormGroup) {
        const { fechaInicioValue } = this.obtenerFechasInicioFin(formulario);
        const fechaInicioDateValue = moment(fechaInicioValue, "DD/MM/YYYY");
        const nextYear = moment().year() + 1;
        const expectedDateStr = `01/03/${nextYear}`;
        const expectedDate = moment(expectedDateStr, "DD/MM/YYYY");

        const isValid = fechaInicioDateValue.isSame(expectedDate);
        let errorMessage = null;

        if (!isValid) {
            errorMessage = desplazamientoErrorMessages.FECHA_INICIO_IGUAL_1ERDIA_PROX_MARZO;
        }
        return { isValid, errorMessage };
    }

    fechaInicio1erDiaMesEneroProxAnio(formulario: FormGroup) {
        const { fechaInicioValue } = this.obtenerFechasInicioFin(formulario);
        const fechaInicioDateValue = moment(fechaInicioValue, "DD/MM/YYYY");
        const nextYear = moment().year() + 1;
        const expectedDateStr = `01/01/${nextYear}`;
        const expectedDate = moment(expectedDateStr, "DD/MM/YYYY");

        const isValid = fechaInicioDateValue.isSame(expectedDate);
        let errorMessage = null;

        if (!isValid) {
            errorMessage = desplazamientoErrorMessages.FECHA_INICIO_IGUAL_1ERDIA_PROX_MARZO;
        }
        return { isValid, errorMessage };
    }
}
