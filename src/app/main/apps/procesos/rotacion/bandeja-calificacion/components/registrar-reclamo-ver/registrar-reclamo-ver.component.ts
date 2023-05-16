import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';


@Component({
  selector: 'minedu-registrar-reclamo-ver',
  templateUrl: './registrar-reclamo-ver.component.html',
  styleUrls: ['./registrar-reclamo-ver.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations,
})
export class RegistrarReclamoVerComponent implements OnInit {

  item: any = null;

  constructor(
    public matDialogRef: MatDialogRef<RegistrarReclamoVerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.item = this.data;
  }

  handleCancel = () => {
    this.matDialogRef.close();
  };

}

