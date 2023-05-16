import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BandejaBeneficioComponent } from './bandeja-beneficio/bandeja-beneficio.component';
import { RegistroBeneficioComponent } from './registro-beneficio/registro-beneficio.component';
import { MaterialModule } from 'app/material/material.module';
import { MineduSharedModule } from '@minedu/shared.module';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { MineduComponentsModule } from '../../components/minedu-components.module';
import { BuscarPersonaComponent } from './components/buscar-persona/buscar-persona.component';
import { BusquedaPlazaComponent } from './components/busqueda-plaza/busqueda-plaza.component';
import { AccionPersonalComponent } from './registro-beneficio/accion-personal/accion-personal.component';
import { InformeEscalafonarioComponent } from './registro-beneficio/informe-escalafonario/informe-escalafonario.component';
import { ServidorPublicoComponent } from './registro-beneficio/servidor-publico/servidor-publico.component';
import { BuscarCentroTrabajoComponent } from './components/buscar-centro-trabajo/buscar-centro-trabajo.component';
import { InformeCalculoComponent } from './registro-beneficio/informe-calculo/informe-calculo.component'; 
import { cts29944Component } from './registro-beneficio/informe-calculo/cts-29944/cts-29944.component';
import { cts276Component } from './registro-beneficio/informe-calculo/cts-276/cts-276.component';
import { CreditoDevengadoComponent } from './registro-beneficio/informe-calculo/credito-devengado/credito-devengado.component';
import { VacacionTruncaComponent } from './registro-beneficio/informe-calculo/vacacion-trunca/vacacion-trunca.component';
import { SubsidioFamiliarComponent } from './registro-beneficio/informe-calculo/subsidio-familiar/subsidio-familiar.component';
import { AnularBeneficioComponent } from './anular-beneficio/anular-beneficio.component';
import { AnularInformeCalculoComponent } from './anular-beneficio/informe-calculo-anular/anular-informe-calculo.component';
import { Anularcts29944Component } from './anular-beneficio/informe-calculo-anular/anular-cts-29944/anular-cts-29944.component';
import { Anularcts276Component } from './anular-beneficio/informe-calculo-anular/anular-cts-276/anular-cts-276.component';
import { AnularCreditoDevengadoComponent } from './anular-beneficio/informe-calculo-anular/anular-credito-devengado/anular-credito-devengado.component';
import { AnularVacacionTruncaComponent } from './anular-beneficio/informe-calculo-anular/anular-vacacion-trunca/anular-vacacion-trunca.component';
import { AnularSubsidioFamiliarComponent } from './anular-beneficio/informe-calculo-anular/anular-subsidio-familiar/anular-subsidio-familiar.component';
import { AgregarVacacionesComponent } from './components/agregar-vacaciones/agregar-vacaciones.component';
import { VerBeneficioComponent } from './ver-beneficio/ver-beneficio.component';
import { EditarBeneficioComponent } from './editar-beneficio/editar-beneficio.component';
import { Ats25Component } from './registro-beneficio/informe-calculo/ats-25/ats-25.component';
import { Ats30Component } from './registro-beneficio/informe-calculo/ats-30/ats-30.component';
import { BonificacionFamiliarComponent } from './registro-beneficio/informe-calculo/bonificacion-familiar/bonificacion-familiar.component';
import { BonificacionPersonalComponent } from './registro-beneficio/informe-calculo/bonificacion-personal/bonificacion-personal.component';
import { Gts25Component } from './registro-beneficio/informe-calculo/gts-25/gts-25.component';
import { IncentivoEstudiosComponent } from './registro-beneficio/informe-calculo/incentivo-estudios/incentivo-estudios.component';
import { IncentivoProfesionalComponent } from './registro-beneficio/informe-calculo/incentivo-profesional/incentivo-profesional.component';
import { PremioAnualComponent } from './registro-beneficio/informe-calculo/premio-anual/premio-anual.component';
import { AgregarBeneficiarioComponent } from './components/agregar-beneficiario/agregar-beneficiario.component';
import { AgregarBonificacionComponent } from './components/agregar-bonificacion/agregar-bonificacion.component';
import { GenerarProyectoComponent } from './components/generar-proyecto/generar-proyecto.component';
import { AnularAts25Component } from './anular-beneficio/informe-calculo-anular/anular-ats-25/anular-ats-25.component';
import { AnularAts30Component } from './anular-beneficio/informe-calculo-anular/anular-ats-30/anular-ats-30.component';
import { AnularBonificacionFamiliarComponent } from './anular-beneficio/informe-calculo-anular/anular-bonificacion-familiar/anular-bonificacion-familiar.component';
import { AnularBonificacionPersonalComponent } from './anular-beneficio/informe-calculo-anular/anular-bonificacion-personal/anular-bonificacion-personal.component';
import { AnularGts25Component } from './anular-beneficio/informe-calculo-anular/anular-gts-25/anular-gts-25.component';
import { RechazoMandatoJudicialComponent } from './components/rechazo-mandato-judicial/rechazo-mandato-judicial.component';
import { AnularIncentivoEstudiosComponent } from './anular-beneficio/informe-calculo-anular/anular-incentivo-estudios/anular-incentivo-estudios.component';
import { AnularIncentivoProfesionalComponent } from './anular-beneficio/informe-calculo-anular/anular-incentivo-profesional/anular-incentivo-profesional.component';
import { AnularPremioAnualComponent } from './anular-beneficio/informe-calculo-anular/anular-premio-anual/anular-premio-anual.component';
import { Editarcts29944Component } from './editar-beneficio/editar-informe-calculo/editar-cts-29944/editar-cts-29944.component';
import { Editarcts276Component } from './editar-beneficio/editar-informe-calculo/editar-cts-276/editar-cts-276.component';
import { EditarCreditoDevengadoComponent } from './editar-beneficio/editar-informe-calculo/editar-credito-devengado/editar-credito-devengado.component';
import { EditarVacacionTruncaComponent } from './editar-beneficio/editar-informe-calculo/editar-vacacion-trunca/editar-vacacion-trunca.component';
import { EditarAts25Component } from './editar-beneficio/editar-informe-calculo/editar-ats-25/editar-ats-25.component';
import { EditarAts30Component } from './editar-beneficio/editar-informe-calculo/editar-ats-30/editar-ats-30.component';
import { EditarBonificacionFamiliarComponent } from './editar-beneficio/editar-informe-calculo/editar-bonificacion-familiar/editar-bonificacion-familiar.component';
import { EditarBonificacionPersonalComponent } from './editar-beneficio/editar-informe-calculo/editar-bonificacion-personal/editar-bonificacion-personal.component';
import { EditarGts25Component } from './editar-beneficio/editar-informe-calculo/editar-gts-25/editar-gts-25.component';
import { EditarIncentivoEstudiosComponent } from './editar-beneficio/editar-informe-calculo/editar-incentivo-estudios/editar-incentivo-estudios.component';
import { EditarIncentivoProfesionalComponent } from './editar-beneficio/editar-informe-calculo/editar-incentivo-profesional/incentivo-profesional.component';
import { EditarPremioAnualComponent } from './editar-beneficio/editar-informe-calculo/editar-premio-anual/editar-premio-anual.component';
import { EditarSubsidioFamiliarComponent } from './editar-beneficio/editar-informe-calculo/editar-subsidio-familiar/editar-subsidio-familiar.component';
import { EditarInformeEscalafonarioComponent } from './editar-beneficio/editar-informe-escalafonario/editar-informe-escalafonario.component';
import { EditarInformeCalculoComponent } from './editar-beneficio/editar-informe-calculo/editar-informe-calculo.component';

const routes: Routes = [
    {
        path: '',  
        component: BandejaBeneficioComponent
    },
    {
        path: 'registro',
        component: RegistroBeneficioComponent
    },
    {
        path: 'ver/:idDetalleGestionBeneficio/:tipoFormulario',
        component: VerBeneficioComponent
    },
    {
        path: 'ver/:idDetalleGestionBeneficio',
        component: VerBeneficioComponent
    },
    {
        path: 'editar/:idDetalleGestionBeneficio',
        component: EditarBeneficioComponent
    },
    {
        path: 'eliminar/:idDetalleGestionBeneficio',
        component: AnularBeneficioComponent
    }
];
@NgModule({  
  declarations: [
    BandejaBeneficioComponent,    
    BuscarPersonaComponent,
    BusquedaPlazaComponent,
    BuscarCentroTrabajoComponent,
    RegistroBeneficioComponent,
    AccionPersonalComponent,
    ServidorPublicoComponent,
    InformeEscalafonarioComponent,
    InformeCalculoComponent,    
    cts29944Component,
    cts276Component,
    CreditoDevengadoComponent,
    VacacionTruncaComponent,
    SubsidioFamiliarComponent,
    Ats25Component,
    Ats30Component,
    BonificacionFamiliarComponent,
    BonificacionPersonalComponent,
    Gts25Component,
    IncentivoEstudiosComponent,
    IncentivoProfesionalComponent,
    PremioAnualComponent,
    AnularBeneficioComponent,
    AnularInformeCalculoComponent,
    Anularcts29944Component,
    Anularcts276Component,
    AnularCreditoDevengadoComponent,
    AnularVacacionTruncaComponent,
    AnularSubsidioFamiliarComponent,
    AnularAts25Component,
    AnularAts30Component,
    AnularBonificacionFamiliarComponent,
    AnularBonificacionPersonalComponent,
    AnularGts25Component,
    AnularIncentivoEstudiosComponent,
    AnularIncentivoProfesionalComponent,
    AnularPremioAnualComponent,
    AgregarVacacionesComponent,
    VerBeneficioComponent,
    EditarBeneficioComponent,
    EditarInformeEscalafonarioComponent,
    EditarInformeCalculoComponent,
    Editarcts29944Component,
    Editarcts276Component,
    EditarCreditoDevengadoComponent,
    EditarVacacionTruncaComponent,
    EditarSubsidioFamiliarComponent,
    EditarAts25Component,
    EditarAts30Component,
    EditarBonificacionFamiliarComponent,
    EditarBonificacionPersonalComponent,
    EditarGts25Component,
    EditarIncentivoEstudiosComponent,
    EditarIncentivoProfesionalComponent,
    EditarPremioAnualComponent,
    AgregarBeneficiarioComponent,
    AgregarBonificacionComponent,
    GenerarProyectoComponent,
    RechazoMandatoJudicialComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    MineduSharedModule,
    MineduSidebarModule,
    MineduComponentsModule
  ]
})
export class BeneficiosModule { }
