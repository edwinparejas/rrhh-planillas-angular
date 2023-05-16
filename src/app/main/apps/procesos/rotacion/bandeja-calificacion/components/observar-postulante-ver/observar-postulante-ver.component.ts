import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-observar-postulante-ver',
  templateUrl: './observar-postulante-ver.component.html',
  styleUrls: ['./observar-postulante-ver.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class ObservarPostulanteVerComponent implements OnInit {

  item: any = null;

  constructor(
    public matDialogRef: MatDialogRef<ObservarPostulanteVerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any

  ) { }

  ngOnInit(): void {
    this.item = this.data;
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };
}

