import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MotivoCancelacionModal } from '../../models/reasignacion.model';

@Component({
  selector: 'minedu-motivo-cancelacion',
  templateUrl: './motivo-cancelacion.component.html',
  styleUrls: ['./motivo-cancelacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class MotivoCancelacionComponent implements OnInit {

  idep: number;
  motivoCancelacion: MotivoCancelacionModal = new MotivoCancelacionModal();

  //DialogData;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    public matDialogRef: MatDialogRef<MotivoCancelacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {action: string, id: number}
  ) { }

  ngOnInit(): void {
    this.idep = this.data.id;
    
    this.buscarMotivoCancelacion();
  }
  
  dato = {
    id: 0
  }

  setDato = () => {
    this.dato = {
      id: Number(this.idep)
    }
  }

  buscarMotivoCancelacion = () => {
    this.setDato();
    this.dataService.Reasignaciones()
      .getBuscarCancelacionEtapaProceso(this.dato)
      .pipe(
        catchError(() => of([])),
        finalize(() => { })
      )
      .subscribe((response: any) => {
        if (response) {
          this.motivoCancelacion = response[0];
        }
      });
  }


  handleCancel = () =>{
    this.matDialogRef.close();
  }

}
