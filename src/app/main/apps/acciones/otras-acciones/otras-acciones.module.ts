import { NgModule } from '@angular/core';
import { OtrasAccionesComponent } from './otras-acciones.component';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: null,
    children: [
      { 
        path: 'generacionplazaespejo',
        loadChildren: () => import('./gestionar-plazaespejo/gestionar-plazaespejo.module')
                                  .then(m => m.GestionarPlazaespejoModule) 
      },
      {
        path: 'abandonocargootros',
        loadChildren: () => import('./abandono-cargo/abandono-cargo.module')
                                  .then(m => m.AbandonoCargoModule)
      }
    ]
  }
];

@NgModule({
  declarations: [OtrasAccionesComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ]
})
export class OtrasAccionesModule { }
