import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../../components/minedu-components.module";
import { LicenciasOtrasComponent } from "./licencias-otras.component";
import { LicenciasOtrasRoutingModule } from "./licencias-otras-routing.module";
import { ControlLicenciaModule } from "./control-licencia/control-licencia.module";
import { DocumentosSustentoComponent } from '../components/documentos-sustento/documentos-sustento.component';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule,
        LicenciasOtrasRoutingModule,
        MaterialModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        ControlLicenciaModule,               
    ],

    declarations: [LicenciasOtrasComponent],
})
export class LicenciasOtrasModule { }
