import { NgModule } from '@angular/core';
import { AdendaContratoComponent } from './adenda-contrato.component';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BandejaAdendaComponent } from './bandeja-adenda/bandeja-adenda.component';
import { BandejaAdendaModule } from './bandeja-adenda/bandeja-adenda.module';
import { AdjuntarDocumentoComponent } from './components/adjuntar-documento/adjuntar-documento.component';
import { GestionContratoAdenda } from './gestionar-contrato-adenda/gestionar-contrato-adenda.component';
import { GestionarContratoAdendaModule } from './gestionar-contrato-adenda/gestionar-contrato-adenda.module';

const routes: Routes = [
  {
    path: '',
    component: AdendaContratoComponent,
    resolve: {
    }
  }
];

@NgModule({
  // declarations: [AdendaContratoComponent, BandejaAdendaComponent, GestionContratoAdenda],
  declarations: [AdendaContratoComponent, AdjuntarDocumentoComponent],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    BandejaAdendaModule,
    GestionarContratoAdendaModule  
  ]
})
export class AdendaContratoModule { }
