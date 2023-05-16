import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionarPlazaespejoRoutingModule } from './gestionar-plazaespejo-routing.module';
import { GestionPlazaespejoComponent } from './gestion-plazaespejo.component';
import { CriterioBusquedaComponent } from './components/criterio-busqueda/criterio-busqueda.component';
import { GrillaActividadComponent } from './components/grilla-actividad/grilla-actividad.component';
import { MaterialModule } from 'app/material/material.module';
import { ContenedorActividadComponent } from './components/contenedor-actividad/contenedor-actividad.component';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { GrillaColumnaComponent } from './components/grilla-columna/grilla-columna.component';
import { TemplateDirective } from './directives/template.directive';
import { DateFormatPipe } from './Utils/shared/pipes/data-format.pipe';
import { FromControlComponent } from './components/form-control/from-control.component';
import { ModalObservacionComponent } from './components/modal-observacion/modal-observacion.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { VerMotivoObservacionComponent } from './components/ver-motivo-observacion/ver-motivo-observacion.component';
import { BuscarPersonaComponent } from './components/buscar-persona/buscar-persona.component';
import { MainComponent } from './components/main/main.component';
import { InformacionAccionPersonalModule } from './components/informacion-accion-personal/informacion-accion-personal.module';
import { InformacionLicenciasModule } from './components/informacion-licencias/informacion-licencias.module';
import { InformacionSancionModule } from './components/informacion-sancion/informacion-sancion.module';
import { InformacionVacacionesModule } from './components/informacion-vacaciones/informacion-vacaciones.module';


@NgModule({
  declarations: [
      GestionPlazaespejoComponent,
      CriterioBusquedaComponent,
      ContenedorActividadComponent,
      GrillaActividadComponent,
      GrillaColumnaComponent,
      TemplateDirective,
      DateFormatPipe,
      FromControlComponent,
      ModalObservacionComponent,
      BuscarCentroTrabajoComponent,
      BuscarPlazaComponent,
      VerMotivoObservacionComponent,
      BuscarPersonaComponent,
      MainComponent
  ],
  imports: [
    CommonModule,
    GestionarPlazaespejoRoutingModule,
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    InformacionAccionPersonalModule,
    InformacionLicenciasModule,
    InformacionSancionModule,
    InformacionVacacionesModule
  ]
  
})
export class GestionarPlazaespejoModule { }
