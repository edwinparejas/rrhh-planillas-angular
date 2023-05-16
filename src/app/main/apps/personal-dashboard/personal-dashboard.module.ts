import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PersonalDashboardRoutingModule } from './personal-dashboard-routing.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { PersonalDashboardComponent } from './personal-dashboard.component';


@NgModule({
  declarations: [PersonalDashboardComponent],
  imports: [
    CommonModule,
    PersonalDashboardRoutingModule,
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule
  ]
})
export class PersonalDashboardModule { }
