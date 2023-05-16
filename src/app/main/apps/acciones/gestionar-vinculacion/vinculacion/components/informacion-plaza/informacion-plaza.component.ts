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
    selector: 'minedu-informacion-plaza',
    templateUrl: './informacion-plaza.component.html',
    styleUrls: ['./informacion-plaza.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
  })
  export class InformacionPlazaComponent implements OnInit {
  
    form: FormGroup;
    working: boolean = false;
    plaza: any = {};

    Valorclose = {
        observar: false
      };

    constructor(
        public matDialogRef: MatDialogRef<InformacionPlazaComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: FormBuilder,
        private dataService: DataService,
        private router: Router,
      ) { }

    ngOnInit(): void {
        
        if(this.data){
            console.log(this.data);
            this.plaza = this.data.plaza;

          }        
    }
       
    handleCancelar() {
        debugger;
        this.matDialogRef.close(this.Valorclose);
      }
  
  }
  