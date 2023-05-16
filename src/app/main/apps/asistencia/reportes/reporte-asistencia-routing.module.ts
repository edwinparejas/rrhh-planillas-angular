import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
    {
        path: "",
        children: [
            {
                path: "detallado/:id",
                loadChildren: () =>
                    import(
                        "./pages/reporte-detallado-mensual/reporte-detallado-mensual.module"
                    ).then((m) => m.ReporteDetalladoMensualModule),
            },
            {
                path: "consolidado/:id",
                loadChildren: () =>
                    import(
                        "./pages/reporte-consolidado-mensual/reporte-consolidado-mensual.module"
                    ).then((m) => m.ReporteConsolidadoMensualModule),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReporteAsistenciaRouting {}
