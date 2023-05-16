import { NgModule } from '@angular/core';

import { MineduIfOnDomDirective } from '@minedu/directives/minedu-if-on-dom/minedu-if-on-dom.directive';
import { MineduInnerScrollDirective } from '@minedu/directives/minedu-inner-scroll/minedu-inner-scroll.directive';
import { MineduPerfectScrollbarDirective } from '@minedu/directives/minedu-perfect-scrollbar/minedu-perfect-scrollbar.directive';
import { MineduMatSidenavHelperDirective, MineduMatSidenavTogglerDirective } from '@minedu/directives/minedu-mat-sidenav/minedu-mat-sidenav.directive';

@NgModule({
    declarations: [
        MineduIfOnDomDirective,
        MineduInnerScrollDirective,
        MineduMatSidenavHelperDirective,
        MineduMatSidenavTogglerDirective,
        MineduPerfectScrollbarDirective
    ],
    imports     : [],
    exports     : [
        MineduIfOnDomDirective,
        MineduInnerScrollDirective,
        MineduMatSidenavHelperDirective,
        MineduMatSidenavTogglerDirective,
        MineduPerfectScrollbarDirective
    ]
})
export class MineduDirectivesModule
{
}
