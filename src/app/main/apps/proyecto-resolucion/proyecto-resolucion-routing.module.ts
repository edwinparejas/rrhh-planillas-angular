import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "app/core/guard/auth.guard";
import { BandejaProyectoResolucionComponent } from "./bandeja-proyecto-resolucion/bandeja-proyecto-resolucion.component";
import { MainComponent } from "./Components/main/main.component";


const routes: Routes = [
    {
        path: "",
        component: MainComponent,
        children: [
            { 
                path: "", 
                component: BandejaProyectoResolucionComponent,
            }
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProyectoResolucionRoutingModule {}
