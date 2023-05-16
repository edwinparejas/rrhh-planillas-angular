import { FormControl, FormGroup, Validators } from '@angular/forms';

export class Impedimento{

    acreditaDocumento: boolean;
    codigoCriterio: string;
    descripcionCriterio: string;
    idMaestroCriterioCalificacion: number;
    idMaestroCriterioCalificacionPadre?: number;
    idMaestroRubroCalificacion: number;
    puntajeMaximo?: number;
    puntaje?: number;
    tienePadre: boolean;
    tieneSubCriterio: boolean;
    acreditaDocumentoSeleccionado: boolean;
    esSeleccionExcluyente: boolean;

    static asFormGroup(impedimento: Impedimento): FormGroup {
        const fg = new FormGroup({
            acreditaDocumento: new FormControl(false),
            codigoCriterio: new FormControl(impedimento.codigoCriterio),
            descripcionCriterio: new FormControl(impedimento.descripcionCriterio),
            idMaestroCriterioCalificacion: new FormControl(impedimento.idMaestroCriterioCalificacion),
            idMaestroCriterioCalificacionPadre: new FormControl(impedimento.idMaestroCriterioCalificacionPadre),
            idMaestroRubroCalificacion: new FormControl(impedimento.idMaestroRubroCalificacion),
            puntajeMaximo: new FormControl(impedimento.puntajeMaximo),
            puntaje: new FormControl(impedimento.puntaje),
            tienePadre: new FormControl(impedimento.tienePadre),
            tieneSubCriterio: new FormControl(impedimento.tieneSubCriterio),
            esSeleccionExcluyente: new FormControl(impedimento.esSeleccionExcluyente),
            acreditaDocumentoSeleccionado: new FormControl(false)
        });

        return fg;
    }
}
