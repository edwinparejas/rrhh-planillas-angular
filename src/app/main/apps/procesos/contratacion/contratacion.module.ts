import { NgModule } from "@angular/core";
import { CommonModule, DecimalPipe, DatePipe } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MaterialModule } from "../../../../material/material.module";
import { MineduSharedModule } from "../../../../../@minedu/shared.module";
import { MineduSidebarModule } from "../../../../../@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../../components/minedu-components.module";
import { DocumetoSustentoModule } from "./components/documentos-sustento/documento-sustento.module";
import { BandejaPrincipalComponent } from "./principal/bandeja-principal.component";
import { BandejaCalificacionComponent } from "./calificacion/fase1/container/bandeja-calificacion.component";
import { BandejaAdjudicacionComponent } from "./adjudicacion/container/bandeja-adjudicacion.component";
import { BandejaPublicacionComponent } from "./publicacion/container/bandeja-publicacion.component";
import { PlazasObservadasComponent } from "./publicacion/components/plazas-observadas/plazas-observadas.component";
import { PlazasPublicacionComponent } from "./publicacion/components/plazas-publicacion/plazas-publicacion.component";
import { PlazasConvocarComponent } from "./publicacion/components/plazas-convocar/plazas-convocar.component";
import { InformacionPlazaComponent } from "./publicacion/components/informacion-plaza/informacion-plaza.component";
import { RegistraMotivoNoPublicacionComponent } from "./publicacion/components/registra-motivo-no-publicacion/registra-motivo-no-publicacion.component";
import { BusquedaPlazaComponent } from "./components/busqueda-plaza/busqueda-plaza.component";
import { BandejaPostulanteComponent } from "./postulante/container/bandeja-postulante.component";
import { RegistraPostulanteComponent } from "./postulante/components/registra-postulante/registra-postulante.component";
import { BuscarCentroTrabajoComponent } from "./components/buscar-centro-trabajo/buscar-centro-trabajo.component";
import { BuscadorServidorPublicoComponent } from "./components/buscador-servidor-publico/buscador-servidor-publico.component";
import { FormacionAcademicaComponent } from "./postulante/components/formacion-academica/formacion-academica.component";
import { CapacitacionesComponent } from "./postulante/components/capacitaciones/capacitaciones.component";
import { ExperienciaLaboralComponent } from "./postulante/components/experiencia-laboral/experiencia-laboral.component";
import { InformacionPostulanteComponent } from "./postulante/components/informacion-postulante/informacion-postulante.component";
import { InformacionDocumentoSustentoComponent } from "./components/informacion-documento-sustento/informacion-documento-sustento.component";
import { InformacionCapacitacionesComponent } from "./postulante/components/informacion-capacitaciones/informacion-capacitaciones.component";
import { InformacionFormacionAcademicaComponent } from "./postulante/components/informacion-formacion-academica/informacion-formacion-academica.component";
import { InformacionExperienciaLaboralComponent } from "./postulante/components/informacion-experiencia-laboral/informacion-experiencia-laboral.component";
import { PlazasResultadoFinalComponent } from "./publicacion/components/plazas-resultado-final/plazas-resultado-final.component";
import { RegistrarCalificacionComponent } from "./calificacion/components/registrar-calificacion/registrar-calificacion.component";
import { InformacionCalificacionComponent } from "./calificacion/components/informacion-calificacion/informacion-calificacion.component";
import { BandejaConsolidadoPlazaComponent } from "./consolizadoplaza/bandeja-consolidado-plaza.component";
import { MotivoRechazoComponent } from "./consolizadoplaza/components/motivo-rechazo/motivo-rechazo.component";
import { BandejaConsolidadoPlazaDetalleComponent } from "./consolizadoplaza/bandeja-consolidado-plaza-detalle/bandeja-consolidado-plaza-detalle.component";
import { RegistrarRechazoComponent } from "./consolizadoplaza/components/registrar-rechazo/registrar-rechazo.component";
import { ConsolidadoPlazasConvocarComponent } from "./consolizadoplaza/components/consolidado-plazas-convocar/consolidado-plazas-convocar.component";
import { ConsolidadoPlazasObservadasComponent } from "./consolizadoplaza/components/consolidado-plazas-observadas/consolidado-plazas-observadas.component";
import { CargaMasivaComponent } from "./../../components/carga-masiva/carga-masiva.component";
import { CargaMasivaResolverService } from "app/core/data/resolvers/carga-masiva-type-resolver.service";
import { ResultadoPunComponent } from "./calificacion/components/resultado-pun/resultado-pun.component";
import { CriterioEvaluacionComponent } from "./calificacion/components/criterio-evaluacion/criterio-evaluacion.component";
import { RegistrarMotivoComponent } from "./adjudicacion/components/registrar-motivo/registrar-motivo.component";
import { DetalleObservacionComponent } from "./adjudicacion/components/detalle-observacion/detalle-observacion.component";
import { AdjudicarPlazaComponent } from "./adjudicacion/adjudicar-plaza/adjudicar-plaza.component";
import { RequisitoMinimoComponent } from "./calificacion/components/requisito-minimo/requisito-minimo.component";
import { RegistrarReclamoComponent } from "./calificacion/components/registrar-reclamo/registrar-reclamo.component";
import { CalificacionFinalComponent } from "./calificacion/otras/components/calificacion-otras/calificacion-otras.component";
import { BandejaCalificacionOtrasComponent } from "./calificacion/otras/container/bandeja-calificacion-otras.component";
import { InformacionAdjudicacionComponent } from "./adjudicacion/components/informacion-adjudicacion/informacion-adjudicacion.component";
import { BandejaPrepublicacion30328Component } from "./prepublicacion30328/bandeja-prepublicacion30328.component";
import { InformacionPlaza30328Component } from "./prepublicacion30328/informacion-plaza/informacion-plaza30328.component";
import { BandejaValidacionPlazasComponent } from './validacionplaza/bandeja-validacion-plazas.component';
import { InformacionProcesoEtapaComponent } from './components/informacion-proceso-etapa/informacion-proceso-etapa.component';
import { InformacionPlazaValidacionComponent } from './validacionplaza/informacion-plaza-validacion/informacion-plaza-validacion.component';
import { ModalPlazaObservadaComponent } from './validacionplaza/modal-plaza-observada/modal-plaza-observada.component';
import { ModalInformacionSustentoComponent } from './validacionplaza/modal-informacion-sustento/modal-informacion-sustento.component';
import { ModalInformacionPlazaObservadaComponent } from './validacionplaza/modal-informacion-plaza-observada/modal-informacion-plaza-observada.component';
import { BandejaIncorporacionPlazasComponent } from './contrataciondirecta/bandeja-incorporacion-plazas/bandeja-incorporacion-plazas.component';
import { ModalIncorporacionPlazasComponent } from './contrataciondirecta/bandeja-incorporacion-plazas/modal-incorporacion-plazas/modal-incorporacion-plazas.component';
import { ModalInformacionPlazaComponent } from './contrataciondirecta/bandeja-incorporacion-plazas/modal-informacion-plaza/modal-informacion-plaza.component';
import { BandejaPostulantesComponent } from './contrataciondirecta/bandeja-postulantes/bandeja-postulantes.component';
import { ModalNuevoPostulanteComponent } from './contrataciondirecta/bandeja-postulantes/modal-nuevo-postulante/modal-nuevo-postulante.component';
import { ModalInformacionPostulanteComponent } from './contrataciondirecta/bandeja-postulantes/modal-informacion-postulante/modal-informacion-postulante.component';
import { ModalEditarPostulanteComponent } from './contrataciondirecta/bandeja-postulantes/modal-editar-postulante/modal-editar-postulante.component';
import { ModalSancionPostulanteComponent } from './contrataciondirecta/bandeja-postulantes/modal-sancion-postulante/modal-sancion-postulante.component';
import { BandejaCalificacionesComponent } from './contrataciondirecta/bandeja-calificaciones/bandeja-calificaciones.component';
import { ModalInformacionPlazaPUNComponent } from './contratacionresultadospun/bandeja-incorporacion-plazas-pun/modal-informacion-plaza-pun/modal-informacion-plaza-pun.component';
import { ModalIncorporacionPlazasPUNComponent } from './contratacionresultadospun/bandeja-incorporacion-plazas-pun/modal-incorporacion-plazas-pun/modal-incorporacion-plazas-pun.component';
import { BandejaIncorporacionPlazasPUNComponent } from './contratacionresultadospun/bandeja-incorporacion-plazas-pun/bandeja-incorporacion-plazas-pun.component';
import { ModalDocumentosPublicadosComponent } from './components/modal-documentos-publicados/modal-documentos-publicados.component';
import { BandejaCalificacionesPUNComponent } from './contratacionresultadospun/bandeja-calificaciones-pun/bandeja-calificaciones-pun.component';
import { RegistrarCalificacionesPUNComponent } from './contratacionresultadospun/bandeja-calificaciones-pun/registrar-calificaciones-pun/registrar-calificaciones-pun.component';
import { InformacionPostulanteCalificacionComponent } from './components/informacion-postulante-calificacion/informacion-postulante-calificacion.component';
import { ModaRegistrarReclamoPUNComponent } from './contratacionresultadospun/bandeja-calificaciones-pun/modal-registrar-reclamo-pun/modal-registrar-reclamo-pun.component';
import { RequisitosCalificacionesComponent } from './contrataciondirecta/bandeja-calificaciones/requisitos-calificaciones/requisitos-calificaciones.component';
import { InformacionCompletaComponent } from './contrataciondirecta/bandeja-calificaciones/informacion-completa/informacion-completa.component';
import { BandejaAdjudicacionPUNComponent } from './contratacionresultadospun/bandeja-adjudicacion-pun/bandeja-adjudicacion-pun.component';
import { ModalNoAdjudicarPUNComponent } from './contratacionresultadospun/bandeja-adjudicacion-pun/modal-no-adjudicar-pun/modal-no-adjudicar-pun.component';
import { ModalVerObservacionPUNComponent } from "./contratacionresultadospun/bandeja-adjudicacion-pun/modal-ver-observacion-pun/modal-ver-observacion-pun.component";
import { ModalSubsanarObservacionPUNComponent } from "./contratacionresultadospun/bandeja-adjudicacion-pun/modal-subsanar-observacion-pun/modal-subsanar-observacion-pun.component";
import { ModalObservarPostulacionPUNComponent } from './contratacionresultadospun/bandeja-calificaciones-pun/modal-observar-postulacion-pun/modal-observar-postulacion-pun.component';
import { AdjudicarPlazaPUNComponent } from './contratacionresultadospun/bandeja-adjudicacion-pun/adjudicar-plaza-pun/adjudicar-plaza-pun.component';
import { ModalObservarPostulanteComponent } from './contrataciondirecta/bandeja-calificaciones/modal-observar-postulante/modal-observar-postulante.component';
import { ModalVerObservacionComponent } from './contrataciondirecta/bandeja-calificaciones/modal-ver-observacion/modal-ver-observacion.component';
import { ModalRegistrarReclamoComponent } from './contrataciondirecta/bandeja-calificaciones/modal-registrar-reclamo/modal-registrar-reclamo.component';
import { ModalVerReclamoComponent } from './contrataciondirecta/bandeja-calificaciones/modal-ver-reclamo/modal-ver-reclamo.component';
import { ModalActaAdjudicacionPUNComponent } from "./contratacionresultadospun/bandeja-adjudicacion-pun/modal-acta-adjudicacion-pun/modal-acta-adjudicacion-pun.component";
import { ModalContratoAdjudicacionPUNComponent } from "./contratacionresultadospun/bandeja-adjudicacion-pun/modal-contrato-adjudicacion-pun/modal-contrato-adjudicacion-pun.component";
import { BandejaAdjudicacionesComponent } from './contrataciondirecta/bandeja-adjudicaciones/bandeja-adjudicaciones.component';
import { ModalInformacionCompletaComponent } from './contrataciondirecta/bandeja-adjudicaciones/modal-informacion-completa/modal-informacion-completa.component';
import { ModalAdjudicarPlazaComponent } from './contrataciondirecta/bandeja-adjudicaciones/modal-adjudicar-plaza/modal-adjudicar-plaza.component';
import { ModalNoAdjudicarComponent } from './contrataciondirecta/bandeja-adjudicaciones/modal-no-adjudicar/modal-no-adjudicar.component';
import { ModalVerObservacionAdjudicacionComponent } from "./contrataciondirecta/bandeja-adjudicaciones/modal-ver-observacion/modal-ver-observacion.component";
import { ModalSubsanarObservacionComponent } from './contrataciondirecta/bandeja-adjudicaciones/modal-subsanar-observacion/modal-subsanar-observacion.component';
import { ModalVerSubsanacionComponent } from './contrataciondirecta/bandeja-adjudicaciones/modal-ver-subsanacion/modal-ver-subsanacion.component';
import { InformacionCalificacionPUNComponent } from "./contratacionresultadospun/bandeja-calificaciones-pun/informacion-calificacion-pun/informacion-calificacion-pun.component";
import { InformacionAdjudicacionPUNComponent } from "./contratacionresultadospun/bandeja-adjudicacion-pun/informacion-adjudicacion-pun/informacion-adjudicacion-pun.component";
import { ModalIniciarEtapaComponent } from './modal-iniciar-etapa/modal-iniciar-etapa.component';
import { BandejaPlazasEvaluacionComponent } from './contratacionevaluacion/bandeja-plazas-evaluacion/bandeja-plazas-evaluacion.component';
import { ModalInformacionPlazaEvalExpComponent } from "./contratacionevaluacion/bandeja-plazas-evaluacion/modal-informacion-plaza-eval-exp/modal-informacion-plaza-eval-exp.component";
import { ModalPlazaObservadaEvalExpComponent } from "./contratacionevaluacion/bandeja-plazas-evaluacion/modal-plaza-observada-eval-exp/modal-plaza-observada-eval-exp.component";
import { BandejaPostulantesEvaluacionComponent } from './contratacionevaluacion/bandeja-postulantes-evaluacion/bandeja-postulantes-evaluacion.component';
import { ModalNuevoPostulanteEvalExpComponent } from "./contratacionevaluacion/bandeja-postulantes-evaluacion/modal-nuevo-postulante-evaluacion/modal-nuevo-postulante-evaluacion.component";
import { ModalInformacionPostulanteEvalExpComponent } from "./contratacionevaluacion/bandeja-postulantes-evaluacion/modal-informacion-postulante-eval-exp/modal-informacion-postulante-eval-exp.component";
import { ModalSancionPostulanteEvalExpComponent } from "./contratacionevaluacion/bandeja-postulantes-evaluacion/modal-sancion-postulante-evaluacion/modal-sancion-postulante-evaluacion.component";
import { ModalIncorporacionPlazasEvalExpComponent } from "./contratacionevaluacion/bandeja-plazas-evaluacion/modal-incorporacion-plazas-eval-exp/modal-incorporacion-plazas-eval-exp.component";
import { ModalEditarPostulanteEvalExpComponent } from "./contratacionevaluacion/bandeja-postulantes-evaluacion/modal-editar-postulante-eval-exp/modal-editar-postulante-eval-exp.component";
import { BandejaCalificacionesEvalExpComponent } from './contratacionevaluacion/bandeja-calificaciones-evaluacion/bandeja-calificaciones-eval-exp.component';
import { ModalBuscarPlazaComponent } from './contrataciondirecta/bandeja-postulantes/modal-buscar-plaza/modal-buscar-plaza.component';
import { BandejaAdjudicacionEvaluacionComponent } from "./contratacionevaluacion/bandeja-adjudicaciones-evaluacion/bandeja-adjudicaciones-evaluacion.component";
import { RegistrarCalificacionesEvalComponent } from './contratacionevaluacion/bandeja-calificaciones-evaluacion/registrar-calificaciones-eval/registrar-calificaciones-eval.component';
import { InformacionCalificacionEvalComponent } from './contratacionevaluacion/bandeja-calificaciones-evaluacion/informacion-calificacion-eval/informacion-calificacion-eval.component';
import { ModalObservarPostulacionEvalComponent } from './contratacionevaluacion/bandeja-calificaciones-evaluacion/modal-observar-postulacion-eval/modal-observar-postulacion-eval.component';
import { ModalRegistrarReclamoEvalComponent } from './contratacionevaluacion/bandeja-calificaciones-evaluacion/modal-registrar-reclamo-eval/modal-registrar-reclamo-eval.component';
import { AdjudicarPlazaEvalComponent } from './contratacionevaluacion/bandeja-adjudicaciones-evaluacion/adjudicar-plaza-eval/adjudicar-plaza-eval.component';
import { InformacionAdjudicacionEvalComponent } from './contratacionevaluacion/bandeja-adjudicaciones-evaluacion/informacion-adjudicacion-eval/informacion-adjudicacion-eval.component';
import { ModalActaAdjudicacionEvalComponent } from './contratacionevaluacion/bandeja-adjudicaciones-evaluacion/modal-acta-adjudicacion-eval/modal-acta-adjudicacion-eval.component';
import { ModalNoAdjudicarEvalComponent } from './contratacionevaluacion/bandeja-adjudicaciones-evaluacion/modal-no-adjudicar-eval/modal-no-adjudicar-eval.component';
import { ModalSubsanarObservacionEvalComponent } from './contratacionevaluacion/bandeja-adjudicaciones-evaluacion/modal-subsanar-observacion-eval/modal-subsanar-observacion-eval.component';
import { ModalVerObservacionEvalComponent } from './contratacionevaluacion/bandeja-adjudicaciones-evaluacion/modal-ver-observacion-eval/modal-ver-observacion-eval.component';
import { ModalContratoAdjudicacionDirectaComponent } from './contrataciondirecta/bandeja-adjudicaciones/modal-contrato-adjudicacion-directa/modal-contrato-adjudicacion-directa.component';
import { ModalDocumentosPublicadosPrepublicacionComponent } from './components/modal-documentos-publicados-prepublicacion/modal-documentos-publicados-prepublicacion.component';
import { BandejaIncorporarPlazaComponent } from './components/bandeja-incorporar-plaza/bandeja-incorporar-plaza.component';
import { ModalMonitorInstanciasComponent } from './components/modal-monitor-instancias/modal-monitor-instancias.component';
import { BandejaPrepublicacion30493Component } from './prepublicacion30493/bandeja-prepublicacion30493.component';
import { CriterioBusquedaPrepubComponent } from './components/criterio-busqueda-prepub/criterio-busqueda-prepub.component';
import { ContenedorPrepubComponent } from './components/contendor-prepub/contenedor-prepub.component';
import { GrillaPrepublicacion30493Component } from './components/grilla-prepublicacion30493/grilla-prepublicacion30493.component';

