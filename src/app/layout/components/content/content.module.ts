import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MineduSharedModule } from '@minedu/shared.module';

import { ContentComponent } from 'app/layout/components/content/content.component';

@NgModule({
    declarations: [
        ContentComponent
    ],
    imports     : [
        RouterModule,
        MineduSharedModule
    ],
    exports     : [
        ContentComponent
    ]
})
export class ContentModule
{
}
