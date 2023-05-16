import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'minedu-datos-resolucion',
    templateUrl: './datos-resolucion.component.html',
    styleUrls: ['./datos-resolucion.component.scss']
})
export class DatosResolucionComponent implements OnInit {
    @Input('accionPersonal')
    accionPersonal: any;

    @Output('mostrarDocumentoEvent') mostrarDocumentoEvent = new EventEmitter<any>();


    constructor() { }

    ngOnInit(): void {
    }

    verDocumento(documento) {
        const tituloModal = 'Número Resolución';
        this.mostrarDocumentoEvent.emit({ documento, tituloModal });
    }


}
