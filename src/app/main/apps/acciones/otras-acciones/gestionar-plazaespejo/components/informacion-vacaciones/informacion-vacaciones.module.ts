import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MineduSharedModule } from '../../../../../../../../@minedu/shared.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { MaterialModule } from 'app/material/material.module';
import { DatosPersonalesInfoComponent } from './components/datos-personales-info/datos-personales-info.component';
import { DatosResolucionInfoComponent } from './components/datos-resolucion-info/datos-resolucion-info.component';
import { SharedModule } from '../../Utils/shared/shared.module';
import { VacacionesPopupComponent } from './components/popups/vacaciones-popup/vacaciones-popup.component';
import { VerInfoVacacionesComponent } from './components/ver-info-vacaciones/ver-info-vacaciones.component';
import { ServidorPublicoInfoComponent } from './components/servidor-publico-info/servidor-publico-info.component';
import { DatosVacacionesInfoComponent } from './components/datos-vacaciones-info/datos-vacaciones-info.component';

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
        DatosVacacionesInfoComponent,
        VacacionesPopupComponent,
        VerInfoVacacionesComponent
    ],
    exports: [VacacionesPopupComponent]
})
export class InformacionVacacionesModule { }
