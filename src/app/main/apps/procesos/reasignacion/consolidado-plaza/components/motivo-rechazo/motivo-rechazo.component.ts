import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';

@Component({
  selector: 'minedu-motivo-rechazo',
  templateUrl: './motivo-rechazo.component.html',
  styleUrls: ['./motivo-rechazo.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class MotivoRechazoComponent implements OnInit {

    dialogTitle = 'Motivo de rechazo';
    working = false;
    detalleConsolidado: string;

    constructor(
        public matDialogRef: MatDialogRef<MotivoRechazoComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) { this.detalleConsolidado = data.detalle }

    ngOnInit(): void {
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }
}
