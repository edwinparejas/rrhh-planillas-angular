import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccionesComponent } from './acciones.component';

const routes: Routes = [
  {
    path: '',
    component: AccionesComponent,
    children: [
      { path: "", redirectTo: "vinculacion", pathMatch: "full" },
      { path: 'vinculacion', loadChildren: () => import('./gestionar-vinculacion/gestionar-vinculacion.module').then(m => m.GestionarVinculacionModule) },
      { path: 'desvinculacion', loadChildren: () => import('./gestionar-desvinculacion/gestionar-desvinculacion.module').then(m => m.GestionarDesvinculacionModule) },
      // { path: 'vinculacion', loadChildren: () => import('./vinculacion/vinculacion.module').then(m => m.VinculacionModule) },
      // { path: 'vinculacion/:id', loadChildren: () => import('./vinculacion/vinculacion.module').then(m => m.VinculacionModule) },
      { path: 'contratoadenda', loadChildren: () => import('./adenda-contrato/adenda-contrato.module').then(m => m.AdendaContratoModule) },
      { path: 'otrasacciones', loadChildren: () => import('./otras-acciones/otras-acciones.module').then(m => m.OtrasAccionesModule) },
      // { path: 'gestionar-vinculacion', loadChildren: () => import('./gestionar-vinculacion/gestionar-vinculacion.module').then(m => m.GestionarVinculacionModule) },
      { path: 'desplazamiento', loadChildren: () => import('./desplazamiento/desplazamiento.module').then(m => m.DesplazamientoModule) },
      { path: 'pronoei', loadChildren: () => import('./pronoei/pronoei.module').then(m => m.PronoeiModule) },
      { path: "beneficios", loadChildren: () => import("./beneficios/beneficios.module").then((m) => m.BeneficiosModule),},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccionesRoutingModule { }
