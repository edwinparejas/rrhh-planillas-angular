import { NgModule } from "@angular/core";
import { CommonModule, DecimalPipe } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { MaterialModule } from "../../../../material/material.module";
import { MineduSharedModule } from "../../../../../@minedu/shared.module";
import { MineduSidebarModule } from "../../../../../@minedu/components/sidebar/sidebar.module";
import { MineduComponentsModule } from "../../components/minedu-components.module";

import { BandejaPrepublicacion30493Component } from "./prepublicacion30493/bandeja-prepublicacion303493.component.component";
import { BandejaPrincipalComponent } from "./principal/bandeja-principal.component";
import { ModalIniciarEtapaComponent } from './modal-iniciar-etapa/modal-iniciar-etapa.component';
import { ValidacionplazaComponent } from './validacionplaza/validacionplaza.component';


const routes: Routes = [
    {
        path: "", component: BandejaPrincipalComponent,
    },
    {
        path: "prepublicacion30493/:id", component: BandejaPrepublicacion30493Component,
    },
    // {
    //     path: "ver-prepublicacion/:id", component: BandejaPrepublicacion30328Component,
    // },
    // {
    //     path: "publicacion/:id", component: BandejaPublicacionComponent,
    // },
    // {
    //     path: "postulante/:id", component: BandejaPostulanteComponent,
    // },
    // {
    //     path: "calificacion/:id", component: BandejaCalificacionComponent,
    // },
    // {
    //     path: "calificacion-otras/:id", component: BandejaCalificacionOtrasComponent,
    // },
    // {
    //     path: "adjudicacion/:id", component: BandejaAdjudicacionComponent,
    // },
    // {
    //     path: "consolidado/:id", component: BandejaConsolidadoPlazaComponent,
    // },
    // {
    //     path: "consolidadoplazadetalle/:id/:id1", component: BandejaConsolidadoPlazaDetalleComponent,
    // },
    // /*
    // {
    //     path: "calificacion/:id/:codigo/cargamasiva", component: CargaMasivaComponent,
    //     resolve: { CargaMasiva: CargaMasivaResolverService },
    // },
    // */
    
    // {
    //     path: "adjudicarplaza/:id/:id1", component: AdjudicarPlazaComponent,
    // },
    // {
    //     path: 'validacion-plazas/:id', component: BandejaValidacionPlazasComponent
    // },
    // {
    //     path: 'ver-validacion-plazas/:id', component: BandejaValidacionPlazasComponent
    // },
    // {
    //     path: 'contratacion-directa/bandeja-plazas/:id', component: BandejaIncorporacionPlazasComponent
    // },
    // {
    //     path: 'ver-contratacion-directa/bandeja-plazas/:id', component: BandejaIncorporacionPlazasComponent
    // },
    // {
    //     path: 'contratacion-directa/bandeja-postulantes/:id', component: BandejaPostulantesComponent
    // },
    // {
    //     path: 'contratacion-directa/bandeja-calificaciones/:id', component: BandejaCalificacionesComponent
    // },
    // {
    //     path: 'contratacion-directa/bandeja-calificaciones/:id', component: null,
    //     children: [
    //         {
    //             path: '', component: BandejaCalificacionesComponent                
    //         },
    //         {
    //             path: 'requisitos-calificacion/:id/:idPersona/:codigo', component: RequisitosCalificacionesComponent
    //         },
    //         {
    //             path: 'informacion-completa/:id/:idPersona/:codigo', component: InformacionCompletaComponent
    //         }
    //     ]
    // },
    // {
    //     path: 'contratacion-directa/bandeja-adjudicaciones/:id', component: BandejaAdjudicacionesComponent
    // },
    // {
    //     path: 'contratacion-resultados-pun/bandeja-plazas/:id', component: BandejaIncorporacionPlazasPUNComponent
    // },
    // {
    //     path: 'ver-contratacion-resultados-pun/bandeja-plazas/:id', component: BandejaIncorporacionPlazasPUNComponent
    // },
    // {
    //     path: 'contratacion-resultados-pun/bandeja-calificaciones/:id', component: BandejaCalificacionesPUNComponent,
    // },
    // {
    //     path: 'contratacion-resultados-pun/bandeja-calificaciones/:id', component: null,
    //     children: [
    //         {
    //             path: '', component: BandejaCalificacionesPUNComponent
    //         },
    //         {
    //             path: 'registrar-calificacion/:id/:idPersona', component: RegistrarCalificacionesPUNComponent
    //         },
    //         {
    //             path: 'informacion-calificacion/:id/:idPersona', component: InformacionCalificacionPUNComponent
    //         },
    //         {
    //             path: ":codigo/cargamasiva", component: CargaMasivaComponent,
    //             resolve: { CargaMasiva: CargaMasivaResolverService },
    //         },
    //     ]
    // },
    // {
    //     path: 'contratacion-adjudicacion-pun/bandeja-adjudicacion/:id', component: BandejaAdjudicacionPUNComponent
    // },
    // {
    //     path: 'contratacion-adjudicacion-pun/bandeja-adjudicacion/:id', component: null,
    //     children: [
    //         {
    //             path: '', component: BandejaAdjudicacionPUNComponent
    //         },
    //         {
    //             path: 'adjudicar-plaza-pun/:id/:idPersona', component: AdjudicarPlazaPUNComponent
    //         },
    //         {
    //             path: 'informacion-adjudicacion/:id/:idPersona/:idCalificacion', component: InformacionAdjudicacionPUNComponent
    //         }
    //     ]
    // },
    // {
    //     path: 'contratacion-evaluacion-expediente/bandeja-plazas/:id', component: BandejaPlazasEvaluacionComponent
    // },
    // {
    //     path: 'ver-contratacion-evaluacion-expediente/bandeja-plazas/:id', component: BandejaPlazasEvaluacionComponent
    // },
    // {
    //     path: 'contratacion-evaluacion-expediente/bandeja-postulantes/:id', component: BandejaPostulantesEvaluacionComponent
    // },
    // {
    //     path: 'contratacion-evaluacion-expediente/bandeja-calificaciones/:id', component: null,//BandejaCalificacionesEvalExpComponent
    //     children: [
    //         {
    //             path: '', component: BandejaCalificacionesEvalExpComponent
    //         },
    //         {
    //             path: 'registrar-calificacion/:id/:idPersona', component: RegistrarCalificacionesEvalComponent
    //         },
    //         {
    //             path: 'informacion-calificacion/:id/:idPersona', component: InformacionCalificacionEvalComponent
    //         }
    //     ]
    // },
    // {
    //     path: 'contratacion-adjudicacion-evaluacion/bandeja-adjudicacion/:id', component: BandejaAdjudicacionEvaluacionComponent
    // },
    // {
    //     path: 'contratacion-adjudicacion-evaluacion/bandeja-adjudicacion/:id', component: null,
    //     children: [
    //         {
    //             path: '', component: BandejaAdjudicacionEvaluacionComponent
    //         },
    //         {
    //             path: 'adjudicar-plaza-evaluacion/:id/:idPersona', component: AdjudicarPlazaEvalComponent
    //         },
    //         {
    //             path: 'informacion-adjudicacion/:id/:idPersona/:idCalificacion', component: InformacionAdjudicacionEvalComponent
    //         }
    //     ]
    // },
];


@NgModule({
    declarations: [
        BandejaPrepublicacion30493Component, 
        ModalIniciarEtapaComponent,
        BandejaPrincipalComponent,
        ValidacionplazaComponent,
    ],
    imports: [
        MaterialModule,
        RouterModule.forChild(routes),
        MineduSharedModule,
        MineduSidebarModule,
        MineduComponentsModule,
        // DocumetoSustentoModule,
    
    ],
})
export class Contratacion30493Module {}