import { BandejaPlazas30493Component } from './bandeja-plazas30493/bandeja-plazas30493.component';
import { GrillaPlazas30493Component } from './components/grilla-plazas30493/grilla-plazas30493.component';
import { ContenedorBandejaComponent } from './components/contenedor-bandeja/contenedor-bandeja.component';
import { PanelValidacionn30493Component } from './components/panel-validacionn30493/panel-validacionn30493.component';
import { ModalObservacionBandejaComponent } from './components/modal-observacion-bandeja/modal-observacion-bandeja.component';
import { CriterioBusquedaPlazasComponent } from './components/criterio-busqueda-plazas/criterio-busqueda-plazas.component';

import { GrillaHistorialPrepubComponent } from './components/grilla-historial-prepub/grilla-historial-prepub.component';
import { GrillaDocumentoPrepubComponent } from './components/grilla-documento-prepub/grilla-documento-prepub.component';

import { ModalNuevoPostulanteEvaluacionRl30493Component } from './contratacionevaluacion/bandeja-postulantes-evaluacion/modal-nuevo-postulante-evaluacion-rl30493/modal-nuevo-postulante-evaluacion-rl30493.component';
import { BuscarInformacionPersonalComponent } from './contratacionevaluacion/bandeja-postulantes-evaluacion/buscar-informacion-personal/buscar-informacion-personal.component';
import { ModalMotivoRechazoValidacionComponent } from './components/modal-motivo-rechazo-validacion/modal-motivo-rechazo-validacion.component';
import { ModalDocumentosPrepublicadosFechaComponent } from './components/modal-documentos-prepublicados-fecha/modal-documentos-prepublicados-fecha.component';
import { ModalDocumentosPrepublicadosFechaOldComponent } from "./components/modal-documentos-publicados-fecha/modal-documentos-prepublicados-fechaOld.component";
import { GrillaVinculacionVigenteComponent } from './contratacionevaluacion/bandeja-postulantes-evaluacion/grilla-vinculacion-vigente/grilla-vinculacion-vigente.component';
import { GrillaEvalPostulante30493Component } from './contratacionevaluacion/bandeja-postulantes-evaluacion/grilla-eval-postulante30493/grilla-eval-postulante30493.component';
import { GrillaEvalPostulante30328Component } from './contratacionevaluacion/bandeja-postulantes-evaluacion/grilla-eval-postulante30328/grilla-eval-postulante30328.component';
import { NoRegistradoPipe } from './pipe/noregistrado/no-registrado.pipe';
import { ModalActualizaciacionPlazaComponent } from './components/modal-actualizaciacion-plaza/modal-actualizaciacion-plaza.component';
import { DateFormatPipe } from './pipe/dateformat/date-format.pipe';
import { BusquedaPlazaPostulanteComponent } from './components/busqueda-plaza-postulante/busqueda-plaza-postulante.component';



