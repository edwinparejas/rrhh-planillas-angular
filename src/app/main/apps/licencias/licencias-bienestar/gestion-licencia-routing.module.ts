import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { SaludMaternidadModule } from './gestion-licencia/salud-maternidad.module';
import { GestionLicenciaComponent } from './gestion-licencia.component';

const routes: Routes = [
    {
        path: '',
        component: GestionLicenciaComponent,
        children: [
            { path: '', redirectTo: 'informacion', pathMatch: 'full' },
            {
                path: 'informacion',
                loadChildren: () =>
                    import('./gestion-licencia/salud-maternidad.module').then(
                        (m) => m.SaludMaternidadModule
                    ),
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GestionLicenciaRoutingModule {}
