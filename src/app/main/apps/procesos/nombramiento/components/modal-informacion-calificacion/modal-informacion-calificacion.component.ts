import { Component, OnInit, ViewEncapsulation, Inject, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { mineduAnimations } from '@minedu/animations/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CalificacionResponseModel } from '../../models/calificacion.model';
import { DataService } from 'app/core/data/data.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { CalificacionResultadoResponseModel } from '../../models/calificacion-resultado.model';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'minedu-modal-informacion-calificacion',
    templateUrl: './modal-informacion-calificacion.component.html',
    styleUrls: ['./modal-informacion-calificacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations,
  })
  export class ModalInformacionCalificacionComponent implements OnInit, AfterViewInit {

    modal = {
      icon: "",
      title: "",
      action: "",
      info: null,
      editable: false
    }
    
    displayedColumns: string[] = [
      'codigoCriterio',        
      'descripcionCriterio',
      'puntajeObtenido',
    ];
    dataSource: CalificacionResultadoResponseModel[];

    idCalificacion: number;
    calificacion: CalificacionResponseModel = new CalificacionResponseModel();
  
    isMobile = false;
    getIsMobile(): boolean {
      const w = document.documentElement.clientWidth;
      const breakpoint = 992;
      if (w < breakpoint) {
        return true;
      } else {
        return false;
      }
    }
  
    constructor(
      public matDialogRef: MatDialogRef<ModalInformacionCalificacionComponent>,
      private dataService: DataService,
      @Inject(MAT_DIALOG_DATA) private data: any) {
    }
  
    ngOnInit(): void {
      this.buildForm();
      this.obtenerCalificacion();
      this.obtenerCalificacionResultado();
    }
  
    ngAfterViewInit() {
    }
  
    buildForm() {
      this.initialize();
    }
  
    initialize() {
      this.modal = this.data.modal;
      this.idCalificacion = this.data.idCalificacion;
    }

    handleCancelar(data?: any) {
      this.matDialogRef.close(data);
    }

    obtenerCalificacion = () => {
      this.dataService
      .Nombramiento()
      .getCalificacion(this.idCalificacion)
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
          if (response) {
              this.calificacion = response;
          }
      });
    }

    obtenerCalificacionResultado = () => {
      this.dataService
      .Nombramiento()
      .getCalificacionResultado(this.idCalificacion)
      .pipe(
          catchError(() => of([])),
          finalize(() => { })
      )
      .subscribe((response: any) => {
        
          if (response) {
              this.dataSource = response;

              let temp = {} as CalificacionResultadoResponseModel;
              temp.codigoCriterio= '';
              temp.descripcionCriterio= 'PUNTAJE FINAL';
              temp.puntajeObtenido= this.dataSource[this.dataSource.length-1].puntajeTotalRubro;

              this.dataSource.push(temp);
          }
      });
    }
  
  }