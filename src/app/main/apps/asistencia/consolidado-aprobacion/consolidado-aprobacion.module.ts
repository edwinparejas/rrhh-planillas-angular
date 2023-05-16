import { NgModule } from '@angular/core';
import { ConsolidadoAprobacionAsistenciaComponent } from './consolidado-aprobacion-asistencia/consolidado-aprobacion-asistencia.component';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { ModalRechazoSolicitudComponent } from './modal-rechazo-solicitud/modal-rechazo-solicitud.component';
import { ReporteConsolidadoMensualComponent } from '../reporte-asistencia/pages/reporte-consolidado-mensual/container/reporte-consolidado-mensual.component';
import { ReporteDetalladoMensualComponent } from '../reporte-asistencia/pages/reporte-detallado-mensual/container/reporte-detallado-mensual.component';

//Detallado
//ConsolidadoComponent

const routes: Routes = [
  {
    path: '',
    component: ConsolidadoAprobacionAsistenciaComponent,
    resolve: {     
    }
  },  {
    path: ':asistencia/consolidado',
    component: ReporteConsolidadoMensualComponent,
    resolve: {
     // Registro: RegistroAsistenciaResolverService
    }    
  },
  {
    path: ':asistencia/detallado',
    component: ReporteDetalladoMensualComponent,
    resolve: {
     // Registro: RegistroAsistenciaResolverService
    }    
  },
];
@NgModule({
  declarations: [
    ConsolidadoAprobacionAsistenciaComponent,     
     ModalRechazoSolicitudComponent,
  ],
  imports: [    
    MaterialModule,
    RouterModule.forChild(routes),    
    MineduSharedModule, 
    MineduSidebarModule,
    MineduComponentsModule,
  ]
 
})
export class ConsolidadoAprobacionModule { }
