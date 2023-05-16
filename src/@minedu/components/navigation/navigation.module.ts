import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';


import { MineduNavigationComponent } from './navigation.component';
import { MineduNavVerticalItemComponent } from './vertical/item/item.component';
import { MineduNavVerticalCollapsableComponent } from './vertical/collapsable/collapsable.component';
import { MineduNavVerticalGroupComponent } from './vertical/group/group.component';
import { MineduNavHorizontalItemComponent } from './horizontal/item/item.component';
import { MineduNavHorizontalCollapsableComponent } from './horizontal/collapsable/collapsable.component';

@NgModule({
    imports     : [
        CommonModule,
        RouterModule,

        MatIconModule,
        MatRippleModule,

    ],
    exports     : [
        MineduNavigationComponent
    ],
    declarations: [
        MineduNavigationComponent,
        MineduNavVerticalGroupComponent,
        MineduNavVerticalItemComponent,
        MineduNavVerticalCollapsableComponent,
        MineduNavHorizontalItemComponent,
        MineduNavHorizontalCollapsableComponent
    ]
})
export class MineduNavigationModule
{
}
