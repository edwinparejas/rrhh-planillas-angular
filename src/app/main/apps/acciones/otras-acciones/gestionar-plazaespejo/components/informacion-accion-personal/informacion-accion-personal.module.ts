import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerInformacionAccionPersonalComponent } from './components/ver-informacion-accion-personal/ver-informacion-accion-personal.component';
import { DatosPersonalesInfoComponent } from './components/datos-personales-info/datos-personales-info.component';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { MaterialModule } from 'app/material/material.module';
import { AccionPersonalInfoComponent } from './components/accion-personal-info/accion-personal-info.component';
import { DatosAccionInfoComponent } from './components/datos-accion-info/datos-accion-info.component';
import { ObservacionInfoComponent } from './components/observacion-info/observacion-info.component';
import { MineduSharedModule } from '../../../../../../../../@minedu/shared.module';
import { DatosResolucionComponent } from './components/datos-resolucion/datos-resolucion.component';
import { AccionPersonalAtencionPopupComponent } from './components/popups/accion-personal-atencion-popup/accion-personal-atencion-popup.component';
import { AtencionPlazaEspejoComponent } from './components/atencion-plaza-espejo/atencion-plaza-espejo.component';
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
        AccionPersonalInfoComponent,
        VerInformacionAccionPersonalComponent,
        DatosAccionInfoComponent,
        ObservacionInfoComponent,
        DatosResolucionComponent,
        AccionPersonalAtencionPopupComponent,
        AtencionPlazaEspejoComponent
    ],
    exports: [
        AccionPersonalAtencionPopupComponent
    ]
})
export class InformacionAccionPersonalModule { }
