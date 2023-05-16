import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MaterialModule } from "app/material/material.module";
import { MineduComponentsModule } from "../../components/minedu-components.module";
import { CabeceraEtapaProcesoEncargaturaComponent } from "./components/cabecera-etapa-proceso-encargatura/cabecera-etapa-proceso-encargatura.component";
import { CabeceraDesarrolloProcesoEncargaturaComponent } from "./components/cabecera-desarrollo-proceso-encargatura/cabecera-desarrollo-proceso-encargatura.component";
import { DatosPostulanteEncargaturaComponent } from "./components/datos-postulante-encargatura/datos-postulante-encargatura.component";
import { EncargaturaBandejaPlazaComponent } from "./encargatura-bandeja-plaza/encargatura-bandeja-plaza.component";
import { EncargaturaBandejaProcesoComponent } from "./encargatura-bandeja-proceso/encargatura-bandeja-proceso.component";
import { EncargaturaBandejaPostulanteComponent } from "./encargatura-bandeja-postulante/encargatura-bandeja-postulante.component";
import { InformacionPlazaEncargaturaComponent } from './components/informacion-plaza-encargatura/informacion-plaza-encargatura.component';
import { RegistroDocumentoSustentoEncargaturaComponent } from './components/registro-documento-sustento-encargatura/registro-documento-sustento-encargatura.component';
import { PestanaPlazaEncargaturaComponent } from './components/pestana-plaza-encargatura/pestana-plaza-encargatura.component';
import { MotivoNoPublicacionPlazaEncargaturaComponent } from './components/motivo-no-publicacion-plaza-encargatura/motivo-no-publicacion-plaza-encargatura.component';
import { EncargaturaBandejaCalificacionComponent } from './encargatura-bandeja-calificacion/encargatura-bandeja-calificacion.component';
import { PestanaCalificacionEncargaturaComponent } from './components/pestana-calificacion-encargatura/pestana-calificacion-encargatura.component';
import { RegistroObservacionPostulanteEncargaturaComponent } from './components/registro-observacion-postulante-encargatura/registro-observacion-postulante-encargatura.component';
import { RegistroReclamoPostulanteEncargaturaComponent } from './components/registro-reclamo-postulante-encargatura/registro-reclamo-postulante-encargatura.component';
import { RegistroPostulanteEncargaturaComponent } from './components/registro-postulante-encargatura/registro-postulante-encargatura.component';
import { InformacionPostulanteEncargaturaComponent } from './components/informacion-postulante-encargatura/informacion-postulante-encargatura.component';
import { ModificarPostulanteEncargaturaComponent } from './components/modificar-postulante-encargatura/modificar-postulante-encargatura.component';
import { ObservacionCalificacionEncargaturaComponent } from './components/observacion-calificacion-encargatura/observacion-calificacion-encargatura.component';
import { ReclamoCalificacionEncargaturaComponent } from './components/reclamo-calificacion-encargatura/reclamo-calificacion-encargatura.component';
import { MotivoCancelacionEtapaProcesoEncargaturaComponent } from './components/motivo-cancelacion-etapa-proceso-encargatura/motivo-cancelacion-etapa-proceso-encargatura.component';
import { RegistroIncorporarPlazaEncargaturaComponent } from './components/registro-incorporar-plaza-encargatura/registro-incorporar-plaza-encargatura.component';
import { InformacionPlazaComponent } from './components/informacion-plaza/informacion-plaza.component';
import { ValidaVinculacionVigenteEncargaturaComponent } from './components/valida-vinculacion-vigente-encargatura/valida-vinculacion-vigente-encargatura.component';
import { EncargaturaBandejaAdjudicacionComponent } from "./encargatura-bandeja-adjudicacion/encargatura-bandeja-adjudicacion.component";
import { ObservacionAdjudicacionEncargaturaComponent } from './components/observacion-adjudicacion-encargatura/observacion-adjudicacion-encargatura.component';
import { DetalleSubsanacionAdjudicacionEncargaturaComponent } from './components/detalle-subsanacion-adjudicacion-encargatura/detalle-subsanacion-adjudicacion-encargatura.component';
import { RegistroNoAdjudicarPlazaEncargaturaComponent } from './components/registro-no-adjudicar-plaza-encargatura/registro-no-adjudicar-plaza-encargatura.component';
import { SubsanarObservacionEncargaturaComponent } from './components/subsanar-observacion-adjudicacion-encargartura/subsanar-observacion-adjudicacion-encargatura.component';
import { RegistroExpedientePostulanteEncargaturaComponent } from './components/registro-expediente-postulante-encargatura/registro-expediente-postulante-encargatura.component';
import { RegistroPlazaPostulanteEncargaturaComponent } from './components/registro-plaza-postulante-encargatura/registro-plaza-postulante-encargatura.component';
import { RegistroInformeEscalafonarioPostulanteEncargaturaComponent } from './components/registro-informe-escalafonario-postulante-encargatura/registro-informe-escalafonario-postulante-encargatura.component';
import { ListadoPlazaPublicadaEncargaturaComponent } from "./components/listado-plaza-publicada-encargatura/listado-plaza-publicada-encargatura.component";
import { SancionServidorPublicoEncargaturaComponent } from "./components/sancion-servidor-publico-encargatura/sancion-servidor-publico-encargatura.component";
import { CabeceraPlazaEncargaturaComponent } from "./components/cabecera-plaza-encargatura/cabecera-plaza-encargatura.component";
import { MotivoRechazoConsolidadoPlazaEncargaturaComponent } from "./components/motivo-rechazo-consolidado-plaza-encargatura/motivo-rechazo-consolidado-plaza-encargatura.component";
import { EncargaturaBandejaConsolidadoPlazaComponent } from "./encargatura-bandeja-consolidado-plaza/encargatura-bandeja-consolidado-plaza.component";
import { EncargaturaBandejaAprobacionPlazaComponent } from "./encargatura-bandeja-aprobacion-plaza/encargatura-bandeja-aprobacion-plaza.component";
import { RegistroRechazoConsolidadoPlazaEncargaturaComponent } from "./components/registro-rechazo-consolidado-plaza-encargatura/registro-rechazo-consolidado-plaza-encargatura.component";
import { CabeceraPlazaPostulacionEncargaturaComponent } from "./components/cabecera-plaza-postulacion-encargatura/cabecera-plaza-postulacion-encargatura.component";
import { InformacionAdjudicacionEncargaturaComponent } from "./components/informacion-adjudicacion-encargatura/informacion-adjudicacion-encargatura.component";
import { EncargaturaIncorporarPlazaComponent } from "./encargatura-incorporar-plaza/encargatura-incorporar-plaza.component";
import { BuscarCentroTrabajoComponent } from "./components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BusquedaPlazaComponent } from "./components/busqueda-plaza/busqueda-plaza.component";
import { InformacionDocumentoSustentoEncargaturaComponent } from "./components/informacion-documento-sustento-encargatura/informacion-documento-sustento-encargatura.component";
import { BuscadorServidorPublicoComponent } from "./components/buscador-servidor-publico/buscador-servidor-publico.component";
import { CompararDatosAdjudicacionEncargaturaComponent } from "./components/comparar-datos-adjudicacion-encargatura/comparar-datos-adjudicacion-encargatura.component";
import { CompararDatosPlazaAdjudicacionEncargaturaComponent } from "./components/comparar-datos-plaza-adjudicacion-encargatura/comparar-datos-plaza-adjudicacion-encargatura.component";
import { CompararDatosServidorPublicoAdjudicacionEncargaturaComponent } from "./components/comparar-datos-servidor-publico-adjudicacion-encargatura/comparar-datos-servidor-publico-adjudicacion-encargatura.component";
import { EncargaturaRegistroAdjudicarPlazaComponent } from "./encargatura-registro-adjudicar-plaza/encargatura-registro-adjudicar-plaza.component";
import { EncargaturaInformacionCalificacionComponent } from "./encargatura-informacion-calificacion/encargatura-informacion-calificacion.component";
import { EncargaturaRegistroRequisitosCondicionesCalificacionComponent } from "./encargatura-registro-requisitos-condiciones-calificacion/encargatura-registro-requisitos-condiciones-calificacion.component";
import { MainComponent } from "./components/main/main.component";

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children:[
            {
                path: '',
                component: EncargaturaBandejaProcesoComponent
            },
            {
                path: 'plazas/:proceso/:etapa/:id/:desa',
                component: EncargaturaBandejaPlazaComponent
            },
            {
                path: 'postulantes/:proceso/:etapa/:id/:desa',
                component: EncargaturaBandejaPostulanteComponent
            },
            {
                path: 'calificaciones/:etapa/:id/:desa',
                component: EncargaturaBandejaCalificacionComponent
            },
            {
                path: "adjudicacion/:etapa/:id/:desa",
                component: EncargaturaBandejaAdjudicacionComponent
            },
            {
                path: "consolidado/:id",
                component: EncargaturaBandejaConsolidadoPlazaComponent
            },
            {
                path: "consolidado/aprobacion/:id/:desa/:cons",
                component: EncargaturaBandejaAprobacionPlazaComponent
            },
            {
                path: "incoporarPlazas/:proceso/:etapa/:id/:desa",
                component: EncargaturaIncorporarPlazaComponent
            },
            {
                path: 'requisitosycondiciones/:etapa/:id/:desa/:idCalificacion/:idPostulacion',
                component: EncargaturaRegistroRequisitosCondicionesCalificacionComponent
            },
            {
                path: 'registroadjudicarplaza/:etapa/:id/:desa/:idAdjudicacion/:idPostulacion',
                component: EncargaturaRegistroAdjudicarPlazaComponent
            },
            {
                path: 'informacioncalificacion/:etapa/:id/:desa/:idCalificacion/:idPostulacion',
                component: EncargaturaInformacionCalificacionComponent
            }
        ]
    }
]

@NgModule({
    declarations: [
        MainComponent,
        EncargaturaBandejaProcesoComponent,
        EncargaturaBandejaPlazaComponent,
        EncargaturaBandejaConsolidadoPlazaComponent,
        CabeceraEtapaProcesoEncargaturaComponent,
        CabeceraDesarrolloProcesoEncargaturaComponent,
        CabeceraPlazaEncargaturaComponent,
        DatosPostulanteEncargaturaComponent,
        EncargaturaBandejaPostulanteComponent,
        PestanaPlazaEncargaturaComponent,
        InformacionPlazaEncargaturaComponent,
        RegistroDocumentoSustentoEncargaturaComponent,
        MotivoNoPublicacionPlazaEncargaturaComponent,
        EncargaturaBandejaCalificacionComponent,
        PestanaCalificacionEncargaturaComponent,
        RegistroObservacionPostulanteEncargaturaComponent,
        RegistroReclamoPostulanteEncargaturaComponent,
        RegistroPostulanteEncargaturaComponent,
        InformacionPostulanteEncargaturaComponent,
        ModificarPostulanteEncargaturaComponent,
        ObservacionCalificacionEncargaturaComponent,
        ReclamoCalificacionEncargaturaComponent,
        MotivoCancelacionEtapaProcesoEncargaturaComponent,
        RegistroIncorporarPlazaEncargaturaComponent,
        InformacionPlazaComponent,
        ValidaVinculacionVigenteEncargaturaComponent,
        EncargaturaBandejaAdjudicacionComponent,
        ObservacionAdjudicacionEncargaturaComponent,
        DetalleSubsanacionAdjudicacionEncargaturaComponent,
        RegistroNoAdjudicarPlazaEncargaturaComponent,
        SubsanarObservacionEncargaturaComponent,
        RegistroExpedientePostulanteEncargaturaComponent,
        RegistroPlazaPostulanteEncargaturaComponent,
        RegistroInformeEscalafonarioPostulanteEncargaturaComponent,
        ListadoPlazaPublicadaEncargaturaComponent,
        SancionServidorPublicoEncargaturaComponent,
        MotivoRechazoConsolidadoPlazaEncargaturaComponent,
        EncargaturaBandejaAprobacionPlazaComponent,
        RegistroRechazoConsolidadoPlazaEncargaturaComponent,
        CabeceraPlazaPostulacionEncargaturaComponent,
        InformacionAdjudicacionEncargaturaComponent,
        EncargaturaIncorporarPlazaComponent,
        BuscarCentroTrabajoComponent,
        BusquedaPlazaComponent,
        InformacionDocumentoSustentoEncargaturaComponent,
        BuscadorServidorPublicoComponent,
        EncargaturaRegistroRequisitosCondicionesCalificacionComponent,
        CompararDatosAdjudicacionEncargaturaComponent,
        CompararDatosPlazaAdjudicacionEncargaturaComponent,
        CompararDatosServidorPublicoAdjudicacionEncargaturaComponent,
        EncargaturaRegistroAdjudicarPlazaComponent,
        EncargaturaInformacionCalificacionComponent
    ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule
    ]
})
export class EncargaturaModule { }