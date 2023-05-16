import { NgModule } from '@angular/core';

import { MineduWidgetComponent } from './widget.component';
import { MineduWidgetToggleDirective } from './widget-toggle.directive';

@NgModule({
    declarations: [
        MineduWidgetComponent,
        MineduWidgetToggleDirective
    ],
    exports     : [
        MineduWidgetComponent,
        MineduWidgetToggleDirective
    ],
})
export class MineduWidgetModule
{
}
