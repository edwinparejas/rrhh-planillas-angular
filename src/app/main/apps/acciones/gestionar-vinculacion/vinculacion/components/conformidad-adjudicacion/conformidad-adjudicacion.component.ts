import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { mineduAnimations } from '@minedu/animations/animations';
import { DataService } from 'app/core/data/data.service';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { InformacionPlazaComponent } from '../informacion-plaza/informacion-plaza.component';
import { ObservarVinculacionComponent } from '../observar-vinculacion/observar-vinculacion.component';

@Component({
  selector: 'minedu-conformidad-adjudicacion',
  templateUrl: './conformidad-adjudicacion.component.html',
  styleUrls: ['./conformidad-adjudicacion.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: mineduAnimations
})
export class ConformidadAdjudicacionComponent implements OnInit {

  form: FormGroup;
  working: boolean = false;
  plaza: any = {};
  persona: any = {};
  idPlaza = 0;
  id_adjudicacion_proceso_persona = 0;
  Valorclose = {
      observar: false,
      confirmar: false
    };
  constructor(
      public matDialogRef: MatDialogRef<ConformidadAdjudicacionComponent>,
      @Inject(MAT_DIALOG_DATA) private data: any,
      private formBuilder: FormBuilder,
      private dataService: DataService,
      private router: Router,
      private materialDialogAdjudicacion: MatDialog,
      private materialDialog: MatDialog
    ) { }
  ngOnInit(): void {
      debugger;
      if(this.data){
          
          this.persona = this.data.persona;
          this.idPlaza = this.data.idPlaza;
          this.id_adjudicacion_proceso_persona = this.data.id_adjudicacion_proceso_persona
        }        
      // Buscar Plaza
      this.onBuscarPlazaPorId();

  }

  onBuscarPlazaPorId() {
    const idPlaza = this.idPlaza ;
    
    this.dataService.Spinner().show("sp6");
    this.dataService.AccionesVinculacion().getPlazaPorId(idPlaza).pipe(
      catchError(() => of(null)),
      finalize(() => { this.dataService.Spinner().hide("sp6"); })
    ).subscribe(response => {
      if (response) {

        this.plaza = response;
        
      } else {
        this.dataService.Message().msgWarning('"DATOS NO ENCONTRADOS PARA LA PLAZA INGRESADA."', () => { });
        this.plaza = null;
      }
    });
  }


  verInformacionPlazaAdjudicacion() {

    debugger;
      let dialogRefInformacion = this.materialDialogAdjudicacion.open(InformacionPlazaComponent, {
        panelClass: 'Minedu-informacion-plaza-dialog',
          disableClose: true,
          data: {
            plaza: this.plaza
          }
      });
      dialogRefInformacion.afterClosed()
      .subscribe((response: any) => {
        if (!response) {
          return;
        }
        console.log(response);
      });
    }
     
    handleCancelar() {
      debugger;
      this.matDialogRef.close(this.Valorclose);
    }   
    handleSeleccionar() {
      debugger;
      this.Valorclose = {
          observar: false,
          confirmar: true
        };
      this.matDialogRef.close(this.Valorclose);
    }   
    
    handleObservar() {
        
        let data = this.data.infoRegistro //this.getDataView();
    
        let dialogRefObservacion = this.materialDialog.open(ObservarVinculacionComponent, {
          panelClass: 'Minedu-observar-accion-desplazamiento-dialog',
            disableClose: true,
            data: {
              id_gestion_vinculacion: 0,
              is_saved: false,
              info: data,
              dialogTitle: 'Observar la Adjudicación'
            }
        });
        dialogRefObservacion.afterClosed()
        .subscribe((response: any) => {
          if (!response) {
            return;
          }

          if(response.observar) {
            this.matDialogRef.close();
          }
          console.log(response);
        });
      }



}
  