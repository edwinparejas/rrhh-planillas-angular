import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';

import { CentroTrabajoComponent } from './bandeja-centro-trabajo/bandeja-centro-trabajo.component';
import { OmisosComponent } from './bandeja-omisos/bandeja-omisos.component';
import { BuscarCentroTrabajoComponent } from './buscar-centro-trabajo/buscar-centro-trabajo.component';
import { ModalDevolverReportesComponent } from './modal-devolver-reportes/modal-devolver-reportes.component';
import { ContenedorControlComponent } from './contenedor-control/contenedor-control.component';
import { ReporteConsolidadoMensualComponent } from '../reporte-asistencia/pages/reporte-consolidado-mensual/container/reporte-consolidado-mensual.component';
import { ReporteDetalladoMensualComponent } from '../reporte-asistencia/pages/reporte-detallado-mensual/container/reporte-detallado-mensual.component';

const routes: Routes = [
  {
    path: '',
    component: ContenedorControlComponent,
    resolve: { }
  },
  {
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
  // {
  //   path: ':controlConsolidado/bandejaCentroTrabajo',
  //   component: CentroTrabajoComponent,
  //   resolve: {
     
  //   }
  // },
  // {
  //   path: ':controlConsolidado/bandejaOmisos',
  //   component: OmisosComponent,
  //   resolve: {
     
  //   }
  // }  
];
@NgModule({
  declarations: [
                CentroTrabajoComponent,
                OmisosComponent,   
                BuscarCentroTrabajoComponent,  
                ModalDevolverReportesComponent, ContenedorControlComponent,         
                ],
  imports: [
    CommonModule,
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    RouterModule.forChild(routes),
   
  ]
})
export class ControlConsolidadoModule { }
