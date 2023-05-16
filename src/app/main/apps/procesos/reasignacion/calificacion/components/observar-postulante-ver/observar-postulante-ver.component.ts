import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { isArray } from 'lodash';

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
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dataService: DataService

  ) { }

  ngOnInit(): void {
    setTimeout(() => {
        this.dataService.Spinner().show("sp6");
        this.buildData();
      }, 0);
  }

  private buildData = () => {
    const data = {idCalificacionDetalle: this.data.idCalificacionDetalle}
    this.dataService
    .Reasignaciones()
    .obtenerObservacionPostulante(data)
      .pipe(
        catchError((e) => { return  this.configCatch(e);  }),
        finalize(() => {
          this.dataService.Spinner().hide("sp6");
        })
      ).subscribe((response: any) => {
        if (response) {
            this.item = response;
        }
      });
  };

  handleCancel = () => {
    this.matDialogRef.close();
  };

  configCatch(e: any) { 
    if (e && e.status === 400 && isArray(e.messages)) {
      this.dataService.Util().msgWarning(e.messages[0], () => { });
    } else if(isArray(e.messages)) {
            if((e.messages[0]).indexOf("HUBO UN PROBLEMA AL PROCESAR LA SOLICITUD")!=-1)
                this.dataService.Util().msgError(e.messages[0], () => { }); 
            else
                this.dataService.Util().msgWarning(e.messages[0], () => { }); 
                
    }else{
        this.dataService.Util().msgError('Error recuperando datos del servidor, por favor intente dentro de unos segundos, gracias.', () => { });
    }
    this.dataService.Spinner().hide("sp6");
    return of(e) 
  }
}

