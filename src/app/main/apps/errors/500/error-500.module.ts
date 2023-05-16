import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MineduSharedModule } from '@minedu/shared.module';
import { Error500Component } from './error-500.component';


const routes = [
    {
        path     : '',
        component: Error500Component
    }
];

@NgModule({
    declarations: [
        Error500Component
    ],
    imports     : [
        RouterModule.forChild(routes),

        MineduSharedModule
    ]
})
export class Error500Module
{
}
