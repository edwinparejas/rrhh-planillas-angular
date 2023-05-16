import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ReporteDetalladoMensualComponent } from "./container/reporte-detallado-mensual.component";

const routes: Routes = [
    {
        path: "",
        component: ReporteDetalladoMensualComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteDetalladoMensualRoutingModule {}
