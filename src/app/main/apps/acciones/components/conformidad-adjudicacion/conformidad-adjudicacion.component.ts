import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { InformacionVinculacionComponent } from '../informacion-vinculacion/informacion-vinculacion.component';
import { ObservarAdjudicacionComponent } from '../observar-adjudicacion/observar-adjudicacion.component';

@Component({
  selector: 'minedu-conformidad-adjudicacion',
  templateUrl: './conformidad-adjudicacion.component.html',
  styleUrls: ['./conformidad-adjudicacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ConformidadAdjudicacionComponent implements OnInit {

  adjudicacion: any = {};

  dialogRefConfAdju: any;
  constructor(
    public matDialogRef: MatDialogRef<ConformidadAdjudicacionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private materialDialog: MatDialog,
    private dataService: DataService) { }

  ngOnInit(): void {
  }


  handleEsConforme() {
    this.dialogRefConfAdju = this.materialDialog.open(InformacionVinculacionComponent, {
      panelClass: 'vinculacion-form-dialog',
      disableClose: true,
      data: {
      }
    });

    this.dialogRefConfAdju.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log(response);
      });
  }

  handleNoConforme() {
    this.dialogRefConfAdju = this.materialDialog.open(ObservarAdjudicacionComponent, {
      panelClass: 'observar-adjudicacion-form-dialog',
      disableClose: true,
      data: {
      }
    });

    this.dialogRefConfAdju.afterClosed()
      .subscribe((response: any) => {
        debugger;
        if(response.observado) {
          this.dialogRefConfAdju.close();
        }

        if (!response) {
          return;
        }        

        console.log(response);
      });
  }
}
