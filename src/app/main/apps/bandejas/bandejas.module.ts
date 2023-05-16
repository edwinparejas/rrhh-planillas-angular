import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BandejasRoutingModule } from './bandejas-routing.module';
import { BandejasComponent } from './bandejas.component';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../components/minedu-components.module';
@NgModule({
  declarations: [BandejasComponent],
  imports: [
    CommonModule,
    BandejasRoutingModule,
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
  ]
})
export class BandejasModule {}