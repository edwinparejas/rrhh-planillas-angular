import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                loadChildren: () =>
                    import('./gestion-sanciones/gestion-sanciones.module').then(
                        (m) => m.GestionSancionesModule
                    ),
            }        
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SancionesRoutingModule { }
