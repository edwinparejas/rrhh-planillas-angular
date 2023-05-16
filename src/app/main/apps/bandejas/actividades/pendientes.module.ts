import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { PendientesRoutingModule } from './pendientes-routing.module';
import { PendientesComponent } from './pendientes.component';
import { EditarPendientesComponent } from './gestion-pendientes/editar-pendientes/editar-pendientes.component';

@NgModule({
    declarations: [PendientesComponent,
        EditarPendientesComponent],
    imports: [
        CommonModule,
        MaterialModule,
        PendientesRoutingModule,        
        MaterialModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule
    ],
    exports: [
        PendientesComponent, 
        EditarPendientesComponent]
})
export class PendientesModule { }
