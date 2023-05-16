import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';


@Component({
    selector: 'minedu-detalle-seccion-desplazamiento',
    templateUrl: './detalle-seccion-desplazamiento.component.html',
    styleUrls: ['./detalle-seccion-desplazamiento.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
})
export class DetalleSeccionDesplazamientoComponent implements OnInit {


    selection = new SelectionModel<any>(true, []);
    @Input() detalleVistaProyecto: any[];
    sectionRows: any[];

    constructor() { }

    ngOnInit(): void {
        this.sectionRows = this.detalleVistaProyecto.map((detalle, x) => {

            const esCabecera = detalle.etiquetaCampo == 'CABECERA' || detalle.etiquetaCampo == 'CABECERA_DATOS';
            const rows = JSON.parse(detalle.valorCampoFormateado);

            return rows.map((row, y) => {
                let value = row;
                let style = 'normal';
                if (esCabecera || y == 0 || value == ':') style = 'bold';
                if (y > 1 && value == '') value = 'NO REGISTRADO';

                return { style, value };
            });
        });
    }
}