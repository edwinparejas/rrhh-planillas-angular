import { NgModule } from '@angular/core';

import { MineduSidebarComponent } from './sidebar.component';

@NgModule({
    declarations: [
        MineduSidebarComponent
    ],
    exports     : [
        MineduSidebarComponent
    ]
})
export class MineduSidebarModule
{
}
