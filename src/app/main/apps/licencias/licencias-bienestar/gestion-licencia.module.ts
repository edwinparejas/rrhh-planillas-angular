import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { GestionLicenciaRoutingModule } from './gestion-licencia-routing.module';
import { GestionLicenciaComponent } from './gestion-licencia.component';

@NgModule({
    declarations: [GestionLicenciaComponent],
    imports: [
        CommonModule,
        MaterialModule,
        GestionLicenciaRoutingModule,        
        MaterialModule,
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule
    ]
})
export class GestionLicenciaModule { }
