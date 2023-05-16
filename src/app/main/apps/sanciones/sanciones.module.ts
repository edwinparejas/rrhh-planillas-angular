import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../components/minedu-components.module";
import { SancionesRoutingModule } from './sanciones-routing.module';
import { InformacionFaltaComponent } from './gestion-sanciones/informacion-falta/informacion-falta.component';
import { DocumetoSustentoModule } from './gestion-sanciones/components/documentos-sustento/documeto-sustento.module';
//import { InformacionDocumentoSustentoComponent } from './gestion-sanciones/components/informacion-documento-sustento/informacion-documento-sustento.component';
//,InformacionDocumentoSustentoComponent
@NgModule({
  declarations: [InformacionFaltaComponent],
  imports: [
    CommonModule,
    SancionesRoutingModule,
    MaterialModule,
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule, 
    DocumetoSustentoModule,  
      
  ]
})
export class SancionesModule { }
