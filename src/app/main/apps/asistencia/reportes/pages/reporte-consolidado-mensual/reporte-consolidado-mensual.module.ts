import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "app/main/apps/components/minedu-components.module";
import { ReporteConsolidadoMensualComponent } from "./container/reporte-consolidado-mensual.component";
import { ReporteConsoliadoMensualRoutingModule } from './reporte-consolidado-mensual-routing.module';

@NgModule({
    declarations: [ReporteConsolidadoMensualComponent],
    imports: [
        CommonModule,
        MaterialModule,
        RouterModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        ReporteConsoliadoMensualRoutingModule
    ],
})
export class ReporteConsolidadoMensualModule {}
