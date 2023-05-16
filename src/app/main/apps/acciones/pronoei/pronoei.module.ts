import { NgModule } from '@angular/core';
import { PronoeiRoutingModule } from './pronoei-routing.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { PronoeiNewComponent } from './components/pronoei-new/pronoei-new.component';
import { MaterialModule } from '../../../../material/material.module';
import { PronoeiBandejaGridComponent } from './components/partials/pronoei-bandeja-grid/pronoei-bandeja-grid.component';
import { PronoeiBandejaComponent } from './components/pronoei-bandeja/pronoei-bandeja.component';
import { InformacionCompletaPopupComponent } from './components/popups/informacion-completa-popup/informacion-completa-popup.component';
import { GenerarProyectoComponent } from './components/popups/generar-proyecto/generar-proyecto.component';
import { BasicoDirective } from './_utils/basico.directive';
import { CommonModule } from '@angular/common';
import { VerInformacionSustentoComponent } from './components/popups/ver-informacion-sustento/ver-informacion-sustento.component';
import { BuscarPersonaComponent } from './components/popups/buscar-persona/buscar-persona.component';
import { BuscarCentroTrabajoComponent } from './components/popups/buscar-centro-trabajo/buscar-centro-trabajo.component';

@NgModule({
  declarations: [
    BasicoDirective,
    PronoeiNewComponent,
    PronoeiBandejaComponent,
    PronoeiBandejaGridComponent,
    GenerarProyectoComponent,
    InformacionCompletaPopupComponent,
    VerInformacionSustentoComponent,
    BuscarPersonaComponent,
    BuscarCentroTrabajoComponent
  ],
  imports: [
    CommonModule,
    PronoeiRoutingModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    MaterialModule
  ]
})
export class PronoeiModule { }
