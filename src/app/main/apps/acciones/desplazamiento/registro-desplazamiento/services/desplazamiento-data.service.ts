import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EntidadSedeService } from '../../Services/entidad-sede.service';
import { accionReference, EstadoDesplazamientoEnum, tipoSede } from '../../_utils/constants';

@Injectable({
    providedIn: 'root'
})
export class DesplazamientoDataService {

    idDre = null;
    idUgel = null;
    codigoDre = null;
    codigoUgel = null;

    constructor(private entidadSedeService: EntidadSedeService) { }

    buildBodyData(formulario: FormGroup, currentSession: any, _idAccionPersonal: number) {

        //ACCION PERSONAL
        const accionPersonalForm = this.ObtenerAccionPersonal(formulario);
        const idAccion = accionPersonalForm.idAccion;

        let dataRequest: any = null;


        if (idAccion == accionReference.PERMUTA) {
            dataRequest = this.obtenerPermutaData(formulario);
        } else {
            dataRequest = this.obtenerNoPermutaData(formulario);
        }

        const datosSede = this.ObtenerDatosSede();
        const datosAdjudicacion = this.obtenerDatosAdjudicacion(formulario);
        const idAccionPersonal = ((+_idAccionPersonal) <= 0 || !_idAccionPersonal) ? null : +_idAccionPersonal;

        const codigoEstadoDesplazamiento = formulario.controls["codigoEstadoDesplazamiento"].value;

        let estado = accionPersonalForm.esPorMandatoJudicial ? EstadoDesplazamientoEnum.PENDIENTE_AUTORIZACION : EstadoDesplazamientoEnum.REGISTRADO;

        if (codigoEstadoDesplazamiento == EstadoDesplazamientoEnum.AUTORIZADO) {
            estado = EstadoDesplazamientoEnum.AUTORIZADO;
        }
        else if (codigoEstadoDesplazamiento == EstadoDesplazamientoEnum.NO_AUTORIZADO) {
            estado = EstadoDesplazamientoEnum.NO_AUTORIZADO;
        }

        const { codigoSede } = this.entidadSedeService.entidadSede;

        dataRequest = {
            ...datosSede,
            ...dataRequest,
            ...datosAdjudicacion,
            estado,
            fechaCreacion: new Date(),
            codigoRol: currentSession.codigoRol,
            codigoSede,
            usuarioCreacion: currentSession.nombreUsuario,
            idAccionPersonal
        }

        return dataRequest;
    }

    private ObtenerAccionPersonal(formulario: FormGroup): IAccionPersonalDataService {
        const accionPersonalForm = formulario.controls["accionPersonal"] as FormGroup;
        const idRegimenLaboral = accionPersonalForm.controls["idRegimenLaboral"].value;
        const idAccion = accionPersonalForm.controls["idAccion"].value;
        const idGrupoAccion = accionPersonalForm.controls["idGrupoAccion"].value;
        const idMotivoAccion = accionPersonalForm.controls["idMotivoAccion"].value;

        const esPorMandatoJudicial = accionPersonalForm.controls["porMandatoJudicial"].value ?? false;
        const esPorProceso = accionPersonalForm.controls["porProceso"].value ?? false;

        return {
            idRegimenLaboral,
            idAccion,
            idGrupoAccion,
            idMotivoAccion,
            esPorMandatoJudicial,
            esPorProceso
        } as IAccionPersonalDataService;

    }

    private ObtenerDatosSede() {
        const { idDre, idUgel } = this.entidadSedeService.entidadSede;

        return {
            idDre,
            idUgel,
        };
    }

    private ObtenerDatosPersonales(formulario: FormGroup): IDatosPersonalesDataService {
        const datosPersonales = formulario?.controls["datosPersonales"] as FormGroup;
        //VINCULACION
        const vinculacion = datosPersonales.controls["vinculacion"] as FormGroup;
        const idServidorOrigen = +vinculacion.controls["idServidorPublico"].value;

        //PERSONA
        const persona = datosPersonales.controls["persona"] as FormGroup;
        const idPersonaOrigen = persona.controls["idPersona"].value;

        //INFORME ESCALAFONARIO
        const informeEscalafonarioOrigenForm = datosPersonales.controls["informeEscalafonario"] as FormGroup;
        const numeroinformeEscalafonarioOrigen = informeEscalafonarioOrigenForm.controls["numeroInformeEscalafonario"].value;
        const fechaInformeEscalafonarioOrigen = informeEscalafonarioOrigenForm.controls["fechaInformeEscalafonario"].value;
        const documentoinformeEscalafonarioOrigen = informeEscalafonarioOrigenForm.controls["documentoInformeEscalafonario"].value;
        return {
            idServidorOrigen,
            idPersonaOrigen,
            numeroinformeEscalafonarioOrigen,
            fechaInformeEscalafonarioOrigen,
            documentoinformeEscalafonarioOrigen,
            tiempoServicioOficialOrigen: 0,
            tiempoSevicioCargoOrigen: 0,
        } as IDatosPersonalesDataService;

    }

