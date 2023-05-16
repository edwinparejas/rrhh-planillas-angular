import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-ver-subsanar-observacion',
  templateUrl: './ver-subsanar-observacion.component.html',
  styleUrls: ['./ver-subsanar-observacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class VerSubsanarObservacionComponent implements OnInit {

    item: any = null;

    constructor(
      public matDialogRef: MatDialogRef<VerSubsanarObservacionComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any
  
    ) { }
  
    ngOnInit(): void {
      this.item = this.data;
    }
  
    handleCancel = () => {
      this.matDialogRef.close();
    };
  }
  
  