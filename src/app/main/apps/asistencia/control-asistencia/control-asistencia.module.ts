import { NgModule } from "@angular/core";
import { RegistroAsistenciaComponent } from './registro-asistencia/registro-asistencia.component';
import { RouterModule, Routes } from '@angular/router';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MaterialModule } from 'app/material/material.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BandejaMensualComponent } from "./bandeja-mensual/bandeja-mensual.component";
import { ModalIncidenciaComponent } from "./modal-incidencia-servidor/modal-incidencia-servidor.component";
import { ModalVerInformacionServidorComponent } from "./modal-ver-informacion-servidor/modal-ver-informacion-servidor.component";
import { ModalVerMotivoDevolucionComponent } from "./modal-ver-motivo-devolucion/modal-ver-motivo-devolucion.component";
import { AsistenciaResolverService, EstadosControlAsistenciaResolverService, RegistraAsistenciaResolverService } from "app/core/data/resolvers/asistencia-type-resolver.service";
import { CargaMasivaComponent } from "../../components/carga-masiva/carga-masiva.component";
import { ReporteConsolidadoMensualComponent } from "../../asistencia/reporte-asistencia/pages/reporte-consolidado-mensual/container/reporte-consolidado-mensual.component";
import { ReporteDetalladoMensualComponent } from "../../asistencia/reporte-asistencia/pages/reporte-detallado-mensual/container/reporte-detallado-mensual.component";
import { BuscarPersonaComponent } from "./buscar-persona/buscar-persona.component";


const routes: Routes = [
  {
    path: '',
    component: BandejaMensualComponent,
    resolve: {
    //  AsistenciaMensual: EstadosControlAsistenciaResolverService
    }
  }, 
  //this.router.navigate(['./registrarAsistencia/' + row.registro], { relativeTo: this.route }); 
  {
    path: ':asistencia/registrarasistencia',
    component: RegistroAsistenciaComponent,
    resolve: {
     // Registro: RegistroAsistenciaResolverService
    }    
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
  {
    path: ":asistencia/registrarasistencia/:codigo/cargamasiva",
    component: CargaMasivaComponent,
    resolve: {
        Ratificacion: AsistenciaResolverService,
    }
  },
  {
    path: ":asistencia/registrarasistencia/:codigo/detallado",
    component: ReporteDetalladoMensualComponent,
    resolve: {
      Ratificacion_: RegistraAsistenciaResolverService,
    }
  },
  {
    path: ":asistencia/registrarasistencia/:codigo/consolidado",
    component: ReporteConsolidadoMensualComponent,
    resolve: {
        Ratificacion_: RegistraAsistenciaResolverService,
    }
  },
];

@NgModule({
    declarations: [BandejaMensualComponent,
                  RegistroAsistenciaComponent,
                  ModalVerInformacionServidorComponent,
                  ModalIncidenciaComponent,
                  ModalVerMotivoDevolucionComponent,
                  BuscarPersonaComponent
                ],
    imports: [  
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule],
})
export class ControlAsistenciaModule {}

