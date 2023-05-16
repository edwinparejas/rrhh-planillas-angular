import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'minedu-datos-personales-info',
    templateUrl: './datos-personales-info.component.html',
    styleUrls: ['./datos-personales-info.component.scss']
})
export class DatosPersonalesInfoComponent implements OnInit {

    @Input('servidorPublico')
    servidorPublico: any;

    @Input('titulo')
    titulo: string = null;

    constructor() { }

    ngOnInit(): void {
    }
}
