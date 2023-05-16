import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material/material.module';
import { MineduSharedModule } from '../../../../../@minedu/shared.module';
import { MineduSidebarModule } from '../../../../../@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BandejaProcesoComponent } from './bandeja-proceso/bandeja-proceso.component';
import { BandejaPlazaComponent } from './bandeja-plaza/bandeja-plaza.component';
import { BandejaCalificacionComponent } from './bandeja-calificacion/bandeja-calificacion.component';
import { BandejaAdjudicacionComponent } from './bandeja-adjudicacion/bandeja-adjudicacion.component';
import { BandejaConsolidadoComponent } from './bandeja-consolidado/bandeja-consolidado.component';
import { ModalInformacionCalificacionComponent } from './components/modal-informacion-calificacion/modal-informacion-calificacion.component';
import { ModalAgregarObservarPostulanteComponent } from './components/modal-agregar-observar-postulante/modal-agregar-observar-postulante.component';
import { ModalInformacionDocumentoSustentoComponent } from './components/modal-informacion-documento-sustento/modal-informacion-documento-sustento.component';
import { ModalAgregarMotivoRechazoPlazasComponent } from './components/modal-agregar-motivo-rechazo-plazas/modal-agregar-motivo-rechazo-plazas.component';
import { ModalAgregarMotivoRechazoConsolidadoComponent } from './components/modal-agregar-motivo-rechazo-consolidado/modal-agregar-motivo-rechazo-consolidado.component';
import { ModalInformacionPlazasComponent } from './components/modal-informacion-plazas/modal-informacion-plazas.component';
import { ModalConsultarMotivoRechazoPlazasComponent } from './components/modal-consultar-motivo-rechazo-plazas/modal-consultar-motivo-rechazo-plazas.component';
import { ModalConsultarMotivoRechazoConsolidadoComponent } from './components/modal-consultar-motivo-rechazo-consolidado/modal-consultar-motivo-rechazo-consolidado.component';
import { ModalIncorporarPlazaComponent } from './components/modal-incorporar-plaza/modal-incorporar-plaza.component';

const routes: Routes = [
    {
        path: '',  
        component: BandejaProcesoComponent
    },
    {
        path: 'plaza/:idEtapaProceso',
        component: BandejaPlazaComponent
    },
    {
        path: 'calificacion/:idProceso/:idEtapa',
        component: BandejaCalificacionComponent
    },
    {
        path: 'adjudicacion/:idProceso/:idEtapa',
        component: BandejaAdjudicacionComponent
    },
    {
        path: 'consolidado/:idProceso/:idEtapa',
        component: BandejaConsolidadoComponent
    }
  
];

@NgModule({
    declarations: [
        BandejaProcesoComponent,
        BandejaPlazaComponent,
        BandejaCalificacionComponent,
        BandejaAdjudicacionComponent,
        BandejaConsolidadoComponent,
        ModalInformacionCalificacionComponent,
        ModalInformacionPlazasComponent,
        ModalAgregarMotivoRechazoPlazasComponent,
        ModalAgregarMotivoRechazoConsolidadoComponent,
        ModalConsultarMotivoRechazoPlazasComponent,
        ModalInformacionDocumentoSustentoComponent,
        ModalConsultarMotivoRechazoConsolidadoComponent,
        ModalAgregarObservarPostulanteComponent,
        ModalIncorporarPlazaComponent
    ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule
    ],
    
})
export class NombramientoModule { }