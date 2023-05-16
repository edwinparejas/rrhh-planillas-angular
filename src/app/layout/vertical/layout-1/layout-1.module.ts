import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MineduSharedModule } from '@minedu/shared.module';

import { ContentModule } from 'app/layout/components/content/content.module';
import { FooterModule } from 'app/layout/components/footer/footer.module';
import { NavbarModule } from 'app/layout/components/navbar/navbar.module';
import { ToolbarModule } from 'app/layout/components/toolbar/toolbar.module';

import { VerticalLayout1Component } from 'app/layout/vertical/layout-1/layout-1.component';
import { MineduSidebarModule } from '@minedu/components/sidebar/sidebar.module';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
    declarations: [
        VerticalLayout1Component
    ],
    imports     : [
        RouterModule,

        MineduSharedModule,
        MineduSidebarModule,

        NgxSpinnerModule,
        
        ContentModule,
        FooterModule,
        NavbarModule,
        ToolbarModule
    ],
    exports     : [
        VerticalLayout1Component
    ]
})
export class VerticalLayout1Module
{
}
