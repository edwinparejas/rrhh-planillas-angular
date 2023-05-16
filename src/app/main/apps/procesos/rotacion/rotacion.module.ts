import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MineduSidebarModule } from "@minedu/components/sidebar/sidebar.module";
import { MineduSharedModule } from "@minedu/shared.module";
import { MaterialModule } from "app/material/material.module";
import { MineduComponentsModule } from "../../components/minedu-components.module";
import { BandejaRotacionComponent } from "./bandeja-rotacion/bandeja-rotacion.component";
import { BandejaRotacionPlazaComponent } from "./bandeja-plaza/bandeja-plaza.component";
import { BandejaPostulanteComponent } from './bandeja-postulante/bandeja-postulante.component';
import { BandejaCalificacionComponent } from './bandeja-calificacion/bandeja-calificacion.component';
import { BandejaAjudicacionComponent } from './bandeja-ajudicacion/bandeja-ajudicacion.component';
import { CabeceraProcesoEtapaComponent } from './components/cabecera-proceso-etapa/cabecera-proceso-etapa.component';
import { CabeceraProcesoEtapaResolverService } from "app/core/data/resolvers/rotacion-type-resolver.service";
import { BusquedaCentroTrabajoComponent } from './components/busqueda-centro-trabajo/busqueda-centro-trabajo.component';
import { BusquedaPlazaComponent } from './components/busqueda-plaza/busqueda-plaza.component';
import { MotivoCancelacionProcesoComponent } from './components/motivo-cancelacion-proceso/motivo-cancelacion-proceso.component';
import { InformacionDocumentoSustentoComponent } from './components/informacion-documento-sustento/informacion-documento-sustento.component';
import { InformacionPlazaRotacionComponent } from './components/informacion-plaza-rotacion/informacion-plaza-rotacion.component';
import { SustentoMotivoNoPublicacionPlazaComponent } from './components/sustento-motivo-no-publicacion-plaza/sustento-motivo-no-publicacion-plaza.component';
import { InformacionMotivoNoPublicacionPlazaComponent } from './components/informacion-motivo-no-publicacion-plaza/informacion-motivo-no-publicacion-plaza.component';
import { BandejaPlazasPrepublicadasComponent } from './bandeja-plaza/bandeja-plazas-prepublicadas/bandeja-plazas-prepublicadas.component';
import { BandejaPlazasConvocadasComponent } from './bandeja-plaza/bandeja-plazas-convocadas/bandeja-plazas-convocadas.component';
import { BandejaPlazasObservadasComponent } from './bandeja-plaza/bandeja-plazas-observadas/bandeja-plazas-observadas.component';
import { BandejaPlazasResultadosfinalesComponent } from './bandeja-plaza/bandeja-plazas-resultadosfinales/bandeja-plazas-resultadosfinales.component';
import { BandejaPostulanteRegistrarComponent } from './bandeja-postulante/bandeja-postulante-registrar/bandeja-postulante-registrar.component';
import { DatePipe } from "@angular/common";
import { IncorporarPlazasComponent } from './bandeja-plaza/bandeja-plazas-prepublicadas/incorporar-plazas/incorporar-plazas.component';
import { InformacionPlazaComponent } from './components/informacion-plaza/informacion-plaza.component';
import { BusquedaDocumentoIdentidadComponent } from './components/busqueda-documento-identidad/busqueda-documento-identidad.component';
import { BandejaPostulanteAccionesComponent } from './bandeja-postulante/bandeja-postulante-acciones/bandeja-postulante-acciones.component';
import { CuadroMeritoPreliminarComponent } from './bandeja-calificacion/cuadro-merito-preliminar/cuadro-merito-preliminar.component';
import { CuadroMeritoFinalComponent } from './bandeja-calificacion/cuadro-merito-final/cuadro-merito-final.component';
import { RegistroCalificacionesComponent } from './bandeja-calificacion/registro-calificaciones/registro-calificaciones.component';
import { ObservarPostulanteComponent } from './bandeja-calificacion/components/observar-postulante/observar-postulante.component';
import { ObservarPostulanteVerComponent } from './bandeja-calificacion/components/observar-postulante-ver/observar-postulante-ver.component';
import { RegistrarReclamoComponent } from './bandeja-calificacion/components/registrar-reclamo/registrar-reclamo.component';
import { RegistrarReclamoVerComponent } from './bandeja-calificacion/components/registrar-reclamo-ver/registrar-reclamo-ver.component';
import { AdjudicarPlazaComponent } from './bandeja-ajudicacion/adjudicar-plaza/adjudicar-plaza.component';
import { NoAdjudicarPlazaComponent } from './bandeja-ajudicacion/no-adjudicar-plaza/no-adjudicar-plaza.component';
import { SubsanarObservacionComponent } from './bandeja-ajudicacion/subsanar-observacion/subsanar-observacion.component';
import { VerObservacionComponent } from './bandeja-ajudicacion/ver-observacion/ver-observacion.component';
import { VerSubsanacionObservacionComponent } from './bandeja-ajudicacion/ver-subsanacion-observacion/ver-subsanacion-observacion.component';
import { BusquedaCentrosTrabajoComponent } from "./components/busqueda-centros-trabajo/busqueda-centros-trabajo.component";
import { VerInformacionCompletaComponent } from "./bandeja-ajudicacion/ver-informacion-completa/ver-informacion-completa.component";
import { ActualizarDatosServidorPublicoComponent } from "./bandeja-ajudicacion/actualizar-datos-servidor-publico/actualizar-datos-servidor-publico.component";
import { ActualizarDatosPlazaComponent } from "./bandeja-ajudicacion/actualizar-datos-plaza/actualizar-datos-plaza.component";
import { ModalDocumentosPublicadosComponent } from "./bandeja-plaza/modal-documentos-publicados/modal-documentos-publicados.component";
import { ModalServidorPublicoVinculadoComponent } from "./bandeja-postulante/bandeja-postulante-registrar/modal-servidor-publico-vinculado/modal-servidor-publico-vinculado.component";

