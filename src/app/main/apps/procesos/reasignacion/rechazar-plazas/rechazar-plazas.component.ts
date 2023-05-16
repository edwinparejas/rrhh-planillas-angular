import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';

@Component({
  selector: 'minedu-rechazar-plazas',
  templateUrl: './rechazar-plazas.component.html',
  styleUrls: ['./rechazar-plazas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class RechazarPlazasComponent implements OnInit {

  constructor(
    public MatDialogRef: MatDialogRef<RechazarPlazasComponent>
  ) { }

  ngOnInit(): void {
  }

  handleCancel = () => {
    this.MatDialogRef.close();
  }

}
