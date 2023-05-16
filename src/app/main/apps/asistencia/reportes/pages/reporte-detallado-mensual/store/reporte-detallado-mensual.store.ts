import { Store } from "@minedu/store/store";
import { Injectable } from "@angular/core";
import { DataService } from "app/core/data/data.service";
import { InitialState } from "./reporte-detallado-mensual.model";
import { ReporteDetalladoModel } from "./reporte-detallado-mensual.model";
import { ReporteDetalladoMensualSource } from "./source/reporte-detallado-mensual.source";

@Injectable({
    providedIn: "root",
})
export class ReporteDetalladoMensualStore extends Store<ReporteDetalladoModel> {
    reporteDetalladoMensualSource: ReporteDetalladoMensualSource;

    constructor(dataService: DataService) {
        super(InitialState);

        this.reporteDetalladoMensualSource = new ReporteDetalladoMensualSource(
            this.buildScopedGetState("containerReporteDetalladoModel"),
            this.buildScopedSetState("containerReporteDetalladoModel"),
            dataService
        );
    }
}
