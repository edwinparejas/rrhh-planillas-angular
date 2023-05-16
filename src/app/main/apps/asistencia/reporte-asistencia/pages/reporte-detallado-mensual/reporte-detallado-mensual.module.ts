import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "app/main/apps/components/minedu-components.module";
import { ReporteDetalladoMensualComponent } from "./container/reporte-detallado-mensual.component";
import { ReporteDetalladoMensualRoutingModule } from "../../../reporte-asistencia/pages/reporte-detallado-mensual/reporte-detallado-mensual-routing.module";

@NgModule({
    declarations: [ReporteDetalladoMensualComponent],
    imports: [
        CommonModule,
        MaterialModule,
        RouterModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        ReporteDetalladoMensualRoutingModule,
    ],
})
export class ReporteDetalladoMensualModule {}
