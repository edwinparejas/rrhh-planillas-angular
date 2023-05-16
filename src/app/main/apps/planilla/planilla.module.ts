import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanillaMaestrosModule } from './maestros/planilla-maestros.module';
import { PlanillaRoutingModule } from './planilla-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PlanillaRoutingModule,
    PlanillaMaestrosModule
  ]
})
export class PlanillaModule { }
