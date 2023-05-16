import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentosSustentoComponent } from './documentos-sustento.component';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../../components/minedu-components.module';


@NgModule({
    imports: [
        CommonModule,
        MaterialModule,    
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
    ],
    declarations: [DocumentosSustentoComponent],
    exports: [DocumentosSustentoComponent]
})
export class DocumetoSustentoModule { }
