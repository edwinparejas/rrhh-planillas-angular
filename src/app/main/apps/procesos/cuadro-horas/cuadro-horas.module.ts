import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../../material/material.module';
import { MineduSharedModule } from '../../../../../@minedu/shared.module';
import { MineduSidebarModule } from '../../../../../@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';

import { ParametrizacionComponent } from './bolsa-horas/parametrizacion/parametrizacion.component';
//import { BandejaHorasComponent } from './bolsa-horas/bandeja-horas/bandeja-horas.component';
import { AgregarInstitucionComponent } from './components/agregar-institucion/agregar-institucion.component';
import { MetasComponent } from './bolsa-horas/metas/metas.component';
import { AgregarMetasComponent } from './components/agregar-metas/agregar-metas.component';
import { PlanEstudiosComponent } from '../cuadro-horas-30512/plan-estudios/plan-estudios.component';
import { ModalAgregarPlanComponent } from '../cuadro-horas-30512/plan-estudios/modal-agregar-plan/modal-agregar-plan.component';
import { ModalCancelarVigenciaPlanComponent } from '../cuadro-horas-30512/plan-estudios/modal-cancelar-vigencia-plan/modal-cancelar-vigencia-plan.component';
import { PlanEstudioDetalleComponent } from '../cuadro-horas-30512/plan-estudios/plan-estudio-detalle/plan-estudio-detalle.component';
import { FormBuscarPlanDetalleComponent } from '../cuadro-horas-30512/plan-estudios/plan-estudio-detalle/form-buscar-plan-detalle/form-buscar-plan-detalle.component';
import { ModalVerCompetenciaComponent } from '../cuadro-horas-30512/plan-estudios/plan-estudio-detalle/modal-ver-competencia/modal-ver-competencia.component';
import { ModalVerFormacionComponent } from '../cuadro-horas-30512/plan-estudios/plan-estudio-detalle/modal-ver-formacion/modal-ver-formacion.component';
import { CargaMasivaComponent } from '../../components/carga-masiva/carga-masiva.component';
import { CargaMasivaResolverService } from 'app/core/data/resolvers/carga-masiva-type-resolver.service';
import { ConsolidadoComponent } from './consolidado/consolidado.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';

import { BusquedaPlazaComponent } from './gestionar-total/components/busqueda-plaza/busqueda-plaza.component';
import { BusquedaDocumentoIdentidadComponent } from './gestionar-total/components/busqueda-documento-identidad/busqueda-documento-identidad.component';
import { DocumentViewerComponent } from './gestionar-total/components/document-viewer/document-viewer.component';

import { ModalReportesComponent } from './gestionar-total/modal-reportes/modal-reportes.component';
import { VerDetallesComponent } from './gestionar-total/ver-detalles/ver-detalles.component';
import { AnexoPrimeroComponent } from './gestionar-total/modal-reportes/anexo-primero/anexo-primero.component';
import { GestionarTotalComponent } from './gestionar-total/gestionar-total.component';
import { RegistrarRechazoComponent } from './gestionar-total/components/registrar-rechazo/registrar-rechazo.component';
import { ModalProyectoResolucionComponent } from './components/modal-proyecto-resolucion/modal-proyecto-resolucion.component';
import { ModalVerInformacionComponent } from './components/modal-proyecto-resolucion/modal-ver-informacion/modal-ver-informacion.component';
import { ModalComitesGeneradosComponent } from './components/modal-comites-generados/modal-comites-generados.component';
import { DatePipe } from '@angular/common';

const routes: Routes = [
    {
        path: 'bolsahorasiiee',  
        component: ParametrizacionComponent
    },
    {
        path: 'bolsa-horas-parametrizar/:idProceso/:idEtapa/:idUgel',  
        component: ParametrizacionComponent
    },
    {
        path: 'metas',  
        component: MetasComponent
    },
    {
        path: "plan-estudio",
        component: PlanEstudiosComponent,
        resolve: {},
    },
    {
        path: "plan-estudio/:idPlanEstudio",
        component: PlanEstudioDetalleComponent,
        resolve: {},
    },
    {
        path: "plan-estudio/:idPlanEstudio/:codigo/cargamasiva",
        component: CargaMasivaComponent,
        resolve: { CargaMasiva: CargaMasivaResolverService },
    },
    {
        path: 'consolidado/:idConsolidado',  
        component: ConsolidadoComponent
    },
    {
        path: "gestionar-total/:idProceso/:idEtapa/:idEtapaProceso/:codigoCentroTrabajo/:idConsolidadoPlaza",
        component: GestionarTotalComponent 
      },
      {
        path: "gestionar-total/:idProceso/:idEtapa/:idEtapaProceso/:codigoCentroTrabajo/:idConsolidadoPlaza/reportes/:anio/:codigoModular/reportes-anexo/:numeroanexo",
        component: AnexoPrimeroComponent
      },
      {
        path: "gestionar-total/:idProceso/:idEtapa/:idEtapaProceso/:codigoCentroTrabajo/:idConsolidadoPlaza/reportes/:anio/:codigoModular",
        component: ModalReportesComponent
      },
  
];

@NgModule({
    declarations: [
 
        ParametrizacionComponent,
        //BandejaHorasComponent,
        AgregarInstitucionComponent,
        AgregarMetasComponent,
        MetasComponent,
        PlanEstudiosComponent,
        ModalAgregarPlanComponent,
        ModalCancelarVigenciaPlanComponent,
        PlanEstudioDetalleComponent,
        FormBuscarPlanDetalleComponent,
        ModalVerCompetenciaComponent,
        ModalVerFormacionComponent,
        ConsolidadoComponent,
        BuscarCentroTrabajoComponent,
        AnexoPrimeroComponent,
        ModalReportesComponent,
        VerDetallesComponent,
        GestionarTotalComponent,
        DocumentViewerComponent,
        BusquedaDocumentoIdentidadComponent,
        BusquedaPlazaComponent,
        RegistrarRechazoComponent,
        ModalProyectoResolucionComponent,
        ModalVerInformacionComponent,
        ModalComitesGeneradosComponent
  
    ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule
    ],
    providers: [
        DatePipe,
      ]
    
})
export class CuadroHorasModule { }
