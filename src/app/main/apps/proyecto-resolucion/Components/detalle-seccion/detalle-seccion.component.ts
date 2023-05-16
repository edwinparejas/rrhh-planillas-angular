import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel, DataSource, CollectionViewer } from '@angular/cdk/collections';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from 'app/core/data/data.service';
import { disableDebugTools } from '@angular/platform-browser';

@Component({
    selector: 'minedu-detalle-seccion',
    templateUrl: './detalle-seccion.component.html',
    styleUrls: ['./detalle-seccion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class DetalleSeccionComponent implements OnInit {
    selection = new SelectionModel<any>(true, []);
    @Input() detalleVistaProyecto;
    dataObject: { id: number, valorCampoFormateado: string, etiquetaCampo: string, bold: number }[] = [];
    dataTable: { id: number, dataObject }[] = [];
    saltoLinea: boolean = false;
    constructor() { }
    ngOnInit(): void {
        let cantidad = 1;
        let apoyo = 1;
        this.detalleVistaProyecto.forEach(async (detalle) => {
            this.saltoLinea = (cantidad % 3 == 0 || this.detalleVistaProyecto.length - cantidad == 0 ? true : false);
            this.dataObject.push(
                {
                    id: cantidad,
                    valorCampoFormateado: detalle.valorCampoFormateado,
                    etiquetaCampo: detalle.etiquetaCampo,
                    bold: 1
                });

            if (this.saltoLinea) {
                this.dataTable.push({ id: apoyo, dataObject: this.dataObject });
                this.dataObject = [];
                apoyo = apoyo + 1;
                // cantidad=0;
            }
            cantidad = cantidad + 1;
        });
        console.log(this.dataTable);
    }
}

