import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtenderSolicitudComponent } from './atender-solicitud.component';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
@NgModule({
  declarations: [AtenderSolicitudComponent],
  imports: [
    CommonModule,    
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
  ]
})
export class AtenderSolicitudModule {}