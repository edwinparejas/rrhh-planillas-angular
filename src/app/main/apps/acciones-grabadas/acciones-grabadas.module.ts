import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { AccionesGrabadasRoutingModule } from "./acciones-grabadas-routing.module";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../components/minedu-components.module";
import { BandejaAccionesGrabadasComponent } from "./bandeja-acciones-grabadas/bandeja-acciones-grabadas.component";
import { BuscarDocumentoIdentidadComponent } from "./Components/buscar-documento-identidad/buscar-documento-identidad.component";
import { BuscarPlazaComponent } from "./Components/buscar-plaza/buscar-plaza.component";
import { CriteriosBusquedaAccionesGrabadasComponent } from "./Components/criterios-busqueda-acciones-grabadas/criterios-busqueda-acciones-grabadas.component";
import { DetalleSeccionComiteComponent } from "./Components/detalle-seccion-comite/detalle-seccion-comite.component";
import { DetalleSeccionCronogramaComponent } from "./Components/detalle-seccion-cronograma/detalle-seccion-cronograma.component";
import { DetalleSeccionDesplazamientoComponent } from "./Components/detalle-seccion-desplazamiento/detalle-seccion-desplazamiento.component";
import { DetalleSeccionDesvinculacionComponent } from "./Components/detalle-seccion-desvinculacion/detalle-seccion-desvinculacion.component";
import { DetalleSeccionVinculacionComponent } from "./Components/detalle-seccion-vinculacion/detalle-seccion-vinculacion.component";
import { ModalEliminarAccionGrabadaComponent } from "./Components/modal-eliminar-accion-grabada/modal-eliminar-accion-grabada.component";
import { ModalGenerarProyectoResolucionComponent } from "./Components/modal-generar-proyecto-resolucion/modal-generar-proyecto-resolucion.component";
import { ModalMotivoEliminacionComponent } from "./Components/modal-motivo-eliminacion/modal-motivo-eliminacion.component";
import { ModalVistaInformacionSustentoComponent } from "./Components/modal-vista-informacion-sustento/modal-vista-informacion-sustento.component";
import { ModalVistaInformacionComponent } from "./Components/modal-vista-informacion/modal-vista-informacion.component";
import { MainComponent } from "./Components/main/main.component";

@NgModule({    
  declarations:[
    MainComponent,
    BandejaAccionesGrabadasComponent,
    BuscarDocumentoIdentidadComponent,
    BuscarPlazaComponent,
    CriteriosBusquedaAccionesGrabadasComponent,
    DetalleSeccionComiteComponent,
    DetalleSeccionCronogramaComponent,
    DetalleSeccionDesplazamientoComponent,
    DetalleSeccionDesvinculacionComponent,
    DetalleSeccionVinculacionComponent,
    ModalEliminarAccionGrabadaComponent,
    ModalGenerarProyectoResolucionComponent,
    ModalMotivoEliminacionComponent,
    ModalVistaInformacionComponent,
    ModalVistaInformacionSustentoComponent
    ],
    imports: [
      CommonModule,
      AccionesGrabadasRoutingModule,
      MaterialModule,
      MineduSharedModule,
      MineduSidebarModule,
      MineduComponentsModule
    ]
  })
  export class AccionesGrabadasModule{}