import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { ConsolidadoComponent } from './consolidado.component';
import { InformacionVacacionesComponent } from '../components/informacion-vacaciones/informacion-vacaciones.component';
import { InformacionVinculacionComponent } from '../components/informacion-vinculacion/informacion-vinculacion.component';
import { InformacionSancionesComponent } from '../components/informacion-sanciones/informacion-sanciones.component';
import { InformacionLicenciasComponent } from '../components/informacion-licencias/informacion-licencias.component';
import { InformacionDesplazamientoComponent } from '../components/informacion-desplazamiento/informacion-desplazamiento.component';
import { InformacionBeneficiosComponent } from '../components/informacion-beneficios/informacion-beneficios.component';
import { InformacionAscensoComponent } from '../components/informacion-ascenso/informacion-ascenso.component';
import { InformacionDesvinculacionComponent } from '../components/informacion-desvinculacion/informacion-desvinculacion.component';
import { HistorialNexusComponent } from '../components/historial-nexus/historial-nexus.component';

const routes: Routes = [
  
  {
    path: 'consolidado/:id_servidor_publico',
    component: ConsolidadoComponent,
    resolve: {
    }
  }

];

@NgModule({
  declarations: [ConsolidadoComponent, InformacionVacacionesComponent, InformacionVinculacionComponent, InformacionSancionesComponent, 
    InformacionLicenciasComponent, InformacionDesplazamientoComponent, InformacionBeneficiosComponent, InformacionAscensoComponent,
  InformacionDesvinculacionComponent, HistorialNexusComponent],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ]
})
export class ConsolidadoModule { }

