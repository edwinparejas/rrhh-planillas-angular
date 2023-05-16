import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material/material.module';
import { MineduSharedModule } from '../../../../../@minedu/shared.module';
import { MineduSidebarModule } from '../../../../../@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BandejaAscensoComponent } from './bandeja-ascenso/bandeja-ascenso.component';
import { BandejaPostulanteComponent } from './bandeja-postulante/bandeja-postulante.component';
import { BuscadorServidorPublicoComponent } from './components/buscador-servidor-publico/buscador-servidor-publico.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { BandejaCalificacionComponent } from './bandeja-calificacion/bandeja-calificacion.component';
import { BandejaAdjudicacionComponent } from './bandeja-adjudicacion/bandeja-adjudicacion.component';
import { VerInformacionAscensoComponent } from './components/informacion-ascenso/ver-informacion-ascenso.component';
import { VerObservacionAscensoComponent } from './components/observacion-ascenso/ver-observacion-ascenso.component';
import { BuscadorCodigoPlazaComponent} from './components/buscador-codigo-plaza/buscador-codigo-plaza.component';
import { LevantarObservacionAscensoComponent} from './components/levantar-observacion/levantar-observacion-ascenso.component';
import { VerDetalleCalificacionAscensoComponent} from './components/detalle-calificacion/ver-detalle-calificacion.component';
import { VerInformacionAdjudicacionAscensoComponent} from './components/informacion-adjudicacion/ver-informacion-adjudicacion.component';
import { BandejaPlazaComponent} from './bandeja-plaza/bandeja-plaza.component';
import { BandejaPlazaConvocar } from './bandeja-plaza/componentes/plazas-convocar/bandeja-plazas-convocar.component';
import { BandejaPlazasObservadas } from './bandeja-plaza/componentes/plazas-observadas/bandeja-plazas-observadas.component';
import { BandejaPlazasPrePublicadas } from './bandeja-plaza/componentes/plazas-prePublicadas/bandeja-plazas-prePublicadas.component';
import { BandejaPlazaResultadoFinal } from './bandeja-plaza/componentes/plazas-resultadoFinal/bandeja-plaza-resultadoFinmal.component';
import { InformacionProcesoPlaza } from './bandeja-plaza/componentes/informacion-proceso/informacion-proceso.component';
import { MotivoCancelaciionComponent } from './components/motivo-cancelacion/motivo-cancelacion.component';
import { VerInformacionPlazaAscensoComponent } from './bandeja-plaza/componentes/informacion-plaza/ver-informacion-plaza.component'

import { CargaMasivaComponent } from './../../components/carga-masiva/carga-masiva.component';
import { ArchivoCargaComponent } from './../../components/carga-masiva/archivo-carga/archivo-carga.component';
import { DetalleErrorComponent } from './../../components/carga-masiva/detalle-error/detalle-error.component';
import { HistorialCargaComponent } from './../../components/carga-masiva/historial-carga/historial-carga.component';

import { CargaMasivaResolverService } from 'app/core/data/resolvers/carga-masiva-type-resolver.service';


const routes: Routes = [
    {
        path: '',  
        component: BandejaAscensoComponent
    },
    {
        path: 'postulante/:id',  
        component: BandejaPostulanteComponent
    },
    {
        path: 'calificacion/:idProceso/:idEtapa', 
        component: BandejaCalificacionComponent
    },
    {
        path: 'adjudicacion/:idProceso', 
        component: null,
        children: [
            {
                path: '', component: BandejaAdjudicacionComponent
            },
            {
                path: ":codigo/cargamasiva", component: CargaMasivaComponent,
                resolve: { CargaMasiva: CargaMasivaResolverService },
            },
        ]
    },
    {
        path: 'plaza/:idProceso', 
        component: null,
        children: [
            {
                path: '', component: BandejaPlazaComponent
            },
            // {
            //     path: ":codigo/cargamasiva", component: CargaMasivaComponent,
            //     resolve: { CargaMasiva: CargaMasivaResolverService },
            // },
        ]
    },
     
];

@NgModule({
    declarations: [
        BandejaAscensoComponent,
        BandejaPostulanteComponent,
        BuscadorServidorPublicoComponent,
        BandejaPlazaComponent,
        BuscarPlazaComponent,
        BandejaCalificacionComponent,
        BandejaAdjudicacionComponent,
        VerInformacionAscensoComponent,
        VerObservacionAscensoComponent,
        BuscadorCodigoPlazaComponent,
        LevantarObservacionAscensoComponent,
        VerDetalleCalificacionAscensoComponent,
        VerInformacionAdjudicacionAscensoComponent,
        BandejaPlazaConvocar,
        BandejaPlazasObservadas,
        BandejaPlazasPrePublicadas,
        BandejaPlazaResultadoFinal,
        InformacionProcesoPlaza,
        MotivoCancelaciionComponent,
        VerInformacionPlazaAscensoComponent
  
    
        // CargaMasivaComponent,
        // ArchivoCargaComponent,
        // DetalleErrorComponent,
        // HistorialCargaComponent
        
         
    ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule
    ],
    
})
export class AscensoModule { }
