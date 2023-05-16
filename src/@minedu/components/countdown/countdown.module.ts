import { NgModule } from '@angular/core';

import { MineduCountdownComponent } from '@minedu/components/countdown/countdown.component';

@NgModule({
    declarations: [
        MineduCountdownComponent
    ],
    exports: [
        MineduCountdownComponent
    ],
})
export class MineduCountdownModule
{
}
