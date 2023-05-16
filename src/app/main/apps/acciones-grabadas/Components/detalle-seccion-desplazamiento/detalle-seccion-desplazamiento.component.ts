import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { SelectionModel } from '@angular/cdk/collections';

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
        console.log(this.detalleVistaProyecto);
        this.sectionRows = this.detalleVistaProyecto.map((detalle, x) => {

            const esCabecera = detalle.nombreCampo == 'CABECERA' || detalle.nombreCampo == 'CABECERA_DATOS';
            const rows = JSON.parse(detalle.valorTexto);

            return rows.map((row, y) => {
                let value = row;
                let style = 'normal';
                if (esCabecera || y == 0 || value == ':') style = 'bold';
                if (y > 1 && value == '') value = 'NO REGISTRADO';

                return { style, value, esCabecera };
            });
        });
    }
}
