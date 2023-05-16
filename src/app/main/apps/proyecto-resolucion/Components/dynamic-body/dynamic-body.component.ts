import { Component, OnInit, Input } from "@angular/core";
import { TablaGrupoAccionCodigo } from "../../models/proyectoResolucion.model";

@Component({
    selector: "minedu-dynamic-body",
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
                padding-left: 10px;
                padding-right: 10px;
                color: #333;
                border-radius: 5px;
                padding-bottom: 10px;
                margin-top: 20px;
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

            .sub-titulo {
                cursor: pointer;
                color: #2196F3;
                padding-top: 2px;
                padding-bottom: -2px;
                margin: 1px;
            }
            .contenedor {
                
            }
        </style>

        <ng-container   *ngFor="let partesSeccion of secciones; let i = index">
            <ng-container   *ngFor="let seccion of partesSeccion; let j = index" >
            
                <ng-container *ngIf="seccion.idTipoSeccionVista == 155">
                    <p class="title-secciones">{{ seccion.etiquetaSeccion }}</p>                                        
                </ng-container>                
                
                <ng-container  *ngIf="seccion.idTipoSeccionVista == 154 && seccion.idTipoPresentacion == 150 ">
                  <div fxLayout="row" *ngIf="seccion.detalles">                        
                            
                        <!-- <div fxLayout="column" fxFlex="3%" class="pl-2 pr-2"> {{ j == 0 ? i + 1 : "" }} </div> -->
                        
                        <div fxLayout="column" fxFlex="100%" class="pl-2 pr-2"  >

                        <fieldset class="fieldset-border mb-2" fxFlex="100%">
                            <legend *ngIf="seccion.etiquetaSeccion != '' && codigoGrupoAccion != TablaGrupoAccionCodigoInterno.COMITE">
                                {{ seccion.etiquetaSeccion }} 
                            </legend>
                            <ng-container [ngSwitch]="true">
                                <ng-container *ngSwitchCase="codigoGrupoAccion == TablaGrupoAccionCodigoInterno.VINCULACION">
                                    <minedu-detalle-seccion-vinculacion style="margin-top: 10px;" [detalleVistaProyecto]="seccion.detalles">
                                    </minedu-detalle-seccion-vinculacion>
                                </ng-container>
                                <ng-container *ngSwitchCase="codigoGrupoAccion == TablaGrupoAccionCodigoInterno.DESVINCULACION">
                                    <minedu-detalle-seccion-desvinculacion style="margin-top: 10px;" [detalleVistaProyecto]="seccion.detalles">
                                    </minedu-detalle-seccion-desvinculacion>
                                </ng-container>
                                <ng-container *ngSwitchCase="codigoGrupoAccion == TablaGrupoAccionCodigoInterno.PRONOEI">
                                    <minedu-detalle-seccion-pronoei style="margin-top: 10px;" [detalleVistaProyecto]="seccion.detalles">
                                    </minedu-detalle-seccion-pronoei>
                                </ng-container>
                                <ng-container *ngSwitchCase="codigoGrupoAccion == TablaGrupoAccionCodigoInterno.COMITE">
                                    <minedu-detalle-seccion-comite style="margin-top: 10px;" [detalleVistaProyecto]="seccion.detalles">
                                    </minedu-detalle-seccion-comite>
                                </ng-container>
                                <ng-container *ngSwitchCase="codigoGrupoAccion == TablaGrupoAccionCodigoInterno.CRONOGRAMA">
                                    <minedu-detalle-seccion-cronograma style="margin-top: 10px;" [detalleVistaProyecto]="seccion.detalles">
                                    </minedu-detalle-seccion-cronograma>
                                </ng-container>       
                                
                                <ng-container *ngSwitchCase="codigoGrupoAccion == TablaGrupoAccionCodigoInterno.DESPLAZAMIENTO">
                                    <minedu-detalle-seccion-desplazamiento style="margin-top: 10px;" [detalleVistaProyecto]="seccion.detalles">
                                    </minedu-detalle-seccion-desplazamiento>
                                </ng-container>       
                                
                                <ng-container *ngSwitchDefault>
                                    <table>
                                        <tbody>                                   
                                            <tr *ngFor="let detalle of seccion.detalles">
                                                <td class="cell-cabecera"> {{ detalle.etiquetaCampo }}
                                                </td>
                                                <td class="cell-detalle"> {{ detalle.valorCampoFormateado }}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>                                        
                                </ng-container>    
                            </ng-container>
                        
                        </fieldset>




                            
                            
                        </div>                                
                  </div>
                </ng-container>

                <ng-container *ngIf="seccion.idTipoSeccionVista == 154 && seccion.idTipoPresentacion == 151">
                    <minedu-detalle-seccion style="margin-top: 10px;" [detalleVistaProyecto]="seccion.detalles">
                    </minedu-detalle-seccion>
                </ng-container>


                <minedu-dynamic-body [secciones]="seccion.secciones"></minedu-dynamic-body>
            </ng-container>
        </ng-container>
    `,
})
export class DynamicBodyComponent implements OnInit {
    @Input() secciones;
    @Input() codigoGrupoAccion:number;
    
    TablaGrupoAccionCodigoInterno=TablaGrupoAccionCodigo;
    constructor() {}
    ngOnInit(): void {}
}
