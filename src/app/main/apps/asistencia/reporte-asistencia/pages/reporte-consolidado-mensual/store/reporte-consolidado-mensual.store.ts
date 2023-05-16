import { Store } from "@minedu/store/store";
import {
    InitialState,
    ReporteConsolidadoModel,
} from "./reporte-consolidado-mensual.model";
import { Injectable } from "@angular/core";
import { DataService } from "app/core/data/data.service";
import { ReporteConsolidadoMensualSource } from "./source/reporte-consolidado-mensual.source";

@Injectable({
    providedIn: "root",
})
export class ReporteConsolidadoMensualStore extends Store<
    ReporteConsolidadoModel
> {
    reporteConsolidadoMensualSource: ReporteConsolidadoMensualSource;

    constructor(dataService: DataService) {
        super(InitialState);

        this.reporteConsolidadoMensualSource = new ReporteConsolidadoMensualSource(
            this.buildScopedGetState("containerReporteConsolidadoModel"),
            this.buildScopedSetState("containerBandejaConsolidadoModel"),
            dataService
        );
    }
}
