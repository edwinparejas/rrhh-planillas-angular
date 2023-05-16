import { NgModule } from '@angular/core';
import { GestionarVinculacionComponent } from './gestionar-vinculacion.component';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { VinculacionModule } from './vinculacion/vinculacion.module';
import { GenerarProyectoComponent } from './components/generar-proyecto/generar-proyecto.component';
import { VerInformacionSustentoComponent } from './components/ver-informacion-sustento/ver-informacion-sustento.component';
import { BuscarPersonaComponent } from './components/buscar-persona/buscar-persona.component';
import { ModalDiferenciaPlazaComponent } from './components/modal-diferencia-plaza/modal-diferencia-plaza.component';
import { ListarPlazasComponent } from './components/listar-plazas/listar.plazas.components';

const routes: Routes = [
  {
    path: '',
    component: GestionarVinculacionComponent,
    resolve: {
    }
    // children: [
    //   {
    //     path: 'agregar', loadChildren: () => import('./vinculacion/vinculacion.module').then(m => m.VinculacionModule)
    //   }
    // ]
  }
  // {
  //   path: 'nuevo', loadChildren: './vinculacion/vinculacion.module#VinculacionModule',
  // }
];

@NgModule({
  declarations: [GestionarVinculacionComponent, BuscarPlazaComponent, BuscarCentroTrabajoComponent, GenerarProyectoComponent, 
    VerInformacionSustentoComponent, BuscarPersonaComponent, ModalDiferenciaPlazaComponent, ListarPlazasComponent],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    VinculacionModule
  ]
})
export class GestionarVinculacionModule { }
