import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { MaterialModule } from 'app/material/material.module';
import { BuscarVinculacionesComponent } from './components/buscar-vinculaciones/buscar-vinculaciones.component';
import { RechazarAutoizacionComponent } from './components/rechazar-autorizacion/rechazar-autorizacion.component';
import { SolicitarAutorizacionComponent } from './components/solicitar-informacion/solicitar-autorizacion.component';
import { DesvinculacionComponent } from './desvinculacion.component';
// import { MineduComponentsModule } from '../../components/minedu-components.module';

const routes: Routes = [
  
  {
    path: 'agregar/:tipo',
    component: DesvinculacionComponent,
    resolve: {
    }
  },
  {
    path: 'modificar/:tipo/:id',
    component: DesvinculacionComponent,
    resolve: {
    }
  }
  ,
  {
    path: 'informacion/:tipo/:accion/:id',
    component: DesvinculacionComponent,
    resolve: {
    }
  }
  ,
  {
    path: 'accion/:tipo/:id',
    component: DesvinculacionComponent,
    resolve: {
    }
  }
  ,
  {
    path: 'agregar',
    component: DesvinculacionComponent,
    resolve: {
    }
  }

];

@NgModule({
  declarations: [DesvinculacionComponent, SolicitarAutorizacionComponent, BuscarVinculacionesComponent, RechazarAutoizacionComponent],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ]
})
export class DesvinculacionModule { }

