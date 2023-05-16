import { FormControl, FormGroup, Validators } from '@angular/forms';

export class EvaluacionExpediente {

    acreditaDocumento: boolean;
    codigoCriterio: string;
    criterioPuntuacion: number;
    descripcionCriterioPuntuacion: string;
    descripcionCriterio: string;
    idMaestroCriterioCalificacion: number;
    idMaestroCriterioCalificacionPadre?: number;
    idMaestroRubroCalificacion: number;
    puntajeMaximo?: number;
    puntajeMaximoUnidad?: number;
    unidadMedida: string;
    cantidadCertificados?: number;
    puntaje?: number;
    tienePadre: boolean;
    idCodigoPadre?: number;
    tieneSubCriterio: boolean;
    acreditaDocumentoSeleccionado: boolean;
    esSeleccionExcluyente: boolean;
    tieneCantidad: boolean;
    idCategoriaRemunerativa?: number;
    validaEscala: boolean;

    static asFormGroup(evaluacionExpediente: EvaluacionExpediente): FormGroup {
        const fg = new FormGroup({
            acreditaDocumento: new FormControl(evaluacionExpediente.acreditaDocumento),
            codigoCriterio: new FormControl(evaluacionExpediente.codigoCriterio),
            criterioPuntuacion: new FormControl(evaluacionExpediente.criterioPuntuacion),
            descripcionCriterioPuntuacion: new FormControl(evaluacionExpediente.descripcionCriterioPuntuacion),
            descripcionCriterio: new FormControl(evaluacionExpediente.descripcionCriterio),
            idMaestroCriterioCalificacion: new FormControl(evaluacionExpediente.idMaestroCriterioCalificacion),
            idMaestroCriterioCalificacionPadre: new FormControl(evaluacionExpediente.idMaestroCriterioCalificacionPadre),
            idMaestroRubroCalificacion: new FormControl(evaluacionExpediente.idMaestroRubroCalificacion),
            puntajeMaximo: new FormControl(evaluacionExpediente.puntajeMaximo),
            puntajeMaximoUnidad: new FormControl(evaluacionExpediente.puntajeMaximoUnidad),
            unidadMedida: new FormControl(evaluacionExpediente.unidadMedida),
            cantidadCertificados: new FormControl(evaluacionExpediente.cantidadCertificados),
            puntaje: new FormControl(evaluacionExpediente.puntaje),
            tienePadre: new FormControl(evaluacionExpediente.tienePadre),
            idCodigoPadre: new FormControl(evaluacionExpediente.idCodigoPadre),
            tieneSubCriterio: new FormControl(evaluacionExpediente.tieneSubCriterio),
            acreditaDocumentoSeleccionado: new FormControl(false),
            esSeleccionExcluyente: new FormControl(evaluacionExpediente.esSeleccionExcluyente),
            tieneCantidad: new FormControl(evaluacionExpediente.tieneCantidad),
            validaEscala: new FormControl(evaluacionExpediente.validaEscala),
            idCategoriaRemunerativa: new FormControl(evaluacionExpediente.idCategoriaRemunerativa)
        });

        fg.get('cantidadCertificados').valueChanges.subscribe(value => {
            // console.log('cantidadCertificados_valueChanges');
            // if (value) {
            //     const criterioPuntuacion = fg.get('criterioPuntuacion').value;
            //     const valorCalculado = criterioPuntuacion ?? 0 * value;
            //     const puntajeMaximo = fg.get('puntajeMaximo').value;
            //     if (puntajeMaximo >= valorCalculado) {
            //         fg.patchValue({ puntaje: valorCalculado });
            //     } else {
            //         //fg.patchValue({ puntaje: null });
            //     }
            // }
        });

        return fg;
    }
}
