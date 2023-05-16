import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';

@Component({
  selector: 'minedu-motivo-cancelacion',
  templateUrl: './motivo-cancelacion.component.html',
  styleUrls: ['./motivo-cancelacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class MotivoCancelaciionComponent implements OnInit {

    dialogTitle = 'Motivo de cancelacion';
    working = false;
    detalleCancelacion: string;

    constructor(
        public matDialogRef: MatDialogRef<MotivoCancelaciionComponent>,
        private dataService: DataService,
        @Inject(MAT_DIALOG_DATA) private data: any,
    ) { 
        this.detalleCancelacion = data.detalle.motivoCancelacion
        console.log("motivocancelacion", this.detalleCancelacion);
        }

    ngOnInit(): void {
    }

    handleCancel = () => {
        this.matDialogRef.close();
    }
}
