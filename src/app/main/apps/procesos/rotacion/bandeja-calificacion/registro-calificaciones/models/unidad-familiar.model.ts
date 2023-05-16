import { FormControl, FormGroup, Validators } from '@angular/forms';

export class UnidadFamiliar{

    acreditaDocumento: boolean;
    codigoCriterio: string;
    descripcionCriterio: string;
    idMaestroCriterioCalificacion: number;
    idMaestroCriterioCalificacionPadre?: number;
    idMaestroRubroCalificacion: number;
    puntajeMaximo?: number;
    puntajeMaximoUnidad?: number;
    puntaje?: number;
    tienePadre: boolean;
    tieneSubCriterio: boolean;
    acreditaDocumentoSeleccionado: boolean;
    esSeleccionExcluyente: boolean;

    static asFormGroup(unidadFamiliar: UnidadFamiliar): FormGroup {
        const fg = new FormGroup({
            acreditaDocumento: new FormControl(unidadFamiliar.acreditaDocumento),
            codigoCriterio: new FormControl(unidadFamiliar.codigoCriterio),
            descripcionCriterio: new FormControl(unidadFamiliar.descripcionCriterio),
            idMaestroCriterioCalificacion: new FormControl(unidadFamiliar.idMaestroCriterioCalificacion),
            idMaestroCriterioCalificacionPadre: new FormControl(unidadFamiliar.idMaestroCriterioCalificacionPadre),
            idMaestroRubroCalificacion: new FormControl(unidadFamiliar.idMaestroRubroCalificacion),
            puntajeMaximo: new FormControl(unidadFamiliar.puntajeMaximo),
            puntajeMaximoUnidad: new FormControl(unidadFamiliar.puntajeMaximoUnidad),
            puntaje: new FormControl(unidadFamiliar.puntaje),
            tienePadre: new FormControl(unidadFamiliar.tienePadre),
            tieneSubCriterio: new FormControl(unidadFamiliar.tieneSubCriterio),
            esSeleccionExcluyente: new FormControl(unidadFamiliar.esSeleccionExcluyente),
            acreditaDocumentoSeleccionado: new FormControl(false)
        });

        // fg.get('puntaje').valueChanges.subscribe(value => {
        //     if (value && fg.get('puntajeMaximo').value < value) {
        //         fg.patchValue({ puntaje: null });
        //     }
        // });

        return fg;
    }
}
