import { FormControl, FormGroup, Validators } from '@angular/forms';

export class ExperienciaLaboral {

    acreditaDocumento: boolean;
    codigoCriterio: string;
    criterioPuntuacion: number;
    descripcionCriterio: string;
    descripcionCriterioPuntuacion: string;
    idMaestroCriterioCalificacion: number;
    idMaestroCriterioCalificacionPadre?: number;
    idMaestroRubroCalificacion: number;
    puntajeMaximo?: number;
    puntajeMaximoUnidad?: number;
    cantidadCertificados?: number;
    puntaje?: number;
    tienePadre: boolean;
    tieneSubCriterio: boolean;
    esSeleccionExcluyente: boolean;
    acreditaDocumentoSeleccionado: boolean;
    criterioPuntuacionSeleccionado: boolean;

    static asFormGroup(experiencia: ExperienciaLaboral): FormGroup {
        const fg = new FormGroup({
            acreditaDocumento: new FormControl(experiencia.acreditaDocumento),
            codigoCriterio: new FormControl(experiencia.codigoCriterio),
            criterioPuntuacion: new FormControl(experiencia.criterioPuntuacion),
            descripcionCriterio: new FormControl(experiencia.descripcionCriterio),
            descripcionCriterioPuntuacion: new FormControl(experiencia.descripcionCriterioPuntuacion),
            idMaestroCriterioCalificacion: new FormControl(experiencia.idMaestroCriterioCalificacion),
            idMaestroCriterioCalificacionPadre: new FormControl(experiencia.idMaestroCriterioCalificacionPadre),
            idMaestroRubroCalificacion: new FormControl(experiencia.idMaestroRubroCalificacion),
            puntajeMaximo: new FormControl(experiencia.puntajeMaximo),
            puntajeMaximoUnidad: new FormControl(experiencia.puntajeMaximoUnidad),
            cantidadCertificados: new FormControl(experiencia.cantidadCertificados),
            puntaje: new FormControl(experiencia.puntaje),
            tienePadre: new FormControl(experiencia.tienePadre),
            tieneSubCriterio: new FormControl(experiencia.tieneSubCriterio),
            esSeleccionExcluyente: new FormControl(experiencia.esSeleccionExcluyente),
            acreditaDocumentoSeleccionado: new FormControl(false),
            criterioPuntuacionSeleccionado: new FormControl(false)
        });

        fg.get('puntaje').valueChanges.subscribe(value => {
            console.log('puntaje', value)
            if (value && fg.get('puntajeMaximo').value < value) {
                fg.patchValue({ puntaje: null });
            }
        });

        fg.get('cantidadCertificados').valueChanges.subscribe(value => {
            if (value) {
                const criterioPuntuacion = fg.get('puntajeMaximoUnidad').value;
                const valorCalculado = criterioPuntuacion * value;
                const puntajeMaximo = fg.get('puntajeMaximo').value;
                console.log('value', value);
                console.log('criterioPuntuacion', criterioPuntuacion);
                console.log('valorCalculado', valorCalculado);
                console.log('puntajeMaximo', puntajeMaximo);
                if (puntajeMaximo >= valorCalculado) {
                    fg.patchValue({ puntaje: valorCalculado });
                    console.log('Entre 1');
                } else if(valorCalculado > puntajeMaximo){
                    fg.patchValue({ puntaje: puntajeMaximo });
                    console.log('Entre 2');
                }else {
                    fg.patchValue({ puntaje: null });
                    console.log('Entre 3');
                }
            }
        });

        return fg;
    }
}
