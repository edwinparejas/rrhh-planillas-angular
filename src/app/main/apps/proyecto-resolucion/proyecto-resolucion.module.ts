import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../components/minedu-components.module";
import { ProyectoResolucionRoutingModule } from "./proyecto-resolucion-routing.module";
import { BandejaProyectoResolucionComponent } from "./bandeja-proyecto-resolucion/bandeja-proyecto-resolucion.component";
import { VistaProyectoComponent } from "./Components/editar-proyecto-resolucion/editar-proyecto-resolucion.component";
import { DetalleSeccionComponent } from "./Components/detalle-seccion/detalle-seccion.component";
import { DetalleSeccionComiteComponent } from "./Components/detalle-seccion-comite/detalle-seccion-comite.component";
import { DetalleSeccionCronogramaComponent } from "./Components/detalle-seccion-cronograma/detalle-seccion-cronograma.component";
import { DetalleSeccionVinculacionComponent } from "./Components/detalle-seccion-vinculacion/detalle-seccion-vinculacion.component";
import { DetalleSeccionPronoeiComponent } from "./Components/detalle-seccion-pronoei/detalle-seccion-pronoeicomponent";
import { DynamicHostDirective } from "./Components/directive/dynamic-host.directive";
import { DynamicComponent } from "./Components/dynamic/dynamic.component";
import { DynamicBodyComponent } from "./Components/dynamic-body/dynamic-body.component";
import { EliminarProyectoResolucionComponent } from "./Components/eliminar-proyecto-resolucion/eliminar-proyecto-resolucion.component";
import { BuscadorCodigoPlazaComponent } from "./Components/buscador-codigo-plaza/buscador-codigo-plaza.component";
import { BuscadorServidorPublicoComponent } from "./Components/buscador-servidor-publico/buscador-servidor-publico.component";
import { BuscarCentroTrabajoComponent } from "./Components/buscador-centro-trabajo/buscador-centro-trabajo.component";
import { DetalleSeccionDesplazamientoComponent } from "./Components/detalle-seccion-desplazamiento/detalle-seccion-desplazamiento.component";
import { ModalMotivoEliminacionComponent } from "./Components/modal-motivo-eliminacion/modal-motivo-eliminacion.component";
import { DetalleSeccionDesvinculacionComponent } from "./Components/detalle-seccion-desvinculacion/detalle-seccion-desvinculacion.component";
import { MainComponent } from "./Components/main/main.component";


@NgModule({
    declarations: [
        MainComponent,
        BandejaProyectoResolucionComponent,
        VistaProyectoComponent,
        DetalleSeccionComponent,
        DetalleSeccionComiteComponent,
        DetalleSeccionCronogramaComponent,
        DetalleSeccionVinculacionComponent,
        DetalleSeccionPronoeiComponent,
        DynamicHostDirective,
        DynamicComponent,
        DynamicBodyComponent,
        EliminarProyectoResolucionComponent,
        BuscadorCodigoPlazaComponent,
        BuscadorServidorPublicoComponent,
        BuscarCentroTrabajoComponent,
        DetalleSeccionDesplazamientoComponent,
        ModalMotivoEliminacionComponent,
        DetalleSeccionDesvinculacionComponent
    ],
    entryComponents: [DynamicComponent, DynamicBodyComponent],
    imports: [
        CommonModule,
        MaterialModule,
        ProyectoResolucionRoutingModule,
        MaterialModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
    ],
})
export class ProyectoResolucionModule {}
