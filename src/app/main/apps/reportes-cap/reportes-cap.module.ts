import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../components/minedu-components.module';
import { DatePipe } from '@angular/common';
import { CuadroAsignacionPersonalComponent } from './cuadro-asignacion-personal/cuadro-asignacion-personal.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { ConsolidadoCentroRegimenComponent } from './consolidado-centro-regimen/consolidado-centro-regimen.component';
import { ConsolidadoCentroCargoComponent } from './consolidado-centro-cargo/consolidado-centro-cargo.component';

const routes: Routes = [
  {
    path: 'cap',
    component: CuadroAsignacionPersonalComponent
  },
  {
    path: 'csp',
    component: ConsolidadoCentroRegimenComponent
  },
  {
    path: 'cs',
    component: ConsolidadoCentroCargoComponent
  }
];

@NgModule({
  declarations: [
    CuadroAsignacionPersonalComponent,
    ConsolidadoCentroRegimenComponent,
    ConsolidadoCentroCargoComponent,
    BuscarCentroTrabajoComponent
  ],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ],
  providers: [
    DatePipe,
  ]
})
export class ReportesCAPModule { }
