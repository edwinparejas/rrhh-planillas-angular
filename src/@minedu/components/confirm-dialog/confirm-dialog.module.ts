import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { MineduConfirmDialogComponent } from '@minedu/components/confirm-dialog/confirm-dialog.component';

@NgModule({
    declarations: [
        MineduConfirmDialogComponent
    ],
    imports: [
        MatDialogModule,
        MatButtonModule
    ],
    entryComponents: [
        MineduConfirmDialogComponent
    ],
})
export class MineduConfirmDialogModule
{
}