const routes: Routes = [
    {
        path: "",
        component: BandejaRotacionComponent,
    },
    {
        path: "plazas/:paramIdProceso/:paramIdDesarrolloProceso",
        component: BandejaRotacionPlazaComponent,
        resolve: {
            ProcesoEtapa: CabeceraProcesoEtapaResolverService
        }
    },
    {
        path: 'postulante/:paramIdProceso/:paramIdDesarrolloProceso',
        component: BandejaPostulanteComponent,
        resolve: {
            ProcesoEtapa: CabeceraProcesoEtapaResolverService
        }
    },
    {
        path: 'adjudicacion/:paramIdProceso/:paramIdDesarrolloProceso',
        component: BandejaAjudicacionComponent,
        resolve: {
            ProcesoEtapa: CabeceraProcesoEtapaResolverService
        }
    },
    {
        path: "calificacion/:paramIdProceso/:paramIdDesarrolloProceso",
        component: BandejaCalificacionComponent,
        resolve: {
            ProcesoEtapa: CabeceraProcesoEtapaResolverService
        }
    },
    {
        path: "registrarcalificacion/:idCalificacion/:idTipoModal/:idCalificacionDetalle/:idPostulacion/:idEtapaProceso/:paramIdProceso/:paramIdDesarrolloProceso", component: RegistroCalificacionesComponent,
        //path: "registrarcalificacion/:id/:id1", component: RegistroCalificacionesComponent,
    },
    {
        path: "calificacion/:paramIdProceso/:paramIdDesarrolloProceso", component: CuadroMeritoPreliminarComponent
    },
    {
        path: "incorporarPlazas/:idPlazaRotacion/:idDesarrolloProceso/:idEtapaProceso", component: IncorporarPlazasComponent,
        //path: "registrarcalificacion/:id/:id1", component: RegistroCalificacionesComponent,
    }, 
];

@NgModule({
    declarations: [
        BandejaRotacionComponent,
        BandejaRotacionPlazaComponent,
        BandejaPostulanteComponent,
        BandejaCalificacionComponent,
        BandejaAjudicacionComponent,
        CabeceraProcesoEtapaComponent,
        BusquedaCentroTrabajoComponent,
        BusquedaCentrosTrabajoComponent,
        BusquedaPlazaComponent,
        MotivoCancelacionProcesoComponent,
        InformacionDocumentoSustentoComponent,
        InformacionPlazaRotacionComponent,
        SustentoMotivoNoPublicacionPlazaComponent,
        InformacionMotivoNoPublicacionPlazaComponent,
        BandejaPlazasPrepublicadasComponent,
        BandejaPlazasConvocadasComponent,
        BandejaPlazasObservadasComponent,
        BandejaPlazasResultadosfinalesComponent,
        BandejaPostulanteRegistrarComponent,
        IncorporarPlazasComponent,
        InformacionPlazaComponent,
        BusquedaDocumentoIdentidadComponent,
        BandejaPostulanteAccionesComponent,
        CuadroMeritoPreliminarComponent,
        CuadroMeritoFinalComponent,
        RegistroCalificacionesComponent,
        ObservarPostulanteComponent,
        ObservarPostulanteVerComponent,
        RegistrarReclamoComponent,
        RegistrarReclamoVerComponent,
        AdjudicarPlazaComponent,
        NoAdjudicarPlazaComponent,
        SubsanarObservacionComponent,
        VerObservacionComponent,
        VerSubsanacionObservacionComponent,
        VerInformacionCompletaComponent,
        ActualizarDatosServidorPublicoComponent,
        ActualizarDatosPlazaComponent,
        ModalDocumentosPublicadosComponent,
        ModalServidorPublicoVinculadoComponent
    ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
    ],
    entryComponents: [
        BusquedaCentroTrabajoComponent,
        BusquedaCentrosTrabajoComponent,
        BusquedaPlazaComponent,
        CabeceraProcesoEtapaComponent,
        MotivoCancelacionProcesoComponent,
        InformacionDocumentoSustentoComponent,
        InformacionPlazaRotacionComponent,
        SustentoMotivoNoPublicacionPlazaComponent,
        InformacionMotivoNoPublicacionPlazaComponent,
        BandejaPostulanteRegistrarComponent,
        BusquedaDocumentoIdentidadComponent
    ],
    providers: [
        DatePipe,
    ]
})
export class RotacionModule { }
