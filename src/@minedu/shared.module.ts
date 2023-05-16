import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';

import { MineduDirectivesModule } from '@minedu/directives/minedu-directives.module';
import { MineduPipesModule } from '@minedu/pipes/pipes.module';

@NgModule({
    imports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,

        MineduDirectivesModule,
        MineduPipesModule
    ],
    exports  : [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FlexLayoutModule,

        MineduDirectivesModule,
        MineduPipesModule
    ]
})
export class MineduSharedModule
{
}
