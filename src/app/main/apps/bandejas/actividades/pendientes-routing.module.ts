import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PendientesComponent } from './pendientes.component';

const routes: Routes = [
    {
        path: '',
        component: PendientesComponent,
        children: [
            { path: '', redirectTo: 'informacion', pathMatch: 'full' },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PendientesRoutingModule { }
