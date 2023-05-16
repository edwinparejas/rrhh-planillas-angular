import { Component, OnInit, Input } from "@angular/core";
// templateUrl: './dynamic.component.html',
// styleUrls: ['./dynamic.component.scss']
@Component({
    selector: "minedu-dynamic",
    template: `
        <style type="text/css">
            table {
                width: 100%;
                margin-top: 10px;
                border: 1px solid black;
                border-collapse: collapse;
                padding-left: 10px;
            }
            table tr:nth-child(even) {
                background-color: #eee;
            }
            table tr:nth-child(odd) {
                background-color: #fff;
            }
            .cell-cabecera {
                position: relative;
                font-weight: bold;
                border: 1px solid rgba(179, 179, 176, 0.5) !important;
                padding-left: 10px;
                width: 25%;
            }
            .cell-detalle {
                position: relative;
                border: 1px solid rgba(179, 179, 176, 0.5) !important;
                padding-left: 10px;
                width: 75%;
            }
            .fieldset {
                position: relative;
                border: 1px solid rgba(0, 115, 183, 0.4) !important;
                width: 100%;
                padding-left: 3px;
                margin-left: 3px;
                padding-right: 3px;
                color: #333;
                border-radius: 5px;

                margin-top: 5px;
                margin-bottom: 15px;
                padding-bottom: 15px;
                /* font-family: Helvetica, Arial, sans-serif; */
                font-family: "Roboto-regular", Helvetica, Arial, sans-serif !important;
            }
            .text-bold {
                font-family: "Roboto-bold", Helvetica, Arial, sans-serif;
            }
            .fieldset h1 {
                position: absolute;
                top: 0;
                font-size: 12px;
                line-height: 1;
                margin: -8px 0 0;
                color: #0073b7 !important;
                background: #fff;
                padding: 0 3px;
            }
            .title-secciones {
                position: relative;
                font-weight: bold;
                padding-left: 10px;
                width: 100%;
            }
        </style>
        <div *ngFor="let seccion of secciones">
            <section class="fieldset" *ngIf="!seccion.ocultarSeccion">
                <h1>{{ seccion.etiquetaSeccion }}</h1>
                <minedu-dynamic-body
                    [secciones]="seccion.secciones"
                    [codigoGrupoAccion]="codigoGrupoAccion"
                ></minedu-dynamic-body>
            </section>
        </div>
    `,
})
export class DynamicComponent implements OnInit {
    @Input() secciones;
    @Input() codigoGrupoAccion:number;
    constructor() {}
    ngOnInit(): void {}
}