const routes: Routes = [
    {
        path: "", component: BandejaPrincipalComponent,
    },
    {
        path: "prepublicacion/:id", component: BandejaPrepublicacion30328Component,
    },
    {
        path: "ver-prepublicacion/:id", component: BandejaPrepublicacion30328Component,
    },
    {
        path: "prepublicacion30493/:id", component: BandejaPrepublicacion30493Component,
    },
    {
        path:"plazasprepublicadas30493/:id", component: BandejaPlazas30493Component,
    },
    {
        path: "publicacion/:id", component: BandejaPublicacionComponent,
    },
    {
        path: "postulante/:id", component: BandejaPostulanteComponent,
    },
    {
        path: "calificacion/:id", component: BandejaCalificacionComponent,
    },
    {
        path: "calificacion-otras/:id", component: BandejaCalificacionOtrasComponent,
    },
    {
        path: "adjudicacion/:id", component: BandejaAdjudicacionComponent,
    },
    {
        path: "consolidado/:id", component: BandejaConsolidadoPlazaComponent,
    },
    {
        path: "consolidadoplazadetalle/:id/:id1", component: BandejaConsolidadoPlazaDetalleComponent,
    },
    /*
    {
        path: "calificacion/:id/:codigo/cargamasiva", component: CargaMasivaComponent,
        resolve: { CargaMasiva: CargaMasivaResolverService },
    },
    */
    
    {
        path: "adjudicarplaza/:id/:id1", component: AdjudicarPlazaComponent,
    },
    {
        path: 'validacion-plazas/:id', component: BandejaValidacionPlazasComponent
    },
    {
        path: 'ver-validacion-plazas/:id', component: BandejaValidacionPlazasComponent
    },
    {
        path: 'contratacion-directa/bandeja-plazas/:id', component: BandejaIncorporacionPlazasComponent
    },
    {
        path: 'ver-contratacion-directa/bandeja-plazas/:id', component: BandejaIncorporacionPlazasComponent
    },
    {
        path: 'contratacion-directa/bandeja-postulantes/:id', component: BandejaPostulantesComponent
    },
    {
        path: 'contratacion-directa/bandeja-calificaciones/:id', component: BandejaCalificacionesComponent
    },
    {
        path: 'contratacion-directa/bandeja-calificaciones/:id', component: null,
        children: [
            {
                path: '', component: BandejaCalificacionesComponent                
            },
            {
                path: 'requisitos-calificacion/:id/:idPersona/:codigo', component: RequisitosCalificacionesComponent
            },
            {
                path: 'informacion-completa/:id/:idPersona/:codigo', component: InformacionCompletaComponent
            }
        ]
    },
    {
        path: 'contratacion-directa/bandeja-adjudicaciones/:id', component: BandejaAdjudicacionesComponent
    },
    {
        path: 'contratacion-directa/bandeja-adjudicaciones/:id', component: null,
        children: [
            {
                path: '', component: BandejaAdjudicacionesComponent
            },
            {
                path: 'adjudicar-plaza/:idAdjudicacion/:anio/:idEtapaProceso', component: ModalAdjudicarPlazaComponent
            }
        ]
    },
    {
        path: 'contratacion-resultados-pun/bandeja-plazas/:id', component: BandejaIncorporacionPlazasPUNComponent
    },
    {
        path: 'ver-contratacion-resultados-pun/bandeja-plazas/:id', component: BandejaIncorporacionPlazasPUNComponent
    },
    {
        path: 'contratacion-resultados-pun/bandeja-calificaciones/:id', component: BandejaCalificacionesPUNComponent,
    },
    {
        path: 'contratacion-resultados-pun/bandeja-calificaciones/:id', component: null,
        children: [
            {
                path: '', component: BandejaCalificacionesPUNComponent
            },
            {
                path: 'registrar-calificacion/:id/:idPersona/:modoEdicion', component: RegistrarCalificacionesPUNComponent
            },
            {
                path: 'informacion-calificacion/:id/:idPersona', component: InformacionCalificacionPUNComponent
            },
            {
                path: ":codigo/cargamasiva", component: CargaMasivaComponent,
                resolve: { CargaMasiva: CargaMasivaResolverService },
            },
        ]
    },
    {
        path: 'contratacion-adjudicacion-pun/bandeja-adjudicacion/:id', component: BandejaAdjudicacionPUNComponent
    },
    {
        path: 'contratacion-adjudicacion-pun/bandeja-adjudicacion/:id', component: null,
        children: [
            {
                path: '', component: BandejaAdjudicacionPUNComponent
            },
            {
                path: 'adjudicar-plaza-pun/:id/:idPersona', component: AdjudicarPlazaPUNComponent
            },
            {
                path: 'informacion-adjudicacion/:id/:idPersona/:idCalificacion', component: InformacionAdjudicacionPUNComponent
            }
        ]
    },
    {
        path: 'contratacion-evaluacion-expediente/bandeja-plazas/:id', component: BandejaPlazasEvaluacionComponent
    },
    {
        path: 'ver-contratacion-evaluacion-expediente/bandeja-plazas/:id', component: BandejaPlazasEvaluacionComponent
    },
    {
        path: 'contratacion-evaluacion-expediente/bandeja-postulantes/:id', component: BandejaPostulantesEvaluacionComponent
    },
    {
        path: 'contratacion-evaluacion-expediente/bandeja-calificaciones/:id', component: null,//BandejaCalificacionesEvalExpComponent
        children: [
            {
                path: '', component: BandejaCalificacionesEvalExpComponent
            },
            {
                path: 'registrar-calificacion/:id/:idPersona/:modoEdicion', component: RegistrarCalificacionesEvalComponent
            },
            {
                path: 'informacion-calificacion/:id/:idPersona', component: InformacionCalificacionEvalComponent
            }
        ]
    },
    {
        path: 'contratacion-adjudicacion-evaluacion/bandeja-adjudicacion/:id', component: BandejaAdjudicacionEvaluacionComponent
    },
    {
        path: 'contratacion-adjudicacion-evaluacion/bandeja-adjudicacion/:id', component: null,
        children: [
            {
                path: '', component: BandejaAdjudicacionEvaluacionComponent
            },
            {
                path: 'adjudicar-plaza-evaluacion/:id/:idPersona', component: AdjudicarPlazaEvalComponent
            },
            {
                path: 'informacion-adjudicacion/:id/:idPersona/:idCalificacion', component: InformacionAdjudicacionEvalComponent
            }
        ]
    },
    {
        path: 'bandeja-incorporacion-plazas/bandeja-incorporacion/:id', component: BandejaIncorporarPlazaComponent
    },
];

