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
    selector: 'minedu-solicitar-autorizacion',
    templateUrl: './solicitar-autorizacion.component.html',
    styleUrls: ['./solicitar-autorizacion.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: mineduAnimations
  })
  export class SolicitarAutorizacionComponent implements OnInit {
  
    form: FormGroup;
    working: boolean = false;
    dialogTitle: string = '';
  
    NuevoRegistro: boolean = true;
   
  
    Valorclose = {
      IsConfirmacion: false
    };
  
    constructor(
      public matDialogRef: MatDialogRef<SolicitarAutorizacionComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private router: Router,
    ) { }
  
    ngOnInit(): void {       
      this.working=true;
    }
  
    buildForm() {
      this.form = this.formBuilder.group({
        observacion: [null, Validators.required]
      });
    }
  
    handleConfirmar = () => {
      this.Valorclose.IsConfirmacion = true;
      this.matDialogRef.close(this.Valorclose);
    }
    
    handleCancelConfirmacion = () => {
      this.matDialogRef.close(this.Valorclose);
    }
  
  }
  