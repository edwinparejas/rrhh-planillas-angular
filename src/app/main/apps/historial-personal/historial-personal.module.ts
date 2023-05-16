import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../components/minedu-components.module";
import { HistorialPersonalComponent } from "./historial-personal.component";
import { HistorialPersonalRoutingModule } from "./historial-personal-routing.module";
import { ConsolidadoModule } from "./consolidado/consolidado.module";

@NgModule({
    declarations: [HistorialPersonalComponent],
    imports: [
      CommonModule,
      MaterialModule,
      HistorialPersonalRoutingModule,
      MineduSharedModule,
      MineduSidebarModule,
      MineduComponentsModule,
      ConsolidadoModule
    ]
  })
  export class HistorialPersonalModule{}