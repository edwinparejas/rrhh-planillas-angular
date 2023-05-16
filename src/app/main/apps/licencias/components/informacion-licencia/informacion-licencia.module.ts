import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../../material/material.module';
import { MineduSharedModule } from '../../../../../../@minedu/shared.module';
import { MineduSidebarModule } from '../../../../../../@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../../components/minedu-components.module';
import { InformacionLicenciaComponent } from './informacion-licencia.component';
import { DocumetoSustentoModule } from '../documentos-sustento/documeto-sustento.module';



@NgModule({
  declarations: [InformacionLicenciaComponent],
  imports: [
    CommonModule,
    MaterialModule,    
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule,
    DocumetoSustentoModule
  ],
  exports: [InformacionLicenciaComponent]
})
export class InformacionLicenciaModule { }
