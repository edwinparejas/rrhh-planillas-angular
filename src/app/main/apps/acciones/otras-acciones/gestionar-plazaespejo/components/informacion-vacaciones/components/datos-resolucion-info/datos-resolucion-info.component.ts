import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'minedu-datos-resolucion-info',
    templateUrl: './datos-resolucion-info.component.html',
    styleUrls: ['./datos-resolucion-info.component.scss']
})
export class DatosResolucionInfoComponent implements OnInit {

    @Input("vacaciones")
    vacaciones: any;


    @Output('mostrarDocumentoEvent') mostrarDocumentoEvent = new EventEmitter<any>();


    constructor() { }

    ngOnInit(): void {
    }

    verDocumento(documento) {
        const tituloModal = 'Número Resolución';
        this.mostrarDocumentoEvent.emit({ documento, tituloModal });
    }

}
