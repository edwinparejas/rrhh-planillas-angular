import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { BandejasComponent } from './bandejas.component';

const routes: Routes = [
  {
    path: '',
    component: BandejasComponent,
    children: [
      { path: "actividades", loadChildren: () => import("./actividades/pendientes.module").then((m) => m.PendientesModule) },
      { path: "aprobacionespendientes", loadChildren: () => import("./aprobacionespendientesv2/aprobacionespendientes.module").then((m) => m.AprobacionesPendientesV2Module) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BandejasRoutingModule { }
