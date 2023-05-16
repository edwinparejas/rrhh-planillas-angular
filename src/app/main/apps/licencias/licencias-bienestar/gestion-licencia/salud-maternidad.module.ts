import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaternidadListaComponent } from './maternidad-lista-licencia/maternidad-lista-licencia.component';
import { Routes, RouterModule } from '@angular/router';
import { BuscadorServidorPublicoComponent } from '../../components/buscador-servidor-publico/buscador-servidor-publico.component';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { RegistraLicenciaComponent } from './registra-licencia/registra-licencia.component';
import { DocumentosSustentoComponent } from '../../components/documentos-sustento/documentos-sustento.component';
import { DocumetoSustentoModule } from '../../components/documentos-sustento/documeto-sustento.module';
import { InformacionLicenciaModule } from '../../components/informacion-licencia/informacion-licencia.module';
import { InformacionPlazaComponent } from '../../components/informacion-plaza/informacion-plaza.component';

const routes: Routes = [
    {
        path: '', component: MaternidadListaComponent
    },
];

@NgModule({
    declarations: [MaternidadListaComponent, 
        BuscadorServidorPublicoComponent, 
        InformacionPlazaComponent, 
        RegistraLicenciaComponent],
    imports: [
        CommonModule,
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        DocumetoSustentoModule,
        InformacionLicenciaModule
    ],
    entryComponents: [DocumentosSustentoComponent],
    exports: [DocumentosSustentoComponent]
})
export class SaludMaternidadModule { }
