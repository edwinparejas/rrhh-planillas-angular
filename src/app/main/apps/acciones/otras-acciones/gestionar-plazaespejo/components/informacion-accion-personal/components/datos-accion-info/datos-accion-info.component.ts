import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DesplazamientoAccionCodigoEnum, DesplazamientoRegimenLaboralEnum } from '../../../../types/Enums';

@Component({
    selector: 'minedu-datos-accion-info',
    templateUrl: './datos-accion-info.component.html',
    styleUrls: ['./datos-accion-info.component.scss']
})
export class DatosAccionInfoComponent implements OnInit {

    @Input('accionPersonal')
    accionPersonal: any;
    @Output('mostrarDocumentoEvent') mostrarDocumentoEvent = new EventEmitter<any>();

    categoriaRemu: string;
    ASCENSOESCALAMAGISTERIAL: number = DesplazamientoAccionCodigoEnum.ASCENSOESCALAMAGISTERIAL;

    constructor() { }

    ngOnInit(): void {
        const idRegimenLaboral = this.accionPersonal?.datosAccion?.idRegimenLaboral;
        this.categoriaRemu = "Categoría Remunerativa";
        if (idRegimenLaboral === DesplazamientoRegimenLaboralEnum.LEY_29944) {
            this.categoriaRemu = "Escala Magisterial"
        }
    }

    verDocumento(documento) {
        const tituloModal = 'Número Resolución';
        this.mostrarDocumentoEvent.emit({ documento, tituloModal });
    }

}
