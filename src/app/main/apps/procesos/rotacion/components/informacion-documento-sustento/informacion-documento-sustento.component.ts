import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-informacion-documento-sustento',
  templateUrl: './informacion-documento-sustento.component.html',
  styleUrls: ['./informacion-documento-sustento.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class InformacionDocumentoSustentoComponent implements OnInit {

  d: any = null;

  constructor(
    public matDialogRef: MatDialogRef<InformacionDocumentoSustentoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.d = this.data.documento;
  }


}
