import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { BandejaPrincipalComponent } from './principal/container//bandeja-principal.component';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BandejaPostulanteComponent } from './postulante/container//bandeja-postulante.component';
import { BuscadorServidorPublicoComponent } from './components/buscador-servidor-publico/buscador-servidor-publico.component';
import { BuscarServidorPublicoComponent} from './components/buscar-servidor-publico/buscar-servidor-publico.component';
import { BuscarVinculacionesComponent} from './components/buscar-vinculaciones/buscar-vinculaciones.component';
import { BuscarPlazaComponent } from './components/buscar-plaza/buscar-plaza.component';
import { DocumentosPublicadosPrepublicacionComponent } from './components/documentos-publicados-prepublicacion/documentos-publicados-prepublicacion.component';
import { DocumentosPrepublicadosFechaComponent } from './components/documentos-prepublicados-fecha/documentos-prepublicados-fecha.component';
import { DocumentosPublicadosComponent } from './components/documentos-publicados/documentos-publicados.component';
import { BandejaCalificacionComponent } from './calificacion/container/bandeja-calificacion.component';
import { CalificacionFinalComponent } from './calificacion/components/calificacion-otras/calificacion-otras.component';
// import { BandejaPublicacionComponent } from './publicacion/container/bandeja-publicacion.component';
import { RegistraPostulanteComponent } from './postulante/components/registra-postulante/registra-postulante.component';
import { DocumetoSustentoModule } from './components/documentos-sustento/documento-sustento.module';
import { FormacionAcademicaComponent } from './postulante/components/formacion-academica/formacion-academica.component';
import { CapacitacionesComponent } from './postulante/components/capacitaciones/capacitaciones.component';
import { ExperienciaLaboralComponent } from './postulante/components/experiencia-laboral/experiencia-laboral.component';
import { InformacionDocumentoSustentoComponent } from './components/informacion-documento-sustento/informacion-documento-sustento.component';
import { InformacionPostulanteComponent } from './postulante/components/informacion-postulante/informacion-postulante.component';
import { InformacionCapacitacionesComponent } from './postulante/components/informacion-capacitaciones/informacion-capacitaciones.component';
import { InformacionFormacionAcademicaComponent } from './postulante/components/informacion-formacion-academica/informacion-formacion-academica.component';
import { InformacionExperienciaLaboralComponent } from './postulante/components/informacion-experiencia-laboral/informacion-experiencia-laboral.component';
// import { PlazasPublicacionComponent } from './publicacion/components/plazas-publicacion/plazas-publicacion.component';
// import { PlazasObservadasComponent } from './publicacion/components/plazas-observadas/plazas-observadas.component';
import { PrePublicacionComponent } from './pre-publicacion/pre-publicacion.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { MotivoCancelacionComponent } from './components/motivo-cancelacion/motivo-cancelacion.component';
// import { PlazasReasignacionComponent } from './components/plazas-reasignacion/plazas-reasignacion.component';
import { PlazasReasignacionPrepublicacionComponent } from './pre-publicacion/components/plazas-reasignacion-prepublicacion/plazas-reasignacion-prepublicacion.component';
import { PlazasObservadasPrepublicacionComponent } from './pre-publicacion/components/plazas-observadas-prepublicacion/plazas-observadas-prepublicacion.component';
import { DynamicTableComponent } from './components/dynamic-table/dynamic-table.component';
import { PlazasObservadasPPComponent } from './components/plazas-observadas-pp/plazas-observadas-pp.component';
import { IncorporarPlazasComponent } from './components/incorporar-plazas/incorporar-plazas.component';
import { ConsolidadoPlazasComponent } from './consolidado-plazas/consolidado-plazas.component';
import { PlazasConvocarComponent } from './plazas-convocar/plazas-convocar.component';
import { RechazarPlazasComponent } from './rechazar-plazas/rechazar-plazas.component';
import { BandejaConsolidadoPlazaComponent } from "./consolidado-plaza/bandeja-consolidado-plaza.component";
import { BandejaConsolidadoPlazaDetalleComponent } from "./consolidado-plaza/bandeja-consolidado-plaza-detalle/bandeja-consolidado-plaza-detalle.component";
import { InformacionProcesoEtapaComponent } from './components/informacion-proceso-etapa/informacion-proceso-etapa.component';
import { MotivoRechazoComponent } from "./consolidado-plaza/components/motivo-rechazo/motivo-rechazo.component";
import { RegistrarRechazoComponent } from "./consolidado-plaza/components/registrar-rechazo/registrar-rechazo.component";
import { ConsolidadoPlazasConvocarComponent } from "./consolidado-plaza/components/consolidado-plazas-convocar/consolidado-plazas-convocar.component";
import { ConsolidadoPlazasObservadasComponent } from "./consolidado-plaza/components/consolidado-plazas-observadas/consolidado-plazas-observadas.component";
import { AgregarPostulanteComponent } from './postulante/components/agregar-postulante/agregar-postulante.component';
import { BusquedaAvanzadaComponent } from './postulante/components/busqueda-avanzada/busqueda-avanzada.component';
import { BandejaAjudicacionComponent } from './adjudicacion/container/bandeja-ajudicacion.component';
import { CabeceraProcesoEtapaComponent } from './components/cabecera-proceso-etapa/cabecera-proceso-etapa.component';
import { BandejaPlazasComponent } from './plazas/container/bandeja-plazas/bandeja-plazas.component';
import { ReasignacionMatTableComponent } from './plazas/components/reasignacion-mat-table/reasignacion-mat-table.component';
import { InformacionPlazaComponent } from './plazas/components/informacion-plaza/informacion-plaza.component';
import { InformacionSustentoNopublicacionComponent } from './plazas/components/informacion-sustento-nopublicacion/informacion-sustento-nopublicacion.component';
import { InformacionMotivoNopublicacionComponent } from './plazas/components/informacion-motivo-nopublicacion/informacion-motivo-nopublicacion.component';
import { InformacionMotivoRechazoComponent } from './plazas/components/informacion-motivo-rechazo/informacion-motivo-rechazo.component';
import { MotivoNoPublicacionComponent } from './plazas/components/motivo-no-publicacion/motivo-no-publicacion.component';
import { BandejaPlazasConvocadasComponent } from './plazas/components/bandeja-plazas-convocadas/bandeja-plazas-convocadas.component';
import { BandejaPlazasPrepublicadasComponent } from './plazas/components/bandeja-plazas-prepublicadas/bandeja-plazas-prepublicadas.component';
import { BandejaPlazasObservadasComponent } from './plazas/components/bandeja-plazas-observadas/bandeja-plazas-observadas.component';
import { BandejaPlazasResultadosfinalesComponent } from './plazas/components/bandeja-plazas-resultadosfinales/bandeja-plazas-resultadosfinales.component';
import { BandejaPlazasReasignacionComponent } from './plazas/components/bandeja-plazas-reasignacion/bandeja-plazas-reasignacion.component';
import { BandejaPlazasPublicadasComponent } from './plazas/components/bandeja-plazas-publicadas/bandeja-plazas-publicadas.component';
import { BandejaPlazasResultadosfinalesFase2Component } from './plazas/components/bandeja-plazas-resultadosfinales-fase2/bandeja-plazas-resultadosfinales-fase2.component';
import { SustentoMotivoNoPublicacionPlazaComponent } from './plazas/components/sustento-motivo-no-publicacion-plaza/sustento-motivo-no-publicacion-plaza.component';
import { RegistrarCalificacionComponent } from './calificacion/components/registrar-calificacion/registrar-calificacion.component';
import { ResultadosPreliminaresComponent } from './calificacion/components/resultados-preliminares/resultados-preliminares.component';
import { ResultadosFinalesComponent } from './calificacion/components/resultados-finales/resultados-finales.component';
import { CuadroMeritoComponent } from './calificacion/components/cuadro-merito/cuadro-merito.component';
import { RegistroCalificacionesComponent } from './calificacion/components/registro-calificaciones/registro-calificaciones.component';
import { ObservarPostulanteComponent } from './calificacion/components/observar-postulante/observar-postulante.component';
import { ObservarPostulanteVerComponent } from './calificacion/components/observar-postulante-ver/observar-postulante-ver.component';
import { RegistrarReclamoComponent } from './calificacion/components/registrar-reclamo/registrar-reclamo.component';
import { RegistrarReclamoVerComponent } from './calificacion/components/registrar-reclamo-ver/registrar-reclamo-ver.component';
import { AdjudicarPlazaComponent } from './adjudicacion/components/adjudicar-plaza/adjudicar-plaza.component';
import { NoAdjudicarPlazaComponent } from './adjudicacion/components/no-adjudicar-plaza/no-adjudicar-plaza.component';
import { SubsanarObservacionComponent } from './adjudicacion/components/subsanar-observacion/subsanar-observacion.component';
import { VerObservacionComponent } from './adjudicacion/components/ver-observacion/ver-observacion.component';
import { VerSubsanarObservacionComponent } from './adjudicacion/components/ver-subsanar-observacion/ver-subsanar-observacion.component';
import { InformacionPostulanteCalificacionComponent } from './calificacion/components/informacion-postulante-calificacion/informacion-postulante-calificacion.component'
import { validacionServidorPublicoComponent } from './adjudicacion/components/validacion-servidor-publico/validacion-servidor-publico.component';
import { validacionPlazaComponent } from './adjudicacion/components/validacion-plaza/validacion-plaza.component';
import { InformacionAdjudicacionComponent } from './adjudicacion/components/informacion-adjudicacion/informacion-adjudicacion.component';
import { CabeceraProcesoEtapaResolverService } from "app/core/data/resolvers/reasignacion-type-resolver.service";
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            { 
                path: '', component: BandejaPrincipalComponent },
            {
                path: "postulante/:paramIdEtapaProceso/:paramIdAlcanceProceso", component: BandejaPostulanteComponent
            },
            {
                path: 'calificacion-otras/:id', component: BandejaCalificacionComponent
            },    
            {
                path: "calificacion/:paramIdEtapaProceso/:paramIdAlcanceProceso", component: BandejaCalificacionComponent
            }, 
            {
                path: "registrarcalificacion/:id/:id1", component: RegistrarCalificacionComponent,
            },
            {
                path: "adjudicacion/:paramIdEtapaProceso/:paramIdAlcanceProceso", component: BandejaAjudicacionComponent
            },
            {
                path: "adjudicarplaza/:id/:id1", component: AdjudicarPlazaComponent,
            },
            {
                path: "pre-publicacion/:paramIdEtapaProceso/:paramIdAlcanceProceso", component: PrePublicacionComponent
            },
            {
                path: 'consolidado-plazas/:id', component: ConsolidadoPlazasComponent
            },
            {
                path: "consolidado/:id", component: BandejaConsolidadoPlazaComponent,
            },
            {
                path: "consolidadoplazadetalle/:id/:id1", component: BandejaConsolidadoPlazaDetalleComponent,
            },
            {
                path: 'plazas-convocar/:id', component: PlazasConvocarComponent
            },
            {
                path: 'adjudicacion/:id', component: BandejaAjudicacionComponent
            },
            {
                path: "plazas/:paramIdEtapaProceso/:paramIdAlcanceProceso", component: BandejaPlazasComponent
            },
            {
                path: 'incorporar-plazas/:id', component: IncorporarPlazasComponent
            }
        ]
    }
];

