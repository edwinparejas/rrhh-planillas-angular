import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MineduSharedModule } from '../../../../../../../../@minedu/shared.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { MaterialModule } from 'app/material/material.module';
import { DatosPersonalesInfoComponent } from './components/datos-personales-info/datos-personales-info.component';
import { ServidorPublicoInfoComponent } from './components/servidor-publico-info/servidor-publico-info.component';
import { DatosResolucionInfoComponent } from './components/datos-resolucion-info/datos-resolucion-info.component';
import { DatosLicenciaInfoComponent } from './components/datos-licencia-info/datos-licencia-info.component';
import { LicenciasPopupComponent } from './components/popups/licencias-popup/licencias-popup.component';
import { VerInformacionLicenciasComponent } from './components/ver-informacion-licencias/ver-informacion-licencias.component';
import { SharedModule } from '../../Utils/shared/shared.module';



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
        DatosLicenciaInfoComponent,
        LicenciasPopupComponent,
        VerInformacionLicenciasComponent
    ],
    exports: [LicenciasPopupComponent]
})
export class InformacionLicenciasModule { }
