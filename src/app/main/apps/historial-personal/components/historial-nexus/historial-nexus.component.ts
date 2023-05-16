import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
    selector: 'minedu-historial-nexus',
    templateUrl: './historial-nexus.component.html',
    styleUrls: ['./historial-nexus.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
  })
  export class HistorialNexusComponent implements OnInit {
  
    form: FormGroup;
    working: boolean = false;
    historial: any = {};

    Valorclose = {
        observar: false
      };

    constructor(
        public matDialogRef: MatDialogRef<HistorialNexusComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private router: Router,
      ) { }

    ngOnInit(): void {
      this.form = this.formBuilder.group({
        textoHistorial: [{ value: '', disabled: true }]
      });

        if(this.data){
            console.log(this.data);
            this.historial = this.data.historial;

            this.form.patchValue({
              textoHistorial: [this.historial.texto_historial ?? "Sin Registro"],
            })

          }        
    }
       
    handleCancelar() {
        debugger;
        this.matDialogRef.close(this.Valorclose);
      }
  
  }
  