import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    {
        path: "maestros",
        // canActivate: [AuthGuard],
        loadChildren: () =>
            import("./maestros/planilla-maestros.module").then(
                (m) => m.PlanillaMaestrosModule
            ),
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PlanillaRoutingModule {}
