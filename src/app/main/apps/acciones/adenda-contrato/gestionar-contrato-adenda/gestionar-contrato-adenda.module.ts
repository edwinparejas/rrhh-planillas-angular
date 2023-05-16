import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduComponentsModule } from "app/main/apps/components/minedu-components.module";
import { MaterialModule } from "app/material/material.module";
import { GestionContratoAdenda } from "./gestionar-contrato-adenda.component";

const routes: Routes = [
    {
        path: 'accioncontrato/:tipo/:accion/:id_gestion_contrato',
        component: GestionContratoAdenda,
        resolve: {}
    },
    {
      path: 'agregarcontrato/:tipo',
      component: GestionContratoAdenda,
      resolve: {
      }
    },
    {
        path: 'accionadenda/:tipo/:accion/:id_gestion_adenda',
        component: GestionContratoAdenda,
        resolve: {}
    },
    {
      path: 'agregaradenda/:tipo/:id_gestion_contrato',
      component: GestionContratoAdenda,
      resolve: {
      }
    }
]

@NgModule({
    declarations: [GestionContratoAdenda],
    imports: [
      MaterialModule,
      RouterModule.forChild(routes),
      MineduSharedModule,
      MineduSidebarModule,
      MineduComponentsModule
    ]
  })
  export class GestionarContratoAdendaModule { }
  