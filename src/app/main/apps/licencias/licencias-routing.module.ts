import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'maternidad',
                loadChildren: () =>
                    import('./licencias-bienestar/gestion-licencia.module').then(
                        (m) => m.GestionLicenciaModule
                    ),
            },            
            {
                path: 'otros',
                loadChildren: () =>
                    import('./licencias-otras/licencias-otras.module').then(
                        (m) => m.LicenciasOtrasModule
                    ),
            },

        ],
    },
];

/*
const routes: Routes = [
    {
        path: "gestion-licencia",
        children: [
            // { path: "", redirectTo: "licencias", pathMatch: "full" },
            {
                path: "",
                loadChildren: () =>
                    import("./salud-maternidad/gestion-licencia.module").then(
                        (m) => m.GestionLicenciaModule
                    ),
            },
        ],
    },
    {
        path: "licencias-otras",
        children: [
            {
                path: "",
                loadChildren: () =>
                    import("./licencias-otras/licencias-otras.module").then(
                        (m) => m.LicenciasOtrasModule
                    ),
            },
        ],
    },
];
*/

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LicenciasRoutingModule { }
