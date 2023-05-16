import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "app/core/guard/auth.guard";
import { AppsComponent } from "./apps.component";

const routes: Routes = [
    {
        path: "",
        component: AppsComponent,
        // canActivate: [AuthGuard],
        children: [
            { path: "", redirectTo: "inicio", pathMatch: "full" },
            {
                path: "inicio",
                //canActivate: [AuthGuard],
                loadChildren: () =>
                    import(
                        "./personal-dashboard/personal-dashboard.module"
                    ).then((m) => m.PersonalDashboardModule),
            },
            {
                path: "procesospersonal/gestion",
                //canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./gestion/gestion.module").then(
                        (m) => m.GestionModule
                    ),
            },
            {
                path: "procesospersonal/procesos",
                //canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./procesos/procesos.module").then(
                        (m) => m.ProcesosModule
                    ),
            },
            {
                path: "asistencia",
                //canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./asistencia/asistencia.module").then(
                        (m) => m.AsistenciaModule
                    ),
            },
            {
                path: "historialpersonal",
                //canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./historial-personal/historial-personal.module").then(
                        (m) => m.HistorialPersonalModule
                    ),
            },
            {
                path: "licencias",
                //canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./licencias/licencias.module").then(
                        (m) => m.LicenciasModule
                    ),
            },
            {
                path: "bandejas",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./bandejas/bandejas.module").then(
                        (m) => m.BandejasModule
                    ),
            },
            {
                path: "acciones",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./acciones/acciones.module").then(
                        (m) => m.AccionesModule
                    ),
            },
            {
                path: "accionesgrabadas",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./acciones-grabadas/acciones-grabadas.module").then(
                        (m) => m.AccionesGrabadasModule
                    ),
            },
            {
                path: "proyectoresolucion",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import(
                        "./proyecto-resolucion/proyecto-resolucion.module"
                    ).then((m) => m.ProyectoResolucionModule),
            },
            {
                path: "sanciones",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./sanciones/sanciones.module").then(
                        (m) => m.SancionesModule
                    ),
            },
            {
                path: "atender-solicitud",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import(
                        "./reusables/atender-Solicitud/atender-solicitud.module"
                    ).then((m) => m.AtenderSolicitudModule),
            },
            {
                path: "reportes",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./reportes-cap/reportes-cap.module").then(
                        (m) => m.ReportesCAPModule
                    ),
            },
            {
                path: "planillas",
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import("./planilla/planilla.module").then(
                        (m) => m.PlanillaModule
                    ),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AppsRoutingModule {}
