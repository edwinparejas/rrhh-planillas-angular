import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

import { MineduSharedModule } from '@minedu/shared.module';

import { ContentModule } from 'app/layout/components/content/content.module';
import { FooterModule } from 'app/layout/components/footer/footer.module';
import { NavbarModule } from 'app/layout/components/navbar/navbar.module';
import { ToolbarModule } from 'app/layout/components/toolbar/toolbar.module';

import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { HorizontalLayoutComponent } from './horizontal-layout.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
    declarations: [
        HorizontalLayoutComponent
    ],
    imports     : [
        MatSidenavModule,

        MineduSharedModule,
        MineduSidebarModule,

        NgxSpinnerModule,
        
        ContentModule,
        FooterModule,
        NavbarModule,
        ToolbarModule
    ],
    exports     : [
        HorizontalLayoutComponent
    ]
})
export class HorizontalLayoutModule
{
}
