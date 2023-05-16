import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduComponentsModule } from "app/main/apps/components/minedu-components.module";
import { MaterialModule } from "app/material/material.module";
import { BandejaAdendaComponent } from "./bandeja-adenda.component";

const routes: Routes = [
    {
        path: 'bandeja-adenda/:id_gestion_contrato',
        component: BandejaAdendaComponent,
        resolve: {}
    }
]

@NgModule({
    declarations: [BandejaAdendaComponent],
    imports: [
      MaterialModule,
      RouterModule.forChild(routes),
      MineduSharedModule,
      MineduSidebarModule,
      MineduComponentsModule
    ]
  })
  export class BandejaAdendaModule { }
  