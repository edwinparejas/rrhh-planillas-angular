import { NgModule } from '@angular/core';
import { GestionarProcesoComponent } from './gestion-proceso.component';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../components/minedu-components.module';
import { MantenimientoProcesoComponent } from './mantenimiento-proceso/mantenimiento-proceso.component';
import { ConfigurarEtapaProcesoComponent } from './configurar-etapa-proceso/configurar-etapa-proceso.component';
import { ConfigurarCronogramaProcesoComponent } from './configurar-cronograma-proceso/configurar-cronograma-proceso.component';
import { GestionarComiteProcesoComponent } from './gestionar-comite-proceso/gestion-comite-proceso.component';
import { ModalEtapaComponent } from './configurar-etapa-proceso/modal-etapa/modal-etapa.component';
import { ModalComiteComponent } from './gestionar-comite-proceso/modal-comite/modal-comite.component';
import { ModalRegistrarVigenciaComponent } from './configurar-cronograma-proceso/modal-registrar-vigencia/modal-registrar-vigencia.component';
import { ModalCulminarPublicarEtapasComponent } from './configurar-cronograma-proceso/modal-culminar-publicar-etapas/modal-culminar-publicar-etapas.component';
import { ModalCronogramasGeneradosComponent } from './configurar-cronograma-proceso/modal-cronogramas-generados/modal-cronogramas-generados.component';
import { ModalSustentarModificacionCronograma } from './configurar-cronograma-proceso/modal-sustento-modificacion/modal-sustentar-modificacion.component';
import { ModalComitesGeneradosComponent } from './gestionar-comite-proceso/modal-comites-generados/modal-comites-generados.component';
import { ModalProyectoResolucionComponent } from './gestionar-comite-proceso/modal-proyecto-resolucion/modal-proyecto-resolucion.component';
import { ModalProyectoResolucionCronogramaComponent } from './configurar-cronograma-proceso/modal-proyecto-resolucion/modal-proyecto-resolucion.component';
import { ModalSustentarModificacionComite } from './gestionar-comite-proceso/modal-sustento-modificacion/modal-sustentar-modificacion.component';
import { ModalVinculacionesComponent } from './gestionar-comite-proceso/modal-comite/modal-vinculaciones/modal-vinculaciones.component';
import { ModalVerInformacionComponent } from './gestionar-comite-proceso/modal-proyecto-resolucion/modal-ver-informacion/modal-ver-informacion.component';
import { ModalVerInformacionSustentoComponent } from './configurar-cronograma-proceso/modal-proyecto-resolucion/modal-ver-informacion/modal-ver-informacion.component';
import { DatePipe } from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: GestionarProcesoComponent
  },
  {
    path: ':proceso/:action/proceso',
    component: MantenimientoProcesoComponent
  },
  {
    path: ':proceso/etapas',
    component: ConfigurarEtapaProcesoComponent
  },
  {
    path: ':proceso/cronogramas', 
    component: ConfigurarCronogramaProcesoComponent
  },
  {
    path: ':proceso/comites', 
    component: GestionarComiteProcesoComponent,
  }
];

@NgModule({
  declarations: [
    GestionarProcesoComponent,
    MantenimientoProcesoComponent,
    ConfigurarEtapaProcesoComponent,
    ConfigurarCronogramaProcesoComponent,
    GestionarComiteProcesoComponent,
    ModalEtapaComponent,
    ModalComiteComponent,
    ModalRegistrarVigenciaComponent,
    ModalCulminarPublicarEtapasComponent,
    ModalCronogramasGeneradosComponent,
    ModalProyectoResolucionCronogramaComponent,
    ModalSustentarModificacionCronograma,
    ModalVinculacionesComponent,
    ModalComitesGeneradosComponent,
    ModalSustentarModificacionComite,
    ModalProyectoResolucionComponent,
    ModalVerInformacionSustentoComponent,
    ModalVerInformacionComponent
  ],
  imports: [
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ],
  providers: [
    DatePipe,
  ]
})
export class GestionModule { }
