import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerInformacionAccionPersonalComponent } from './components/ver-informacion-accion-personal/ver-informacion-accion-personal.component';
import { DatosPersonalesInfoComponent } from './components/datos-personales-info/datos-personales-info.component';
import { InformacionAccionPersonalPopupComponent } from './components/informacion-accion-personal-popup/informacion-accion-personal-popup.component';
import { MineduSharedModule } from '../../../../../../../@minedu/shared.module';
import { MineduComponentsModule } from 'app/main/apps/components/minedu-components.module';
import { MaterialModule } from 'app/material/material.module';
import { AccionPersonalInfoComponent } from './components/accion-personal-info/accion-personal-info.component';
import { DatosAccionInfoComponent } from './components/datos-accion-info/datos-accion-info.component';
import { InfoSustentoComponent } from './components/info-sustento/info-sustento.component';
import { InfoEscalafonarioComponent } from './components/info-escalafonario/info-escalafonario.component';
import { ObservacionInfoComponent } from './components/observacion-info/observacion-info.component';
import { NoRegistradoPipe } from './pipes/no-registrado.pipe';

@NgModule({
    imports: [
        CommonModule,
        MineduSharedModule,
        MineduComponentsModule,
        MaterialModule
    ],
    declarations: [
        NoRegistradoPipe,
        DatosPersonalesInfoComponent,
        AccionPersonalInfoComponent,
        VerInformacionAccionPersonalComponent,
        InformacionAccionPersonalPopupComponent,
        DatosAccionInfoComponent,
        InfoSustentoComponent,
        InfoEscalafonarioComponent,
        ObservacionInfoComponent
    ],    
    exports: [
        DatosPersonalesInfoComponent,
        VerInformacionAccionPersonalComponent
    ]
})
export class InformacionAccionPersonalModule { }
