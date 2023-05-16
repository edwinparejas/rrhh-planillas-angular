import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ProcesosComponent } from "./procesos.component";

const routes: Routes = [
    {
        path: "",
        component: ProcesosComponent,
        children: [
            // {
            //     path: "gestion",
            //     loadChildren: () =>
            //         import("./gestion/gestion.module").then(
            //             (m) => m.GestionModule
            //         ),
            // },
            {
                path: "desarrollo",
                loadChildren: () =>
                    import("./desarrollo/desarrollo.module").then(
                        (m) => m.DesarrolloModule
                    ),
            },
            {
                path: "contratacion",
                loadChildren: () =>
                    import("./contratacion/contratacion.module").then(
                        (m) => m.ContratacionModule
                    ),
            },
            {
                path: "contratacion30493",
                loadChildren: () =>
                    import("./contratacion-30493/contratacion-30493.module").then(
                        (m) => m.Contratacion30493Module
                    ),
            },
            {
                path: "ascenso",
                loadChildren: () =>
                    import("./ascenso/ascenso.module").then(
                        (m) => m.AscensoModule
                    ),
            },
            {
                path: "designacion",
                loadChildren: () =>
                    import("./designacion/designacion.module").then(
                        (m) => m.DesignacionModule
                    ),
            },
            {
                path: "rotacion",
                loadChildren: () =>
                    import("./rotacion/rotacion.module").then(
                        (m) => m.RotacionModule
                    ),
            },
            {
                path: "reasignacion",
                loadChildren: () =>
                    import("./reasignacion/reasignacion.module").then(
                        (m) => m.ReasignacionModule
                    ),
            },
            {
                path: "nombramiento",
                loadChildren: () =>
                    import("./nombramiento/nombramiento.module").then(
                        (m) => m.NombramientoModule
                    ),
            },
            {
                path: "encargatura",
                loadChildren: () => import("./encargatura/encargatura.module").then((m) => m.EncargaturaModule)
            },
            {
                path: "cuadrohoras",
                loadChildren: () =>
                    import("./cuadro-horas/cuadro-horas.module").then(
                        (m) => m.CuadroHorasModule
                    ),
            },
            // {
            //     path: "cuadro-horas-30512",
            //     loadChildren: () => import("./cuadro-horas-30512/cuadro-horas-30512.module").then((m) => m.CuadroHorasModule30512)
            // },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProcesosRoutingModule {}
