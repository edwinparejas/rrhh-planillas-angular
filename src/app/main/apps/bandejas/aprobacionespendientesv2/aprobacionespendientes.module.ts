import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../../components/minedu-components.module";
import { AprobacionespendientesComponent } from "./aprobacionespendientes.component";
import { SolicitudesRoutingModule } from "./aprobacionespendientes-routes.modules";
import { DatePipe } from "@angular/common";
import { MotivorechazoComponent } from "./motivorechazo/motivorechazo.component";
import { HistorialComponent } from "./historial/historial.component";
import { ConsultaestadoaprobacionComponent } from './consultaestadoaprobacion/consultaestadoaprobacion.component';
import { ModalRechazoComponent } from "./Components/modal-rechazo/modal-rechazo.component";


@NgModule({
    declarations: [
        AprobacionespendientesComponent,
        MotivorechazoComponent,
        HistorialComponent,
        ConsultaestadoaprobacionComponent,
        ModalRechazoComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        SolicitudesRoutingModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
    ],
    providers: [DatePipe],
})
export class AprobacionesPendientesV2Module {}