    private ObtenerDatosPersonalesPermuta(formulario: FormGroup) {
        const datosPersonales = formulario?.controls["datosPersonales"] as FormGroup;

        const datosServidor1 = datosPersonales.controls['datosServidor1'] as FormGroup;

        // DATOS SERVIDOR 1
        //VINCULACION
        const vinculacion = datosServidor1.controls["vinculacion"] as FormGroup;
        const idServidorOrigen = +vinculacion.controls["idServidorPublico"].value;

        //PERSONA
        const persona = datosServidor1.controls["persona"] as FormGroup;
        const idPersonaOrigen = persona.controls["idPersona"].value;

        //INFORME ESCALAFONARIO
        const informeEscalafonarioOrigenForm = datosServidor1.controls["informeEscalafonario"] as FormGroup;

        const numeroinformeEscalafonarioOrigen = informeEscalafonarioOrigenForm.controls["numeroInformeEscalafonario"].value;
        const fechaInformeEscalafonarioOrigen = informeEscalafonarioOrigenForm.controls["fechaInformeEscalafonario"].value;
        const documentoinformeEscalafonarioOrigen = informeEscalafonarioOrigenForm.controls["documentoInformeEscalafonario"].value;

        // DATOS SERVIDOR 2
        //VINCULACION
        const datosServidor2 = datosPersonales.controls['datosServidor2'] as FormGroup;
        const _vinculacion = datosServidor2.controls["vinculacion"] as FormGroup;
        const idServidorDestino = +_vinculacion.controls["idServidorPublico"].value;

        //PERSONA
        const _persona = datosServidor2.controls["persona"] as FormGroup;
        const idPersonaDestino = _persona.controls["idPersona"].value;

        //INFORME ESCALAFONARIO
        const informeEscalafonarioDestinoForm = datosServidor2.controls["informeEscalafonario"] as FormGroup;

        const numeroinformeEscalafonarioDestino = informeEscalafonarioDestinoForm.controls["numeroInformeEscalafonario"].value;
        const fechaInformeEscalafonarioDestino = informeEscalafonarioDestinoForm.controls["fechaInformeEscalafonario"].value;
        const documentoinformeEscalafonarioDestino = informeEscalafonarioDestinoForm.controls["documentoInformeEscalafonario"].value;

        return {
            idServidorOrigen,
            idPersonaOrigen,
            numeroinformeEscalafonarioOrigen,
            fechaInformeEscalafonarioOrigen,
            documentoinformeEscalafonarioOrigen,
            tiempoServicioOficialOrigen: 0,
            tiempoSevicioCargoOrigen: 0,
            idServidorDestino,
            idPersonaDestino,
            numeroinformeEscalafonarioDestino,
            fechaInformeEscalafonarioDestino,
            documentoinformeEscalafonarioDestino,
            tiempoServicioOficialDestino: 0,
            tiempoSevicioCargoDestino: 0,
        };

    }

    private ObtenerPlazas(formulario: FormGroup) {
        //PLAZA ORIGEN
        const plazaOrigenForm = formulario.controls["plazaOrigen"] as FormGroup;
        const codigoPlazaOrigen = plazaOrigenForm.controls["codigoPlazaOrigen"].value;
        const itemPlazaOrigen = plazaOrigenForm.controls["itemPlaza"].value;

        //PLAZA DESTINO
        const plazaDestinoForm = formulario.controls["plazaDestino"] as FormGroup;
        let codigoPlazaDestino = plazaDestinoForm.controls["codigoPlazaOrigen"].value;
        let itemPlazaDestino = plazaDestinoForm.controls["itemPlaza"].value;

        //DATOS ADJUDICACION
        const adjudicacionPersonaForm = formulario.controls["adjudicacionPersona"] as FormGroup;
        const esAdjudicacionValido = adjudicacionPersonaForm?.controls["esValido"]?.value ?? false;
        //CASO ADJUDICACION ES VALIDO
        // if (esAdjudicacionValido) {
        //     codigoPlazaDestino = codigoPlazaOrigen;
        //     itemPlazaDestino = itemPlazaOrigen;
        // }

        return {
            codigoPlazaOrigen,
            itemPlazaOrigen,
            codigoPlazaDestino,
            itemPlazaDestino
        };
    }

