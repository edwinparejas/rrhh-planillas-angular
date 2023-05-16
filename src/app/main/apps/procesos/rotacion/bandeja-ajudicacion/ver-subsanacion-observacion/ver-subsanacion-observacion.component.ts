import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-ver-subsanacion-observacion',
  templateUrl: './ver-subsanacion-observacion.component.html',
  styleUrls: ['./ver-subsanacion-observacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class VerSubsanacionObservacionComponent implements OnInit {


  item: any = null;

  constructor(
    public matDialogRef: MatDialogRef<VerSubsanacionObservacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any

  ) { }

  ngOnInit(): void {
    this.item = this.data;
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };
}