@NgModule({
    declarations: [
        BandejaPrincipalComponent,
        BandejaPrepublicacion30328Component,
        InformacionPlaza30328Component,
        BandejaPublicacionComponent,
        BandejaPostulanteComponent,
        BandejaCalificacionComponent,
        BandejaAdjudicacionComponent,
        RegistraPostulanteComponent,
        PlazasObservadasComponent,
        PlazasPublicacionComponent,
        PlazasConvocarComponent,
        InformacionPlazaComponent,
        RegistraMotivoNoPublicacionComponent,
        BuscarCentroTrabajoComponent,
        BusquedaPlazaComponent,
        BusquedaPlazaPostulanteComponent,
        BuscadorServidorPublicoComponent,
        FormacionAcademicaComponent,
        CapacitacionesComponent,
        ExperienciaLaboralComponent,
        InformacionPostulanteComponent,
        InformacionDocumentoSustentoComponent,
        InformacionCapacitacionesComponent,
        InformacionFormacionAcademicaComponent,
        InformacionExperienciaLaboralComponent,
        PlazasResultadoFinalComponent,
        BandejaCalificacionOtrasComponent,
        RegistrarCalificacionComponent,
        InformacionCalificacionComponent,
        BandejaConsolidadoPlazaComponent,
        MotivoRechazoComponent,
        BandejaConsolidadoPlazaDetalleComponent,
        RegistrarRechazoComponent,
        ConsolidadoPlazasConvocarComponent,
        ConsolidadoPlazasObservadasComponent,
        ResultadoPunComponent,
        CriterioEvaluacionComponent,
        RegistrarMotivoComponent,
        DetalleObservacionComponent,
        AdjudicarPlazaComponent,
        RequisitoMinimoComponent,
        RegistrarReclamoComponent,
        CalificacionFinalComponent,
        InformacionAdjudicacionComponent,
        BandejaValidacionPlazasComponent,
        InformacionProcesoEtapaComponent,
        InformacionPlazaValidacionComponent,
        ModalPlazaObservadaComponent,
        ModalInformacionSustentoComponent,
        ModalInformacionPlazaObservadaComponent,
        BandejaIncorporacionPlazasComponent,
        ModalIncorporacionPlazasComponent,
        ModalInformacionPlazaComponent,
        BandejaPostulantesComponent,
        ModalNuevoPostulanteComponent,
        ModalInformacionPostulanteComponent,
        ModalEditarPostulanteComponent,
        ModalIncorporacionPlazasPUNComponent,
        ModalInformacionPlazaPUNComponent,
        ModalSancionPostulanteComponent,
        BandejaCalificacionesComponent,
        ModalDocumentosPublicadosComponent,
        BandejaIncorporacionPlazasPUNComponent,
        BandejaCalificacionesPUNComponent,
        RegistrarCalificacionesPUNComponent,
        InformacionPostulanteCalificacionComponent,
        ModalObservarPostulacionPUNComponent,
        ModaRegistrarReclamoPUNComponent,
        RequisitosCalificacionesComponent,
        InformacionCompletaComponent,
        BandejaAdjudicacionPUNComponent,
        ModalNoAdjudicarPUNComponent,
        ModalVerObservacionPUNComponent,
        ModalSubsanarObservacionPUNComponent,
        AdjudicarPlazaPUNComponent,
        ModalObservarPostulanteComponent,
        ModalVerObservacionComponent,
        ModalRegistrarReclamoComponent,
        ModalVerReclamoComponent,
        ModalActaAdjudicacionPUNComponent,
        ModalContratoAdjudicacionPUNComponent,
        BandejaAdjudicacionesComponent,
        ModalInformacionCompletaComponent,
        ModalAdjudicarPlazaComponent,
        ModalNoAdjudicarComponent,
        ModalVerObservacionAdjudicacionComponent,
        ModalSubsanarObservacionComponent,
        ModalVerSubsanacionComponent,
        InformacionCalificacionPUNComponent,
        InformacionAdjudicacionPUNComponent,
        ModalIniciarEtapaComponent,
        BandejaPlazasEvaluacionComponent,
        ModalInformacionPlazaEvalExpComponent,
        ModalPlazaObservadaEvalExpComponent,
        BandejaPostulantesEvaluacionComponent,
        ModalNuevoPostulanteEvalExpComponent,
        ModalSancionPostulanteEvalExpComponent,
        ModalInformacionPostulanteEvalExpComponent,
        ModalIncorporacionPlazasEvalExpComponent,
        ModalEditarPostulanteEvalExpComponent,
        BandejaCalificacionesEvalExpComponent,
        ModalBuscarPlazaComponent,
        BandejaAdjudicacionEvaluacionComponent,
        RegistrarCalificacionesEvalComponent,
        InformacionCalificacionEvalComponent,
        ModalObservarPostulacionEvalComponent,
        ModalRegistrarReclamoEvalComponent,
        AdjudicarPlazaEvalComponent,
        InformacionAdjudicacionEvalComponent,
        ModalActaAdjudicacionEvalComponent,
        ModalNoAdjudicarEvalComponent,
        ModalSubsanarObservacionEvalComponent,
        ModalVerObservacionEvalComponent,
        ModalContratoAdjudicacionDirectaComponent,
        ModalDocumentosPublicadosPrepublicacionComponent,
        BandejaIncorporarPlazaComponent,
        ModalMonitorInstanciasComponent,
           

        BandejaPrepublicacion30493Component,
        CriterioBusquedaPrepubComponent,
        ContenedorPrepubComponent,
        GrillaPrepublicacion30493Component,

        BandejaPlazas30493Component,
        GrillaPlazas30493Component,
        ContenedorBandejaComponent,
        PanelValidacionn30493Component,
        ModalObservacionBandejaComponent,
        CriterioBusquedaPlazasComponent,

        GrillaHistorialPrepubComponent,
        GrillaDocumentoPrepubComponent,
	ModalDocumentosPrepublicadosFechaComponent,
	ModalNuevoPostulanteEvaluacionRl30493Component,
	BuscarInformacionPersonalComponent,
        ModalMotivoRechazoValidacionComponent, 
        ModalDocumentosPrepublicadosFechaOldComponent, 
	GrillaVinculacionVigenteComponent, 
	GrillaEvalPostulante30493Component, 
	GrillaEvalPostulante30328Component,
	NoRegistradoPipe,
	ModalActualizaciacionPlazaComponent,
        DateFormatPipe
        
    ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        DocumetoSustentoModule,
    ],
    providers: [DecimalPipe, DatePipe],
    /*     entryComponents: [
            BuscarCentroTrabajoComponent
          ], */
})
export class ContratacionModule {}
