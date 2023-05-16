import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MineduSharedModule } from '@minedu/shared.module';

import { ToolbarComponent } from 'app/layout/components/toolbar/toolbar.component';
import { MineduSearchBarModule } from '@minedu/components/search-bar/search-bar.module';
import { MineduShortcutsModule } from '@minedu/components/shortcuts/shortcuts.module';
import { RolMenuComponent } from './rol-menu/rol-menu.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';

@NgModule({
    declarations: [
        ToolbarComponent,
        RolMenuComponent,
        UserMenuComponent
    ],
    imports     : [
        RouterModule,
        MatButtonModule,
        MatDialogModule,
        MatCardModule,        
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatListModule,
        MatSlideToggleModule,
        MatTableModule,

        MineduSharedModule,
        MineduSearchBarModule,
        MineduShortcutsModule
    ],
    exports     : [
        ToolbarComponent
    ]
})
export class ToolbarModule
{
}
