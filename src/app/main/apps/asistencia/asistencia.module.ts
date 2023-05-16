import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MineduComponentsModule } from '../components/minedu-components.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { AsistenciaComponent } from './asistencia.component';
import { AsistenciaRoutingModule } from './asistencia-routing.module';
import { ReporteAsistenciaModule } from './reporte-asistencia/reporte-asistencia.module';

import { ConsolidadoAprobacionAsistenciaComponent } from './consolidado-aprobacion/consolidado-aprobacion-asistencia/consolidado-aprobacion-asistencia.component';

// other components associated with modules / component

@NgModule({
  declarations: [ AsistenciaComponent],
  imports: [
    CommonModule,
    AsistenciaRoutingModule,
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    ReporteAsistenciaModule
  ]
})
export class AsistenciaModule { }