    private ObtenerDatosAccion(formulario: FormGroup) {

        //DATOS ACCION
        const datosAccionForm = formulario.controls["datosAccion"] as FormGroup;
        const fechaInicioAccion = datosAccionForm.controls["fechaInicio"].value;
        const fechaTerminoAccion = datosAccionForm.controls["fechaTermino"].value;
        const escalaMagisterial = datosAccionForm.controls["escalaMagisterial"].value;

        return {
            fechaInicioAccion,
            fechaTerminoAccion,
            escalaMagisterial
        };
    }

    private obtenerDatosAdjudicacion(formulario: FormGroup): any {
        const accionPersonalForm = formulario.controls["accionPersonal"] as FormGroup;
        const esPorMandatoJudicial = accionPersonalForm.controls["porMandatoJudicial"].value ?? false;
        const esPorProceso = accionPersonalForm.controls["porProceso"].value ?? false;

        let response = {
            esPorMandatoJudicial,
            esPorProceso
        } as any;

        if (esPorProceso) {
            const adjudicacionPersonaForm = formulario.controls["adjudicacionPersona"] as FormGroup;
            const codigoAdjudicacionProceso = adjudicacionPersonaForm.controls["codigoAdjudicacionProceso"].value;
            const idAdjudicacionProceso = adjudicacionPersonaForm.controls["idAdjudicacionProceso"].value;

            response = {
                ...response,
                codigoAdjudicacionProceso,
                idAdjudicacionProceso
            }
        }


        return response;
    }

    private obtenerNoPermutaData(formulario: FormGroup) {

        const accionPersonal = this.ObtenerAccionPersonal(formulario);
        const datosPersonales = this.ObtenerDatosPersonales(formulario);
        const datosAccion = this.ObtenerDatosAccion(formulario);
        const datosPlazas = this.ObtenerPlazas(formulario);
        const datosServidorDestino =
        {
            idPersonaDestino: datosPersonales.idPersonaOrigen,
            idServidorDestino: datosPersonales.idServidorOrigen,
            numeroinformeEscalafonarioDestino: datosPersonales.numeroinformeEscalafonarioOrigen,
            fechaInformeEscalafonarioDestino: datosPersonales.fechaInformeEscalafonarioOrigen,
            documentoinformeEscalafonarioDestino: datosPersonales.documentoinformeEscalafonarioOrigen,
            tiempoServicioOficialDestino: 0,
            tiempoSevicioCargoDestino: 0,
        };

        return {
            ...accionPersonal,
            ...datosPersonales,
            ...datosServidorDestino,
            ...datosAccion,
            ...datosPlazas,
            esConformeAdjudicacion: 1,
            detalleObservacionAdjudicacion: "",
            validado: 1,
        };
    }

    private obtenerPermutaData(formulario: FormGroup) {

        const accionPersonal = this.ObtenerAccionPersonal(formulario);
        const datosPersonales = this.ObtenerDatosPersonalesPermuta(formulario);
        const datosAccion = this.ObtenerDatosAccion(formulario);
        const datosPlazas = this.ObtenerPlazas(formulario);

        return {
            ...accionPersonal,
            ...datosPersonales,
            ...datosAccion,
            ...datosPlazas,
            esConformeAdjudicacion: 1,
            detalleObservacionAdjudicacion: "",
            validado: 1,
        };
    }
}


export interface IAccionPersonalDataService {
    idRegimenLaboral?: number;
    idAccion?: number;
    idGrupoAccion?: number;
    idMotivoAccion?: number;
    esPorMandatoJudicial?: boolean;
}


export interface IDatosPersonalesDataService {
    idServidorOrigen?: number;
    idPersonaOrigen?: number;
    numeroinformeEscalafonarioOrigen?: string;
    fechaInformeEscalafonarioOrigen?: any;
    documentoinformeEscalafonarioOrigen?: string;
}