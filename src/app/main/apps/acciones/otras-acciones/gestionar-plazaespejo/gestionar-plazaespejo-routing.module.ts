import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionPlazaespejoComponent } from './gestion-plazaespejo.component';
import { MainComponent } from './components/main/main.component';

const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        children: [
            {
                path: '', component: GestionPlazaespejoComponent,
            },
           
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionarPlazaespejoRoutingModule { }
