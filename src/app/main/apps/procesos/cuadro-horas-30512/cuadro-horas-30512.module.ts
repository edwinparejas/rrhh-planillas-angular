import { DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MaterialModule } from "app/material/material.module";
import { MineduComponentsModule } from "../../components/minedu-components.module";
import { CuadroHoras30512RoutingModule } from "./cuadro-horas-30512-routing.module";
import { ModalAgregarPlanComponent } from "./plan-estudios/modal-agregar-plan/modal-agregar-plan.component";
import { ModalCancelarVigenciaPlanComponent } from "./plan-estudios/modal-cancelar-vigencia-plan/modal-cancelar-vigencia-plan.component";
import { FormBuscarPlanDetalleComponent } from "./plan-estudios/plan-estudio-detalle/form-buscar-plan-detalle/form-buscar-plan-detalle.component";
import { ModalVerCompetenciaComponent } from "./plan-estudios/plan-estudio-detalle/modal-ver-competencia/modal-ver-competencia.component";
import { ModalVerFormacionComponent } from "./plan-estudios/plan-estudio-detalle/modal-ver-formacion/modal-ver-formacion.component";
import { PlanEstudioDetalleComponent } from "./plan-estudios/plan-estudio-detalle/plan-estudio-detalle.component";
import { PlanEstudiosComponent } from "./plan-estudios/plan-estudios.component";

@NgModule({
    declarations: [
        PlanEstudiosComponent,
        ModalAgregarPlanComponent,
        ModalCancelarVigenciaPlanComponent,
        PlanEstudioDetalleComponent,
        FormBuscarPlanDetalleComponent,
        ModalVerCompetenciaComponent,
        ModalVerFormacionComponent,
    ],
    imports: [
        MaterialModule,
        CuadroHoras30512RoutingModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
    ],
    providers: [DatePipe],
})
export class CuadroHorasModule30512 {}
