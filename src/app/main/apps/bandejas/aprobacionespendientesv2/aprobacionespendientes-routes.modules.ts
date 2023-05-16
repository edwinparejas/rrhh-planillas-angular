import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AprobacionesResolver } from "app/core/data/resolvers/aprobaciones.resolver";
import { AprobacionespendientesComponent } from './aprobacionespendientes.component';
import { ConsultaestadoaprobacionComponent } from "./consultaestadoaprobacion/consultaestadoaprobacion.component";

export const routes: Routes = [
    {
        path: '',
        component: AprobacionespendientesComponent,
    },
    {
        path: "consultaestadoaprobacion",
        component: ConsultaestadoaprobacionComponent, 
        pathMatch :'full',        
    },

    {
        path: "aprobacionespendientes",
        component: AprobacionespendientesComponent, 
        pathMatch :'full',        
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SolicitudesRoutingModule { }
