import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CargaMasivaComponent } from "../../components/carga-masiva/carga-masiva.component";
import { PlanEstudioDetalleComponent } from "./plan-estudios/plan-estudio-detalle/plan-estudio-detalle.component";
import { PlanEstudiosComponent } from "./plan-estudios/plan-estudios.component";
import { CargaMasivaResolverService } from "app/core/data/resolvers/carga-masiva-type-resolver.service";

const routes: Routes = [
    {
        path: "plan-estudio",
        component: PlanEstudiosComponent,
        resolve: {},
    },
    {
        path: "plan-estudio/:idPlanEstudio",
        component: PlanEstudioDetalleComponent,
        resolve: {},
    },
    {
        path: "plan-estudio/:idPlanEstudio/:codigo/cargamasiva",
        component: CargaMasivaComponent,
        resolve: { CargaMasiva: CargaMasivaResolverService },
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CuadroHoras30512RoutingModule {}
