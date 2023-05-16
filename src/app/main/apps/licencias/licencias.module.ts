import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LicenciasRoutingModule } from "./licencias-routing.module";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../components/minedu-components.module";
import { InformacionDocumentoSustentoComponent } from './components/informacion-documento-sustento/informacion-documento-sustento.component';
import { BuscarFamiliarServidorComponent } from './components/buscar-familiar-servidor/buscar-familiar-servidor.component';
import { SeleccionVinculacionComponent } from './components/seleccion-vinculacion/seleccion-vinculacion.component';

@NgModule({
    declarations: [InformacionDocumentoSustentoComponent, BuscarFamiliarServidorComponent, SeleccionVinculacionComponent],
    imports: [
        CommonModule,
        LicenciasRoutingModule,
        MaterialModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
    ],
})
export class LicenciasModule {}
