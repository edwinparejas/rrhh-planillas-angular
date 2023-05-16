import { FormControl, FormGroup, Validators } from '@angular/forms';

export class RequisitoGeneral{

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

    static asFormGroup(requisitoGeneral: RequisitoGeneral): FormGroup {
        const fg = new FormGroup({
            acreditaDocumento: new FormControl(false),
            codigoCriterio: new FormControl(requisitoGeneral.codigoCriterio),
            descripcionCriterio: new FormControl(requisitoGeneral.descripcionCriterio),
            idMaestroCriterioCalificacion: new FormControl(requisitoGeneral.idMaestroCriterioCalificacion),
            idMaestroCriterioCalificacionPadre: new FormControl(requisitoGeneral.idMaestroCriterioCalificacionPadre),
            idMaestroRubroCalificacion: new FormControl(requisitoGeneral.idMaestroRubroCalificacion),
            puntajeMaximo: new FormControl(requisitoGeneral.puntajeMaximo),
            puntaje: new FormControl(requisitoGeneral.puntaje),
            tienePadre: new FormControl(requisitoGeneral.tienePadre),
            tieneSubCriterio: new FormControl(requisitoGeneral.tieneSubCriterio),
            esSeleccionExcluyente: new FormControl(requisitoGeneral.esSeleccionExcluyente),
            acreditaDocumentoSeleccionado: new FormControl(false)
        });

        return fg;
    }
}
