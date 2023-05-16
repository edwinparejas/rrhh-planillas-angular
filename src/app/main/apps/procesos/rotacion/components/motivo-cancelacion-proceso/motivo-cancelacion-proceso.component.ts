import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-motivo-cancelacion-proceso',
  templateUrl: './motivo-cancelacion-proceso.component.html',
  styleUrls: ['./motivo-cancelacion-proceso.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class MotivoCancelacionProcesoComponent implements OnInit {

  proceso = null;
  constructor(public matDialogRef: MatDialogRef<MotivoCancelacionProcesoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,) { }

  ngOnInit(): void {
    this.proceso = this.data;
  }

}
