import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AbandonoCargoComponent } from './abandono-cargo.component';
import { MaterialModule } from 'app/material/material.module';
import { RouterModule, Routes } from '@angular/router';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { BuscadorPersonaComponent } from './components/buscador-persona/buscador-persona.component';
import { AtencionModule } from './atencion/atencion.module';
import { RegistroModule } from './registro/registro.module';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';


const routes: Routes = [
  {
    path: '',
    component: AbandonoCargoComponent,
    resolve: {
    }
  }
];

@NgModule({
  declarations: [
    AbandonoCargoComponent, BuscadorPersonaComponent, BuscarPlazaComponent, BuscarCentroTrabajoComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    AtencionModule,
    RegistroModule
  ],
  providers: [
    DatePipe
  ]
})
export class AbandonoCargoModule { }
