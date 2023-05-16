import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppsRoutingModule } from './apps-routing.module';
import { AppsComponent } from './apps.component';
import { MineduSharedModule } from '@minedu/shared.module';


@NgModule({
  declarations: [AppsComponent],
  imports: [
    CommonModule,
    AppsRoutingModule,
    MineduSharedModule
  ]
})
export class AppsModule { }
