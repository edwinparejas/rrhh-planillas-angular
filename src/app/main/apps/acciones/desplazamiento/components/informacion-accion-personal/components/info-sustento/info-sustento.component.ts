import { Component, Input, OnInit, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
    selector: 'minedu-info-sustento',
    templateUrl: './info-sustento.component.html',
    styleUrls: ['./info-sustento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class InfoSustentoComponent implements OnInit {

    @Input('accionPersonal')
    accionPersonal: any;

    @Output('mostrarDocumentoEvent')
    mostrarDocumentoEvent = new EventEmitter<any>();

    dataSource: MatTableDataSource<any>;

    displayedColumns: string[] = [
        'descripcionTipoDocumento',
        'numeroDocumentoSustento',
        'fechaEmision',
        'descripcionTipoFormato',
        'numeroFolios',
        'fechaRegistro',
        'opciones'
    ];

    constructor() { }

    ngOnInit(): void {
        if (this.accionPersonal?.documentosSustento?.length > 0) {
            this.dataSource = new MatTableDataSource(this.accionPersonal?.documentosSustento);            
        }
    }

    verDocumento(documento: string) {
        const tituloModal = 'Archivo Adjunto';
        this.mostrarDocumentoEvent.emit({ documento, tituloModal });
    }

}
