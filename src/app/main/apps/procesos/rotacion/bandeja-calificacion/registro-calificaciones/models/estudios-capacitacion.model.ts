import { FormControl, FormGroup, Validators } from '@angular/forms';

export class EstudiosCapacitacion {

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
    cantidadCertificados?: number;
    puntaje?: number;
    tienePadre: boolean;
    tieneSubCriterio: boolean;
    acreditaDocumentoSeleccionado: boolean;
    esSeleccionExcluyente: boolean;
    tieneCantidad: boolean;

    static asFormGroup(estudiosCapacitacion: EstudiosCapacitacion): FormGroup {
        const fg = new FormGroup({
            acreditaDocumento: new FormControl(estudiosCapacitacion.acreditaDocumento),
            codigoCriterio: new FormControl(estudiosCapacitacion.codigoCriterio),
            criterioPuntuacion: new FormControl(estudiosCapacitacion.criterioPuntuacion),
            descripcionCriterioPuntuacion: new FormControl(estudiosCapacitacion.descripcionCriterioPuntuacion),
            descripcionCriterio: new FormControl(estudiosCapacitacion.descripcionCriterio),
            idMaestroCriterioCalificacion: new FormControl(estudiosCapacitacion.idMaestroCriterioCalificacion),
            idMaestroCriterioCalificacionPadre: new FormControl(estudiosCapacitacion.idMaestroCriterioCalificacionPadre),
            idMaestroRubroCalificacion: new FormControl(estudiosCapacitacion.idMaestroRubroCalificacion),
            puntajeMaximo: new FormControl(estudiosCapacitacion.puntajeMaximo),
            puntajeMaximoUnidad: new FormControl(estudiosCapacitacion.puntajeMaximoUnidad),
            cantidadCertificados: new FormControl(estudiosCapacitacion.cantidadCertificados),
            puntaje: new FormControl(estudiosCapacitacion.puntaje),
            tienePadre: new FormControl(estudiosCapacitacion.tienePadre),
            tieneSubCriterio: new FormControl(estudiosCapacitacion.tieneSubCriterio),
            acreditaDocumentoSeleccionado: new FormControl(false),
            esSeleccionExcluyente: new FormControl(estudiosCapacitacion.esSeleccionExcluyente),
            tieneCantidad: new FormControl(estudiosCapacitacion.tieneCantidad)
        });

        fg.get('cantidadCertificados').valueChanges.subscribe(value => {
            if (value) {
                const criterioPuntuacion = fg.get('puntajeMaximoUnidad').value;
                const valorCalculado = criterioPuntuacion * value;
                const puntajeMaximo = fg.get('puntajeMaximo').value;
                console.log('value', value);
                console.log('criterioPuntuacion', criterioPuntuacion);
                console.log('valorCalculado', valorCalculado);
                if (puntajeMaximo >= valorCalculado) {
                    fg.patchValue({ puntaje: valorCalculado });
                } else if(valorCalculado > puntajeMaximo){
                    fg.patchValue({ puntaje: puntajeMaximo });
                }else {
                    fg.patchValue({ puntaje: null });
                }
            }
        });

        return fg;
    }
}
