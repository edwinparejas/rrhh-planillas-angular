import { NgModule } from '@angular/core';
import { VinculacionComponent } from './vinculacion.component';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
// import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BuscarVinculacionesComponent } from './components/buscar-vinculaciones/buscar-vinculaciones.component';
import { BuscarAdjudicacionesComponent } from './components/buscar-adjudicaciones/buscar-adjudicaciones.component';
import { BuscarSancionAdministrativaComponent } from './components/buscar-sancion-administrativa/buscar-sancion-administrativa.component';
import { ObservarVinculacionComponent } from './components/observar-vinculacion/observar-vinculacion.component';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { ModalMonitorVinculacionComponent } from './components/modal-monitor-instancias/modal-monitor-vinculacion.component';
import { ModalSolicitarInformacionComponent } from './components/modal-solicitar-informacion/modal-solicitar-informacion.component';
import { RechazarAutoizacionComponent } from './components/rechazar-autorizacion/rechazar-autorizacion.component';
import { ModalInformacionPlaza } from './components/modal-informacion-plaza/modal-informacion-plaza.component';
import { InformacionPlazaComponent } from './components/informacion-plaza/informacion-plaza.component';
import { SolicitarAutorizacionComponent } from './components/solicitar-autorizacion/solicitar-autorizacion.component';
import { ConformidadAdjudicacionComponent } from './components/conformidad-adjudicacion/conformidad-adjudicacion.component';
import { FormacionAcademicaComponent } from './components/formacion-academica/formacion-academica.component';


const routes: Routes = [
  {
    path: 'agregar/:tipo',
    component: VinculacionComponent,
    resolve: {
    }
  },
  {
    path: 'agregar-adenda/:tipo/:idContrato',
    component: VinculacionComponent,
    resolve: {
    }
  },
  {
    path: 'modificar/:tipo/:id',
    component: VinculacionComponent,
    resolve: {
    }
  }
  ,
  {
    path: 'completar/:tipo/:id',
    component: VinculacionComponent,
    resolve: {
    }
  }
  ,
  {
    path: 'informacion/:tipo/:accion/:id',
    component: VinculacionComponent,
    resolve: {
    }
  }
  ,
  {
    path: 'accion/:tipo/:id',
    component: VinculacionComponent,
    resolve: {
    }
  }
  ,
  {
    path: 'agregar',
    component: VinculacionComponent,
    resolve: {
    }
  }

];

@NgModule({
  declarations: [VinculacionComponent, BuscarVinculacionesComponent, BuscarAdjudicacionesComponent, BuscarSancionAdministrativaComponent, 
    ObservarVinculacionComponent, ModalMonitorVinculacionComponent, ModalSolicitarInformacionComponent, RechazarAutoizacionComponent,
     ModalInformacionPlaza, InformacionPlazaComponent, SolicitarAutorizacionComponent, ConformidadAdjudicacionComponent, FormacionAcademicaComponent],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ]
})
export class VinculacionModule { }

