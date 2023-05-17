import { NgModule } from "@angular/core";
import { PlanillaAfpComponent } from "./planilla-afp/planilla-afp.component";
import { PlanillaHaberesComponent } from "./planilla-haberes/planilla-haberes.component";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MaterialModule } from "app/material/material.module";
import { Routes, RouterModule } from "@angular/router";
import { MineduComponentsModule } from "../../components/minedu-components.module";
import { ModalHaberesDescuentosComponent } from "./planilla-haberes/modal-haberes-descuentos/modal-haberes-descuentos.component";
import { CommonModule } from "@angular/common";
import { ModalAfpComponent } from './planilla-afp/modal-afp/modal-afp.component';

const routes: Routes = [
    {
        path: "",
        component: PlanillaHaberesComponent,
    },
    {
        path: "haberes",
        component: PlanillaHaberesComponent,
    },
    {
        path: "afp",
        component: PlanillaAfpComponent,
    },
];

@NgModule({
    declarations: [
        PlanillaHaberesComponent,
        PlanillaAfpComponent,
        ModalHaberesDescuentosComponent,
        ModalAfpComponent,
    ],
    imports: [
        CommonModule,
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
    ],
})
export class PlanillaMaestrosModule {}
