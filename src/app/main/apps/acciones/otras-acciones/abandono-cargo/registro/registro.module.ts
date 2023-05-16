import { NgModule } from '@angular/core';
import { RegistroInfoComponent } from './registro-info/registro-info.component';
import { SustentoInfoComponent } from './sustento-info/sustento-info.component';
import { ObservarComponent } from './observar/observar.component';
import { RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from './registro.component';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { DatePipe } from '@angular/common';

const routes: Routes = [
  {
    path: 'nuevo-registro',
    component: RegistroComponent ,
    resolve: {
    }
  },
  {    
    path: 'modificar-registro/:idAtencionReporte',
    component: RegistroComponent ,
    resolve: {
    }
  },
  {
    path: 'reincorporar-registro/:idAtencionReporte/:idReincorporar',
    component: RegistroComponent ,
    resolve: {
    }
  }
];


@NgModule({
  declarations: [
    RegistroComponent,
    RegistroInfoComponent,
    SustentoInfoComponent,
    ObservarComponent
  ],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ],
  providers:[
    DatePipe
  ]
})
export class RegistroModule { }