@NgModule({
    declarations: [
        MainComponent,
        BandejaPrincipalComponent,
        BandejaPostulanteComponent,
        BuscadorServidorPublicoComponent,
        BuscarServidorPublicoComponent,
        BuscarVinculacionesComponent,
        BuscarPlazaComponent,
        DocumentosPublicadosComponent,
        DocumentosPublicadosPrepublicacionComponent,
        DocumentosPrepublicadosFechaComponent,
        BandejaCalificacionComponent,
        CalificacionFinalComponent,
        // BandejaPublicacionComponent,
        RegistraPostulanteComponent,
        FormacionAcademicaComponent,
        CapacitacionesComponent,
        ExperienciaLaboralComponent,
        InformacionDocumentoSustentoComponent,
        InformacionPostulanteComponent,
        InformacionDocumentoSustentoComponent,
        InformacionCapacitacionesComponent,
        InformacionFormacionAcademicaComponent,
        InformacionExperienciaLaboralComponent,
        // PlazasPublicacionComponent,
        // PlazasObservadasComponent,
        PrePublicacionComponent,
        MotivoCancelacionComponent,
        // PlazasReasignacionComponent,
        PlazasReasignacionPrepublicacionComponent,
        PlazasObservadasPrepublicacionComponent,
        DynamicTableComponent,
        PlazasObservadasPPComponent,
        IncorporarPlazasComponent,
        ConsolidadoPlazasComponent,
        BandejaConsolidadoPlazaComponent,
        BandejaConsolidadoPlazaDetalleComponent,
        PlazasConvocarComponent,
        RechazarPlazasComponent,
        AgregarPostulanteComponent,
        BusquedaAvanzadaComponent,
        BandejaAjudicacionComponent,
        CabeceraProcesoEtapaComponent,
        BandejaPlazasComponent,
        BandejaPlazasReasignacionComponent,
        ReasignacionMatTableComponent,
        InformacionPlazaComponent,
        InformacionSustentoNopublicacionComponent,
        InformacionMotivoNopublicacionComponent,
        InformacionMotivoRechazoComponent,
        MotivoNoPublicacionComponent,
        CabeceraProcesoEtapaComponent,
        BandejaPlazasConvocadasComponent,
        BandejaPlazasPrepublicadasComponent,
        BandejaPlazasObservadasComponent,
        BandejaPlazasResultadosfinalesComponent,
        BandejaPlazasPublicadasComponent,
        BandejaPlazasResultadosfinalesFase2Component,
        SustentoMotivoNoPublicacionPlazaComponent,
        // CuadroMeritoPreliminarComponent,
        // CuadroMeritoFinalComponent,
        RegistrarCalificacionComponent,
        ResultadosPreliminaresComponent,
        ResultadosFinalesComponent,
        RegistroCalificacionesComponent,
        ObservarPostulanteComponent,
        ObservarPostulanteVerComponent,
        RegistrarReclamoComponent,
        RegistrarReclamoVerComponent,
        CuadroMeritoComponent,
        BandejaAjudicacionComponent,
        AdjudicarPlazaComponent,
        NoAdjudicarPlazaComponent,
        SubsanarObservacionComponent,
        VerObservacionComponent,
        VerSubsanarObservacionComponent,
        validacionServidorPublicoComponent,
        validacionPlazaComponent,
        validacionPlazaComponent,
        InformacionAdjudicacionComponent,
        InformacionPostulanteCalificacionComponent,
        InformacionProcesoEtapaComponent,
        BuscarCentroTrabajoComponent,
        MotivoRechazoComponent,
        RegistrarRechazoComponent,
        ConsolidadoPlazasConvocarComponent,
        ConsolidadoPlazasObservadasComponent

    ],
    imports: [
        MaterialModule,
        CommonModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        DocumetoSustentoModule,
    ],
    providers: [DecimalPipe, DatePipe],
})

export class ReasignacionModule { }


