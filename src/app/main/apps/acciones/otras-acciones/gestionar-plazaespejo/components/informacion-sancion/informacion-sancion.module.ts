import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MineduSharedModule } from '../../../../../../../../@minedu/shared.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { MaterialModule } from 'app/material/material.module';
import { DatosPersonalesInfoComponent } from './components/datos-personales-info/datos-personales-info.component';
import { ServidorPublicoInfoComponent } from './components/servidor-publico-info/servidor-publico-info.component';
import { DatosResolucionInfoComponent } from './components/datos-resolucion-info/datos-resolucion-info.component';
import { SharedModule } from '../../Utils/shared/shared.module';
import { SancionesPopupComponent } from './components/popups/sanciones-popup/sanciones-popup.component';
import { VerInformacionSancionesComponent } from './components/ver-informacion-sanciones/ver-informacion-sanciones.component';
import { DatosSancionInfoComponent } from './components/datos-sancion-info/datos-sancion-info.component';



@NgModule({
    imports: [
        CommonModule,
        MineduSharedModule,
        MineduComponentsModule,
        MaterialModule,
        SharedModule
    ],
    declarations: [
        DatosPersonalesInfoComponent,
        ServidorPublicoInfoComponent,
        DatosResolucionInfoComponent,
        DatosSancionInfoComponent,
        SancionesPopupComponent,
        VerInformacionSancionesComponent
    ],
    exports: [SancionesPopupComponent]
})
export class InformacionSancionModule { }
