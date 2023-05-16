import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { ContainerComponent } from './container/container.component';
import { BandejaSancionesComponent } from './bandeja-sanciones/bandeja-sanciones.component';
import { BandejaFaltasComponent } from './bandeja-faltas/bandeja-faltas.component';
import { RegistraFaltaComponent } from './registra-falta/registra-falta.component';
import { DocumetoSustentoModule } from '../gestion-sanciones/components/documentos-sustento/documeto-sustento.module';
import { RegistraSancionComponent } from './registra-sancion/registra-sancion.component';
import { InformacionFaltaComponent } from './informacion-falta/informacion-falta.component';
import { InformacionSancionComponent } from './informacion-sancion/informacion-sancion.component';
import { BuscadorServidorPublicoComponent} from './components/buscador-servidor-publico/buscador-servidor-publico.component';

import { InformacionDocumentoSustentoComponent } from '../gestion-sanciones/components/informacion-documento-sustento/informacion-documento-sustento.component';

const routes: Routes = [
    {
        path: '',
        component: ContainerComponent,
    }
]

@NgModule({
    declarations: [
        InformacionDocumentoSustentoComponent,
        ContainerComponent, 
        BandejaFaltasComponent,
        BandejaSancionesComponent,
        RegistraFaltaComponent, 
        RegistraSancionComponent, 
        InformacionSancionComponent,
        BuscadorServidorPublicoComponent
        ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        DocumetoSustentoModule,   
       
    ]
})
export class GestionSancionesModule { }
