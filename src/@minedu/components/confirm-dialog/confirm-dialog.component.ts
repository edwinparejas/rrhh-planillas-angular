import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector   : 'minedu-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls  : ['./confirm-dialog.component.scss']
})
export class MineduConfirmDialogComponent
{
    public confirmMessage: string;

    constructor(
        public dialogRef: MatDialogRef<MineduConfirmDialogComponent>
    )
    {
    }

}
