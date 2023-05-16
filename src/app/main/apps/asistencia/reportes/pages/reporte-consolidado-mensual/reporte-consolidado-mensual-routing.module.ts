import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ReporteConsolidadoMensualComponent } from "./container/reporte-consolidado-mensual.component";

const routes: Routes = [
    {
        path: "",
        component: ReporteConsolidadoMensualComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteConsoliadoMensualRoutingModule {}
