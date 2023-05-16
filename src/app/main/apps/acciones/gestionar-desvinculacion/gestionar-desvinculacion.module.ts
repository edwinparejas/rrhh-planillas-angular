import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';

import { BuscarPersonaComponent } from './components/buscar-persona/buscar-persona.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { GestionarDesvinculacionComponent } from './gestionar-desvinculacion.component';
import { DesvinculacionModule } from './desvinculacion/desvinculacion.module';
import { VerInformacionSustentoComponent } from './components/ver-informacion-sustento/ver-informacion-sustento.component';
import { GenerarProyectoComponent } from './components/generar-proyecto/generar-proyecto.component';

const routes: Routes = [
  {
    path: '',
    component: GestionarDesvinculacionComponent,
    resolve: {
    }
  }
];

@NgModule({
  declarations: [GestionarDesvinculacionComponent, BuscarPlazaComponent, BuscarCentroTrabajoComponent,  
    BuscarPersonaComponent, GenerarProyectoComponent, VerInformacionSustentoComponent],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    DesvinculacionModule
  ]
})
export class GestionarDesvinculacionModule { }