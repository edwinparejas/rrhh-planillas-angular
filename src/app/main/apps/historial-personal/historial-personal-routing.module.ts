import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HistorialPersonalComponent } from "./historial-personal.component";

const routes: Routes = [
    {        
        path: '',
        component: HistorialPersonalComponent,
        resolve: {
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HistorialPersonalRoutingModule {}