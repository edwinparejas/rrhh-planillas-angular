import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LicenciasOtrasComponent } from './licencias-otras.component';

const routes: Routes = [
    {
        path: '',
        component: LicenciasOtrasComponent,
        children: [
            { path: '', redirectTo: 'informacion', pathMatch: 'full' },
            {
                path: 'informacion',
                loadChildren: () =>
                    import(
                        './control-licencia/control-licencia.module'
                    ).then((m) => m.ControlLicenciaModule),

            },
            /*
            {
                path: 'bandeja-licencia-otra',
                loadChildren: () =>
                    import(
                        './gestion-licencia-otra/gestion-licencia-otra.module'
                    ).then((m) => m.GestionLicenciaOtraModule)                
            },
            */

        ],

    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LicenciasOtrasRoutingModule { }
