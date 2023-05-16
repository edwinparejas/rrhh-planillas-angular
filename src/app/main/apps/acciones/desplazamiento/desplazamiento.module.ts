import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material/material.module';
import { MineduSharedModule } from '../../../../../@minedu/shared.module';
import { MineduSidebarModule } from '../../../../../@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BandejaDesplazamientoComponent } from './bandeja-desplazamiento/bandeja-desplazamiento.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { BuscadorServidorPublicoComponent } from './components/buscador-servidor-publico/buscador-servidor-publico.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { BuscarVinculacionesComponent } from './components/buscar-vinculaciones/buscar-vinculaciones.component';
import { ObservarAccionDesplazamientoComponent } from './components/observar-accion-desplazamiento/observar-accion-desplazamiento.component';

import { GenerarProyectoComponent } from './components/generar-proyecto/generar-proyecto.component';
import { DocumentoSustento } from './components/documentos-sustento/documento-sustento.component';
import { AprobacionAccionDesplazamientoComponent } from './aprobacion-accion-desplazamiento/aprobacion-accion-desplazamiento.component';
import { ObservacionDesaprobarDesplazamientoComponent } from './components/observacion-desaprobar-desplazamiento/observacion-desaprobar-desplazamiento.component';
import { RegistroDesplazamientoComponent } from './registro-desplazamiento/registro-desplazamiento.component';
import { AccionPersonalComponent } from './registro-desplazamiento/shared/accion-personal/accion-personal.component';
import { DatosPersonalesComponent } from './registro-desplazamiento/shared/datos-personales/datos-personales.component';
import { SeccionPlazaComponent } from './registro-desplazamiento/shared/seccion-plaza/seccion-plaza.component';
import { DatosAccionComponent } from './registro-desplazamiento/shared/datos-accion/datos-accion.component';
import { ReasignacionComponent } from './registro-desplazamiento/components/reasignacion/reasignacion.component';
import { EncargaturaComponent } from './registro-desplazamiento/components/encargatura/encargatura.component';
import { DesignacionComponent } from './registro-desplazamiento/components/designacion/designacion.component';
import { AscensoCargoComponent } from './registro-desplazamiento/components/ascenso-cargo/ascenso-cargo.component';
import { AscensoEscalaMagisterialComponent } from './registro-desplazamiento/components/ascenso-escala-magisterial/ascenso-escala-magisterial.component';
import { DestaqueComponent } from './registro-desplazamiento/components/destaque/destaque.component';
import { RotacionComponent } from './registro-desplazamiento/components/rotacion/rotacion.component';
import { PermutaComponent } from './registro-desplazamiento/components/permuta/permuta.component';
import { DatosPersonalesPermutaComponent } from './registro-desplazamiento/shared/datos-personales-permuta/datos-personales-permuta.component';
import { RetornarComponent } from './registro-desplazamiento/components/retornar/retornar.component';
import { UbicacionComponent } from './registro-desplazamiento/components/ubicacion/ubicacion.component';
import { InformacionAccionPersonalModule } from './components/informacion-accion-personal/informacion-accion-personal.module';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            {
                path: '',
                component: BandejaDesplazamientoComponent
            },
            {
                path: "registrar",
                component: RegistroDesplazamientoComponent
            },
            {
                path: "editar/:id",
                component: RegistroDesplazamientoComponent
            },
            {
                path: "aprobacion-accion-desplazamiento/:id",
                component: AprobacionAccionDesplazamientoComponent
            },
        ]
    }


];

@NgModule({
    declarations: [
        MainComponent,
        BandejaDesplazamientoComponent,
        AprobacionAccionDesplazamientoComponent,
        BuscarCentroTrabajoComponent,
        BuscadorServidorPublicoComponent,
        BuscarPlazaComponent,
        BuscarVinculacionesComponent,
        ObservarAccionDesplazamientoComponent,
        ObservacionDesaprobarDesplazamientoComponent,
        GenerarProyectoComponent,
        DocumentoSustento,
        RegistroDesplazamientoComponent,
        AccionPersonalComponent,
        DatosPersonalesComponent,
        SeccionPlazaComponent,
        DatosAccionComponent,
        ReasignacionComponent,
        EncargaturaComponent,
        DesignacionComponent,
        AscensoCargoComponent,
        AscensoEscalaMagisterialComponent,
        DestaqueComponent,
        RotacionComponent,
        PermutaComponent,
        DatosPersonalesPermutaComponent,
        RetornarComponent,
        UbicacionComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        MaterialModule,
        InformacionAccionPersonalModule
    ]
})
export class DesplazamientoModule { }
