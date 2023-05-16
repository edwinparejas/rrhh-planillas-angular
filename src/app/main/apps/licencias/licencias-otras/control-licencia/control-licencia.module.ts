import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MaterialModule } from "app/material/material.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "app/main/apps/components/minedu-components.module";
import { BandejaControlLicenciasComponent } from "./bandeja-control-licencias/bandeja-control-licencias.component";
import { BandejaBienestarSocialComponent } from "./bandeja-bienestar-social/bandeja-bienestar-social.component";
import { GenerarProyectoComponent } from "./generar-proyecto/generar-proyecto.component";
import { BandejaPrincipalComponent } from './bandeja-principal/bandeja-principal.component';
import { DocumetoSustentoModule } from '../../components/documentos-sustento/documeto-sustento.module';
import { BandejaLicenciaOtraComponent } from './bandeja-licencia-otra/bandeja-licencia-otra.component';
import { InformacionLicenciaOtraComponent } from './informacion-licencia-otra/informacion-licencia-otra.component';
import { RegistraLicenciaOtraComponent } from './registra-licencia-otra/registra-licencia-otra.component';
import { BuscarCentroTrabajoComponent } from '../../components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { InformacionLicenciaModule } from '../../components/informacion-licencia/informacion-licencia.module';
import { GestionLicenciaOtraComponent } from './gestion-licencia-otra/gestion-licencia-otra.component';

const routes: Routes = [
    {
        path: "",
        component: BandejaPrincipalComponent
    },
    {
        path: 'registralicencia/:id', component: BandejaLicenciaOtraComponent
    },
];

@NgModule({
    declarations: [
        BandejaControlLicenciasComponent,
        BandejaBienestarSocialComponent,
        GenerarProyectoComponent,
        BandejaPrincipalComponent,
        BandejaLicenciaOtraComponent,        
        InformacionLicenciaOtraComponent,
        RegistraLicenciaOtraComponent,
        BuscarCentroTrabajoComponent,
        GestionLicenciaOtraComponent
    ],
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

    exports: [
        BandejaControlLicenciasComponent,
        BandejaBienestarSocialComponent,
    ],
})
export class ControlLicenciaModule { }
