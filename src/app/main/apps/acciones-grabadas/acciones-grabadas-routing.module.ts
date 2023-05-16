import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BandejaAccionesGrabadasComponent } from "./bandeja-acciones-grabadas/bandeja-acciones-grabadas.component";
import { MainComponent } from "./Components/main/main.component";

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            {
                path: '',
                component: BandejaAccionesGrabadasComponent
            },
           
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AccionesGrabadasRoutingModule {}