import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';

@Component({
    selector: 'minedu-informacion-vacaciones',
    templateUrl: './informacion-vacaciones.component.html',
    styleUrls: ['./informacion-vacaciones.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
  })
  export class InformacionVacacionesComponent implements OnInit {
  
    form: FormGroup;
    working: boolean = false;
    historial: any = {};
    VACACIONES_DATAGRID: tblGridGrab[] = []; 

    Valorclose = {
        observar: false
      };

      displayedColumns: string[] = [
        'nro',
        'periodo_vacacional',
        'fecha_inicio',
        'fecha_termino',
        'cantidad_dias'
      ];

    constructor(
        public matDialogRef: MatDialogRef<InformacionVacacionesComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private router: Router,
      ) { }

    ngOnInit(): void {
        
debugger;

        if(this.data){
            console.log(this.data);
            this.historial = this.data.historial;
          }  

          for (var i = 0; i < this.historial.detalleVacaciones.length ; i++) {
            let item: tblGridGrab = {
              periodoVacacional: this.historial.detalleVacaciones[i].periodoVacacional,
              fechaInicio: this.historial.detalleVacaciones[i].fechaInicio,
              fechaTermino: this.historial.detalleVacaciones[i].fechaTermino,
              cantidadDias: this.historial.detalleVacaciones[i].cantidadDias,
            };
            console.log("seccion", item);
            this.VACACIONES_DATAGRID.push(item);
          }

          
    }

    handleCancelar() {
      debugger;
      this.matDialogRef.close(this.Valorclose);
    }

    
  
  }

  export interface tblGridGrab {

    periodoVacacional: string,
    fechaInicio: string,
    fechaTermino: string,
    cantidadDias: string

  }
  
  