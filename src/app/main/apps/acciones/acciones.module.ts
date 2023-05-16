import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccionesRoutingModule } from './acciones-routing.module';
import { AccionesComponent } from './acciones.component';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from '../components/minedu-components.module';
import { ConformidadAdjudicacionComponent } from './components/conformidad-adjudicacion/conformidad-adjudicacion.component';
import { ObservarAdjudicacionComponent } from './components/observar-adjudicacion/observar-adjudicacion.component';
import { InformacionVinculacionComponent } from './components/informacion-vinculacion/informacion-vinculacion.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscarPersonaComponent } from './components/buscar-persona/buscar-persona.component';
// import { GestionarVinculacionComponent } from './gestionar-vinculacion/gestionar-vinculacion.component';


@NgModule({
  declarations: [
    AccionesComponent,
    ConformidadAdjudicacionComponent,
    ObservarAdjudicacionComponent,
    InformacionVinculacionComponent,
    BuscarPlazaComponent,
    BuscarCentroTrabajoComponent,
    BuscarPersonaComponent
  ],
  imports: [
    CommonModule,
    AccionesRoutingModule,
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ]
})
export class AccionesModule { }
