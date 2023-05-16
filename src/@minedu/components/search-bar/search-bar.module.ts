import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MineduSearchBarComponent } from './search-bar.component';

@NgModule({
    declarations: [
        MineduSearchBarComponent
    ],
    imports     : [
        CommonModule,
        RouterModule,

        MatButtonModule,
        MatIconModule
    ],
    exports     : [
        MineduSearchBarComponent
    ]
})
export class MineduSearchBarModule
{
}
