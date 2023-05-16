import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DesignacionListaComponent } from './designacion-lista/designacion-lista.component';
import { DesignacionPlazaListaComponent } from './designacion-plaza-lista/designacion-plaza-lista.component';
import { DesignacionPlazaPrepublicadaComponent } from './designacion-plaza-prepublicada/designacion-plaza-prepublicada.component';
import { DesignacionPlazaAConvocarComponent } from './designacion-plaza-a-convocar/designacion-plaza-a-convocar.component';
import { DesignacionPlazaObservadaComponent } from './designacion-plaza-observada/designacion-plaza-observada.component';
import { DesignacionPlazaResultadoComponent } from './designacion-plaza-resultado/designacion-plaza-resultado.component';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { EstadosDesignacionResolverService } from 'app/core/data/resolvers/designacion-type-resolver.service';
import { DesignacionHeaderComponent } from './components/designacion-header/designacion-header.component';

const routes: Routes = [
  {
    path: '',
    component: DesignacionListaComponent,
    resolve: {
      EstadosProceso: EstadosDesignacionResolverService
    }
  },
  {
    path: ':proceso/plazas',
    component: DesignacionPlazaListaComponent,
    resolve: {
      // Proceso: EstadosDesignacionResolverService
    }
  },
  // {
  //   path: ':proceso/cronogramas', component: ConfigurarCronogramaProcesoComponent,
  //   resolve: {
  //   }
  // },
  // {
  //   path: ':proceso/comites', component: ConfigurarComiteProcesoComponent,
  //   resolve: {
  //     Estados: EstadosComiteResolverService
  //   }
  // }
];

@NgModule({
  declarations: [
    DesignacionListaComponent,
    DesignacionPlazaListaComponent,
    DesignacionPlazaPrepublicadaComponent,
    DesignacionPlazaAConvocarComponent,
    DesignacionPlazaObservadaComponent,
    DesignacionPlazaResultadoComponent,
    DesignacionHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ]
})
export class DesignacionModule { }
