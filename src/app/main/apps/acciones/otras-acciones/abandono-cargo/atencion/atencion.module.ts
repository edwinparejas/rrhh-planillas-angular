import { NgModule } from '@angular/core';
import { AtencionComponent } from './atencion.component';
import { SustentoInfoComponent } from './sustento-info/sustento-info.component';
import { MaterialModule } from 'app/material/material.module';
import { RouterModule, Routes } from '@angular/router';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { ObservarComponent } from './observar/observar.component';
import { DatePipe } from '@angular/common';
import { AtencionInfoComponent } from './atencion-info/atencion-info.component';

const routes: Routes = [
  {
    path: 'nueva-atencion',
    component: AtencionComponent ,
    resolve: {
    }
  },
  {    
    path: 'modificar-atencion/:idAtencionReporte',
    component: AtencionComponent ,
    resolve: {
    }
  },
  {    
    path: 'atender/:idAtencionReporte',
    component: AtencionComponent ,
    resolve: {
    }
  },
  {
    path: 'reincorporar-atencion/:idAtencionReporte/:idReincorporar',
    component: AtencionComponent ,
    resolve: {
    }
  }
];

@NgModule({
  declarations: [
    AtencionComponent,
    SustentoInfoComponent,
    ObservarComponent,
    AtencionInfoComponent
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
export class AtencionModule { }
