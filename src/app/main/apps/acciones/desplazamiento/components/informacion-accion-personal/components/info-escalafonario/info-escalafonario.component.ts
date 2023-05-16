import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'minedu-info-escalafonario',
    templateUrl: './info-escalafonario.component.html',
    styleUrls: ['./info-escalafonario.component.scss']
})
export class InfoEscalafonarioComponent implements OnInit {
    @Input('servidorPublico')
    servidorPublico: any;

    @Input('titulo')
    titulo: string = null;

    @Output('mostrarDocumentoEvent') mostrarDocumentoEvent = new EventEmitter<any>();

    constructor() { }

    ngOnInit(): void { }   

    verInformeEscalafonario(documento: string) {
        const tituloModal = 'Informe Escalafonario';
        this.mostrarDocumentoEvent.emit({ documento, tituloModal });
    }



}
